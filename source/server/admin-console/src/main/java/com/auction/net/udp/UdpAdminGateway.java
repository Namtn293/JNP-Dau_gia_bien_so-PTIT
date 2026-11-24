package com.auction.net.udp;

import java.net.InetSocketAddress;
import java.net.SocketException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.auction.AdminConfig;
import com.auction.gateway.AdminGateway;
import com.auction.model.AdminSession;
import com.auction.model.AvailablePlateInfo;
import com.auction.model.CommandResult;
import com.auction.model.ConnectionState;
import com.auction.model.ParticipantInfo;
import com.auction.model.RoomInfo;
import com.auction.model.RoomStatus;
import com.auction.model.ServerMetrics;
import com.auction.net.tcp.TcpControlClient;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.IOException;
import com.auction.model.CreateSessionRequest;

/**
 * Gateway dùng số liệu thật từ UDP (CPU, RAM, Online từ METRICS; RTT từ
 * PingProbe),
 * danh sách phòng thật qua HTTP API Core Service và lệnh điều khiển qua Raw TCP
 * 9090.
 */
public final class UdpAdminGateway implements AdminGateway, AutoCloseable {
    private static final Logger log = LoggerFactory.getLogger(UdpAdminGateway.class);

    /**
     * Nhận cảnh báo. Gọi trên luồng nền, cần invokeLater khi cập nhật giao diện.
     */
    public interface AlertListener {
        /** level: CRITICAL, WARNING hoặc RESOLVED. metric: cpu, ram, core hoặc rtt. */
        void onAlert(String level, String metric, double value, double threshold);
    }

    private static final long ROOMS_CACHE_TTL_MS = 500L;
    private static final long PARTICIPANTS_CACHE_TTL_MS = 500L;

    private record Snapshot(ServerMetrics metrics, long receivedAt) {
    }

    private record CachedValue<T>(T value, long fetchedAtMs) {
    }

    private final TcpControlClient tcpClient = new TcpControlClient(AdminConfig.CORE_HOST, AdminConfig.RAW_TCP_PORT);
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(6))
            .build();
    private final List<AlertListener> alertListeners = new CopyOnWriteArrayList<>();
    private final RttMonitor rttMonitor = new RttMonitor(AdminConfig.RTT_WARN_MS, AdminConfig.RTT_CRIT_MS,
            this::publish);

    private final UdpMetricsListener metricsListener;
    private final PingProbe pingProbe;
    private final Object roomsFetchLock = new Object();
    private final Map<String, CachedValue<List<ParticipantInfo>>> participantsCache = new ConcurrentHashMap<>();
    private final Map<String, CompletableFuture<List<ParticipantInfo>>> participantsInFlight = new ConcurrentHashMap<>();

    private volatile Snapshot latest;
    private volatile CachedValue<List<RoomInfo>> cachedRooms;
    private volatile int rttMs;
    private volatile long rttAt;
    private volatile String adminJwt;

    public UdpAdminGateway() {
        try {
            metricsListener = new UdpMetricsListener(AdminConfig.UDP_PORT, new UdpMetricsListener.Listener() {
                @Override
                public void onMetrics(ServerMetrics metrics, long receivedAt) {
                    latest = new Snapshot(metrics, receivedAt);
                }

                @Override
                public void onAlert(String level, String metric, double value, double threshold) {
                    log.warn("ALERT {} metric={} value={} threshold={}", level, metric, value, threshold);
                    publish(level, metric, value, threshold);
                }
            });

            pingProbe = new PingProbe(
                    new InetSocketAddress(AdminConfig.UDP_SERVER_HOST, AdminConfig.UDP_PING_PORT),
                    new PingProbe.Listener() {
                        @Override
                        public void onRtt(int ms) {
                            rttMs = ms;
                            rttAt = System.currentTimeMillis();
                            rttMonitor.update(ms);
                        }

                        @Override
                        public void onTimeout(long seq) {
                            log.debug("PING seq={} không có PONG", seq);
                        }
                    });
        } catch (SocketException e) {
            throw new IllegalStateException("Không mở được socket UDP (cổng "
                    + AdminConfig.UDP_PORT + " có thể đang được dùng): " + e.getMessage(), e);
        }

        metricsListener.start();
        pingProbe.start(AdminConfig.PING_INTERVAL_MS);
    }

    public void addAlertListener(AlertListener listener) {
        alertListeners.add(listener);
    }

    private void publish(String level, String metric, double value, double threshold) {
        for (AlertListener l : alertListeners) {
            l.onAlert(level, metric, value, threshold);
        }
    }

    /**
     * Gộp METRICS mới nhất với RTT mới nhất. Nếu một trong hai đã quá hạn thì báo
     * lỗi,
     * giao diện sẽ hiển thị "—" như khi mất kết nối.
     */
    @Override
    public CompletableFuture<ServerMetrics> fetchMetrics() {
        return CompletableFuture.supplyAsync(() -> {
            long now = System.currentTimeMillis();
            Snapshot s = latest;

            if (s == null || now - s.receivedAt() > AdminConfig.DATA_STALE_MS) {
                throw new IllegalStateException("Không nhận được METRICS từ core");
            }
            if (now - rttAt > AdminConfig.DATA_STALE_MS) {
                throw new IllegalStateException("Không nhận được PONG từ UDP server");
            }

            ServerMetrics m = s.metrics();
            return new ServerMetrics(
                    m.cpuPercent(),
                    m.cpuCores(),
                    m.ramUsedGb(),
                    m.ramTotalGb(),
                    rttMs,
                    m.onlineUsers(),
                    m.bidsPerSecond());
        });
    }

    // ===== Lấy danh sách phòng thật từ Core HTTP & gửi lệnh qua Raw TCP 9090 =====

    @Override
    public CompletableFuture<List<RoomInfo>> fetchRooms() {
        CachedValue<List<RoomInfo>> cache = this.cachedRooms;
        long nowMs = System.currentTimeMillis();
        if (cache != null && nowMs - cache.fetchedAtMs() < ROOMS_CACHE_TTL_MS) {
            return CompletableFuture.completedFuture(cache.value());
        }
        return CompletableFuture.supplyAsync(() -> {
            synchronized (roomsFetchLock) {
                CachedValue<List<RoomInfo>> current = this.cachedRooms;
                long ts = System.currentTimeMillis();
                if (current != null && ts - current.fetchedAtMs() < ROOMS_CACHE_TTL_MS) {
                    return current.value();
                }

                try {
                    List<RoomInfo> result = fetchRoomsFromAdminApi();

                    this.cachedRooms = new CachedValue<>(
                            result,
                            System.currentTimeMillis());

                    return result;

                } catch (Exception e) {
                    log.error(
                            "Không tải được danh sách phòng từ Core Service",
                            e);

                    throw new IllegalStateException(
                            "Không tải được phòng thật từ Core Service: "
                                    + e.getMessage(),
                            e);
                }
            }
        });
    }

    /** Fetch all rooms from one admin snapshot so status transitions cannot split pages. */
    private List<RoomInfo> fetchRoomsFromAdminApi() throws Exception {
        String url = "http://" + AdminConfig.CORE_HOST + ":" + AdminConfig.CORE_HTTP_PORT
                + "/api/v1/admin/auction/rooms";
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(6))
                .header("Authorization", "Bearer " + resolveAdminJwt())
                .GET()
                .build();
        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() != 200) {
            throw new IOException("Core Service trả về HTTP " + resp.statusCode()
                    + " khi lấy danh sách phòng admin");
        }

        JsonArray arr = JsonParser.parseString(resp.body()).getAsJsonArray();
        LocalDateTime now = LocalDateTime.now();
        List<RoomInfo> rooms = new ArrayList<>(arr.size());
        for (JsonElement el : arr) {
            JsonObject obj = el.getAsJsonObject();
            String code = str(obj, "id", "UNKNOWN");
            RoomStatus status = mapAdminRoomStatus(str(obj, "status", "SCHEDULED"));
            rooms.add(new RoomInfo(code, str(obj, "plate", code), str(obj, "region", "Toàn quốc"), status,
                    intValue(obj, "participantCount", 0), longValue(obj, "currentPrice", 0L),
                    str(obj, "remainingLabel", formatRemaining(status, null, null, now)),
                    nullableLong(obj, "depositAmount")));
        }
        return List.copyOf(rooms);
    }

    private static RoomStatus mapAdminRoomStatus(String status) {
        return switch (status.toUpperCase(java.util.Locale.ROOT)) {
            case "ACTIVE", "LIVE" -> RoomStatus.ACTIVE;
            case "EXTENDING" -> RoomStatus.EXTENDING;
            case "WAITING" -> RoomStatus.WAITING;
            case "PAUSED" -> RoomStatus.PAUSED;
            case "CLOSED", "END" -> RoomStatus.CLOSED;
            case "COMPLETED" -> RoomStatus.COMPLETED;
            case "SETTLED" -> RoomStatus.SETTLED;
            default -> RoomStatus.SCHEDULED;
        };
    }

    private static int intValue(JsonObject obj, String key, int fallback) {
        return obj.has(key) && !obj.get(key).isJsonNull() ? obj.get(key).getAsInt() : fallback;
    }

    private static long longValue(JsonObject obj, String key, long fallback) {
        return obj.has(key) && !obj.get(key).isJsonNull() ? obj.get(key).getAsLong() : fallback;
    }

    private static Long nullableLong(JsonObject obj, String key) {
        return obj.has(key) && !obj.get(key).isJsonNull() ? obj.get(key).getAsLong() : null;
    }

    private int fetchByStatus(String status, int page, List<RoomInfo> out) throws Exception {
        String url = "http://" + AdminConfig.CORE_HOST
                + ":" + AdminConfig.CORE_HTTP_PORT
                + "/api/v1/auction/get?page="
                + page
                + "&size=50&status="
                + status;
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(6))
                .GET()
                .build();
        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() != 200) {
            throw new IOException(
                    "Core Service trả về HTTP "
                            + resp.statusCode()
                            + " khi lấy phòng status=" + status
                            + ", page=" + page);
        }

        JsonObject root = JsonParser.parseString(resp.body()).getAsJsonObject();
        JsonObject dataObj = root.has("data") && root.get("data").isJsonObject()
                ? root.getAsJsonObject("data")
                : null;
        if (dataObj == null
                || !dataObj.has("content")
                || !dataObj.get("content").isJsonArray()) {

            throw new IOException(
                    "Response từ Core Service không có data.content hợp lệ"
                            + " (status=" + status + ", page=" + page + ")");
        }

        JsonArray arr = dataObj.getAsJsonArray("content");
        LocalDateTime now = LocalDateTime.now();
        for (JsonElement el : arr) {
            JsonObject obj = el.getAsJsonObject();
            String code = str(obj, "sessionCode", str(obj, "plateNumber", "UNKNOWN"));
            String plate = str(obj, "plateNumber", code);
            String region = str(obj, "provinceName", "Toàn quốc");
            String statusCode = str(obj, "statusCode", status);

            JsonElement priceElement = obj.has("currentPrice")
                    && !obj.get("currentPrice").isJsonNull()
                            ? obj.get("currentPrice")
                            : obj.get("price");

            if (priceElement == null || priceElement.isJsonNull()) {
                throw new IOException(
                        "Phiên " + code + " không có giá hiện tại hợp lệ");
            }

            long price = priceElement.getAsLong();
            int participants = obj.has("participantCount") && !obj.get("participantCount").isJsonNull()
                    ? obj.get("participantCount").getAsInt()
                    : 0;

            String startStr = str(obj, "startTime", null);
            String endStr = str(obj, "endTime", null);
            RoomStatus roomStatus = mapRoomStatus(statusCode, startStr, endStr, now);
            String remaining = formatRemaining(roomStatus, startStr, endStr, now);

            out.add(new RoomInfo(code, plate, region, roomStatus, participants, price, remaining,
                    nullableLong(obj, "depositAmount")));
        }

        return arr.size();
    }

    private static String str(JsonObject obj, String key, String def) {
        return obj.has(key) && !obj.get(key).isJsonNull() ? obj.get(key).getAsString() : def;
    }

    private static RoomStatus mapRoomStatus(String statusCode, String startStr, String endStr, LocalDateTime now) {
        if ("PAUSED".equalsIgnoreCase(statusCode))
            return RoomStatus.PAUSED;
        if ("COMPLETED".equalsIgnoreCase(statusCode))
            return RoomStatus.COMPLETED;
        if ("END".equalsIgnoreCase(statusCode))
            return RoomStatus.CLOSED;
        if ("LIVE".equalsIgnoreCase(statusCode)) {
            if (endStr != null) {
                try {
                    long sec = Duration.between(now, LocalDateTime.parse(endStr)).getSeconds();
                    if (sec >= 0 && sec <= 30)
                        return RoomStatus.EXTENDING;
                } catch (Exception ignored) {
                }
            }
            return RoomStatus.ACTIVE;
        }
        if (startStr != null) {
            try {
                long min = Duration.between(now, LocalDateTime.parse(startStr)).toMinutes();
                if (min >= 0 && min <= 15)
                    return RoomStatus.WAITING;
            } catch (Exception ignored) {
            }
        }
        return RoomStatus.SCHEDULED;
    }

    private static String formatRemaining(RoomStatus rs, String startStr, String endStr, LocalDateTime now) {
        if (rs == RoomStatus.PAUSED)
            return "Tạm dừng";
        if (rs == RoomStatus.CLOSED || rs == RoomStatus.SETTLED)
            return "00:00:00";
        if ((rs == RoomStatus.ACTIVE || rs == RoomStatus.EXTENDING) && endStr != null) {
            try {
                long sec = Math.max(0, Duration.between(now, LocalDateTime.parse(endStr)).getSeconds());
                return String.format("%02d:%02d:%02d", sec / 3600, (sec % 3600) / 60, sec % 60);
            } catch (Exception ignored) {
            }
        }
        if (startStr != null) {
            try {
                LocalDateTime st = LocalDateTime.parse(startStr);
                return String.format("%02d:%02d", st.getHour(), st.getMinute());
            } catch (Exception ignored) {
            }
        }
        return "—";
    }

    @Override
    public CompletableFuture<List<ParticipantInfo>> fetchParticipants(String roomId) {
        if (roomId == null || roomId.isBlank()) {
            return CompletableFuture.completedFuture(List.of());
        }
        CachedValue<List<ParticipantInfo>> cached = participantsCache.get(roomId);
        long nowMs = System.currentTimeMillis();
        if (cached != null && nowMs - cached.fetchedAtMs() < PARTICIPANTS_CACHE_TTL_MS) {
            return CompletableFuture.completedFuture(cached.value());
        }
        synchronized (participantsInFlight) {
            CompletableFuture<List<ParticipantInfo>> existing = participantsInFlight.get(roomId);
            if (existing != null) {
                return existing;
            }
            CompletableFuture<List<ParticipantInfo>> request = CompletableFuture.supplyAsync(() -> {
                List<ParticipantInfo> fresh = fetchParticipantsFromHttp(roomId);
                participantsCache.put(roomId, new CachedValue<>(fresh, System.currentTimeMillis()));
                return fresh;
            });
            participantsInFlight.put(roomId, request);
            request.whenComplete((value, error) -> participantsInFlight.remove(roomId, request));
            return request;
        }
    }

    private List<ParticipantInfo> fetchParticipantsFromHttp(String roomId) {
        try {
            String encodedRoom = URLEncoder.encode(roomId.trim(), StandardCharsets.UTF_8).replace("+", "%20");
            String url = "http://" + AdminConfig.CORE_HOST + ":" + AdminConfig.CORE_HTTP_PORT
                    + "/api/v1/admin/auction/rooms/" + encodedRoom + "/participants";
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(6))
                    .header("Authorization", "Bearer " + resolveAdminJwt())
                    .GET()
                    .build();
            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) {
                throw new IOException(
                        "Core Service trả về HTTP "
                                + resp.statusCode()
                                + " khi tải người tham gia phòng "
                                + roomId);
            }

            JsonArray participants = JsonParser.parseString(resp.body()).getAsJsonArray();
            return participants.asList().stream()
                    .filter(JsonElement::isJsonObject)
                    .map(JsonElement::getAsJsonObject)
                    .map(person -> {
                        String presence = str(person, "connection", "OFFLINE");
                        ConnectionState connection = "CONNECTED".equalsIgnoreCase(presence)
                                ? ConnectionState.CONNECTED
                                : ConnectionState.OFFLINE;
                        return new ParticipantInfo(str(person, "userId", ""),
                                str(person, "fullName", "Người tham gia"), connection,
                                longValue(person, "lastPrice", 0L));
                    })
                    .sorted(Comparator.comparingLong(ParticipantInfo::lastPrice).reversed())
                    .toList();
        } catch (Exception e) {

            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }

            log.error(
                    "Lỗi tải người tham gia phòng {} từ Core Service",
                    roomId,
                    e);

            throw new IllegalStateException(
                    "Không thể tải người tham gia phòng "
                            + roomId
                            + ": "
                            + e.getMessage(),
                    e);
        }
    }

    private void invalidateCache(String roomId) {
        cachedRooms = null;
        if (roomId != null) {
            participantsCache.remove(roomId);
        } else {
            participantsCache.clear();
        }
    }

    @Override
    public CompletableFuture<CommandResult> halt(String roomId) {
        return tcpClient.sendCommand("HALT " + roomId)
                .whenComplete((r, ex) -> invalidateCache(roomId));
    }

    @Override
    public CompletableFuture<CommandResult> resume(String roomId) {
        return tcpClient.sendCommand("RESUME " + roomId)
                .whenComplete((r, ex) -> invalidateCache(roomId));
    }

    @Override
    public CompletableFuture<CommandResult> kick(String userId, String roomId) {
        return tcpClient.sendCommand("KICK " + userId + " " + roomId)
                .whenComplete((r, ex) -> invalidateCache(roomId));
    }

    @Override
    public CompletableFuture<CommandResult> unkick(String userId, String roomId) {
        return tcpClient.sendCommand("UNKICK " + userId + " " + roomId)
                .whenComplete((r, ex) -> invalidateCache(roomId));
    }

    @Override
    public CompletableFuture<CommandResult> cancel(String roomId) {
        return tcpClient.sendCommand("CANCEL " + roomId)
                .whenComplete((r, ex) -> invalidateCache(roomId));
    }

    @Override
    public CompletableFuture<CommandResult> deleteSession(String roomId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String encodedRoom = URLEncoder.encode(roomId.trim(), StandardCharsets.UTF_8).replace("+", "%20");
                String url = "http://" + AdminConfig.CORE_HOST + ":" + AdminConfig.CORE_HTTP_PORT
                        + "/api/v1/admin/auction/rooms/" + encodedRoom;
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .timeout(Duration.ofSeconds(10))
                        .header("Authorization", "Bearer " + resolveAdminJwt())
                        .DELETE()
                        .build();
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() != 200) {
                    return CommandResult.fail(readErrorMessage(response.body()));
                }

                JsonObject body = JsonParser.parseString(response.body()).getAsJsonObject();
                boolean success = body.has("success") && body.get("success").getAsBoolean();
                String message = str(body, "message", success ? "Đã xóa phiên." : "Không thể xóa phiên.");
                return new CommandResult(success, message);
            } catch (Exception e) {
                if (e instanceof InterruptedException) {
                    Thread.currentThread().interrupt();
                }
                throw new IllegalStateException("Không thể xóa phiên " + roomId + ": " + e.getMessage(), e);
            }
        }).whenComplete((result, error) -> {
            if (error == null && result.success()) {
                invalidateCache(roomId);
            }
        });
    }

    @Override
    public CompletableFuture<CommandResult> announce(String roomId, String message) {
        return tcpClient.sendCommand("ANNOUNCE " + roomId + " " + message)
                .whenComplete((r, ex) -> invalidateCache(roomId));
    }

    @Override
    public void close() {
        metricsListener.close();
        pingProbe.close();
    }

    private String resolveAdminJwt() {
        if (adminJwt != null && !adminJwt.isBlank()) {
            return adminJwt.trim();
        }
        String envJwt = System.getenv("AUCTION_ADMIN_JWT");
        if (envJwt != null && !envJwt.isBlank()) {
            return envJwt.trim();
        }
        throw new IllegalStateException("Chưa đăng nhập quản trị viên (thiếu JWT)");
    }

    @Override
    public CompletableFuture<AdminSession> login(String username, String password) {
        return CompletableFuture.supplyAsync(() -> {
            if (username == null || username.isBlank() || password == null || password.isBlank()) {
                throw new IllegalArgumentException("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
            }

            JsonObject body = new JsonObject();
            body.addProperty("userName", username.trim());
            body.addProperty("password", password);

            String url = "http://"
                    + AdminConfig.CORE_HOST
                    + ":"
                    + AdminConfig.CORE_HTTP_PORT
                    + "/api/auth/login";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(45))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body.toString(), StandardCharsets.UTF_8))
                    .build();

            try {
                HttpResponse<String> response = httpClient.send(
                        request,
                        HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

                if (response.statusCode() != 200) {
                    throw new IllegalStateException(readErrorMessage(response.body()));
                }

                JsonObject root = JsonParser.parseString(response.body()).getAsJsonObject();
                if (!root.has("data") || root.get("data").isJsonNull()) {
                    throw new IllegalStateException(
                            str(root, "message", "Không nhận được token đăng nhập từ server"));
                }

                String jwt = root.get("data").getAsString();
                if (jwt == null || jwt.isBlank()) {
                    throw new IllegalStateException("Token đăng nhập rỗng");
                }

                JsonObject claims = decodeJwtPayload(jwt);
                if (!hasAdminRole(claims)) {
                    throw new IllegalStateException("Tài khoản không có quyền Quản trị viên (ADMIN)");
                }

                String resolvedUsername = str(claims, "sub", username.trim());
                this.adminJwt = jwt.trim();
                return new AdminSession(resolvedUsername, this.adminJwt);

            } catch (HttpTimeoutException e) {
                throw new IllegalStateException("Core Service phản hồi quá chậm (hết thời gian chờ)", e);
            } catch (IOException e) {
                throw new IllegalStateException("Không kết nối được Core Service", e);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("Yêu cầu đăng nhập bị gián đoạn", e);
            }
        });
    }

    @Override
    public CompletableFuture<List<AvailablePlateInfo>> fetchAvailablePlates() {
        return CompletableFuture.supplyAsync(() -> {
            String jwt = resolveAdminJwt();
            String url = "http://"
                    + AdminConfig.CORE_HOST
                    + ":"
                    + AdminConfig.CORE_HTTP_PORT
                    + "/api/v1/admin/auction/available-plates";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(45))
                    .header("Authorization", "Bearer " + jwt)
                    .GET()
                    .build();

            try {
                HttpResponse<String> response = httpClient.send(
                        request,
                        HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

                if (response.statusCode() != 200) {
                    throw new IllegalStateException(
                            "Không tải được danh sách biển số (HTTP "
                                    + response.statusCode()
                                    + "): "
                                    + readErrorMessage(response.body()));
                }

                JsonArray arr = JsonParser.parseString(response.body()).getAsJsonArray();
                List<AvailablePlateInfo> result = new ArrayList<>(arr.size());
                for (JsonElement el : arr) {
                    JsonObject obj = el.getAsJsonObject();
                    result.add(new AvailablePlateInfo(
                            str(obj, "plateNumber", ""),
                            str(obj, "provinceName", ""),
                            str(obj, "plateType", ""),
                            str(obj, "vehicleType", "")));
                }
                return result;

            } catch (HttpTimeoutException e) {
                throw new IllegalStateException("Core Service phản hồi quá chậm khi tải biển số", e);
            } catch (IOException e) {
                throw new IllegalStateException("Không kết nối được Core Service", e);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("Yêu cầu tải biển số bị gián đoạn", e);
            }
        });
    }

    private static JsonObject decodeJwtPayload(String jwt) {
        String[] parts = jwt.split("\\.");
        if (parts.length < 2) {
            throw new IllegalStateException("JWT không đúng định dạng");
        }
        byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
        String json = new String(decoded, StandardCharsets.UTF_8);
        return JsonParser.parseString(json).getAsJsonObject();
    }

    private static boolean hasAdminRole(JsonObject claims) {
        if (!claims.has("roles") || !claims.get("roles").isJsonArray()) {
            return false;
        }
        for (JsonElement role : claims.getAsJsonArray("roles")) {
            String value = role.getAsString();
            if ("ROLE_ADMIN".equalsIgnoreCase(value) || "ADMIN".equalsIgnoreCase(value)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public CompletableFuture<String> createSession(
            CreateSessionRequest input) {
        return CompletableFuture.supplyAsync(() -> {

            // 1. Lấy JWT của quản trị viên đã đăng nhập
            String jwt = resolveAdminJwt();

            // 2. Đóng gói dữ liệu thành JSON
            JsonObject body = new JsonObject();

            body.addProperty(
                    "plateNumber",
                    input.plateNumber());
            body.addProperty(
                    "startPrice",
                    input.startPrice());
            body.addProperty(
                    "depositAmount",
                    input.depositAmount());
            body.addProperty(
                    "startTime",
                    input.startTime().format(
                            DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            body.addProperty(
                    "endTime",
                    input.endTime().format(
                            DateTimeFormatter.ISO_LOCAL_DATE_TIME));

            // 3. Địa chỉ REST API của Core Service
            String url = "http://"
                    + AdminConfig.CORE_HOST
                    + ":"
                    + AdminConfig.CORE_HTTP_PORT
                    + "/api/v1/admin/auction/rooms";

            // 4. Tạo HTTP POST request
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(45))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + jwt.trim())
                    .POST(HttpRequest.BodyPublishers.ofString(
                            body.toString(),
                            StandardCharsets.UTF_8))
                    .build();

            // 5. Gửi request và đọc response
            try {
                HttpResponse<String> response = httpClient.send(
                        request,
                        HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() != 201) {
                    throw new IllegalStateException(
                            "Tạo phiên thất bại (HTTP "
                                    + response.statusCode()
                                    + "): "
                                    + readErrorMessage(response.body()));
                }

                JsonObject result = JsonParser
                        .parseString(response.body())
                        .getAsJsonObject();

                return result.get("sessionCode").getAsString();

            } catch (HttpTimeoutException e) {
                throw new IllegalStateException(
                        "Core Service phản hồi quá chậm khi tạo phiên", e);

            } catch (IOException e) {
                throw new IllegalStateException(
                        "Không kết nối được Core Service", e);

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();

                throw new IllegalStateException(
                        "Yêu cầu bị gián đoạn", e);
            }

        }).whenComplete((code, error) -> {
            // Chỉ xóa cache khi server xác nhận thành công
            if (error == null) {
                invalidateCache(null);
            }
        });
    }

    private static String readErrorMessage(String body) {
        try {
            JsonObject json = JsonParser
                    .parseString(body)
                    .getAsJsonObject();

            return str(
                    json,
                    "detail",
                    str(json, "message", "Server từ chối yêu cầu"));

        } catch (Exception e) {
            return "Không đọc được thông báo từ server";
        }
    }
}
