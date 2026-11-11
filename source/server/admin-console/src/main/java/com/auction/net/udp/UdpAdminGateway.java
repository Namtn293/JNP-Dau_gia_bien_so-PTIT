package com.auction.net.udp;

import java.net.InetSocketAddress;
import java.net.SocketException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
import com.auction.gateway.mock.MockAdminGateway;
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

/**
 * Gateway dùng số liệu thật từ UDP (CPU, RAM, Online từ METRICS; RTT từ PingProbe),
 * danh sách phòng thật qua HTTP API Core Service và lệnh điều khiển qua Raw TCP 9090.
 */
public final class UdpAdminGateway implements AdminGateway, AutoCloseable {
    private static final Logger log = LoggerFactory.getLogger(UdpAdminGateway.class);

    /** Nhận cảnh báo. Gọi trên luồng nền, cần invokeLater khi cập nhật giao diện. */
    public interface AlertListener {
        /** level: CRITICAL, WARNING hoặc RESOLVED. metric: cpu, ram, core hoặc rtt. */
        void onAlert(String level, String metric, double value, double threshold);
    }

    private static final long ROOMS_CACHE_TTL_MS = 2_500L;
    private static final long PARTICIPANTS_CACHE_TTL_MS = 2_500L;

    private record Snapshot(ServerMetrics metrics, long receivedAt) { }
    private record CachedValue<T>(T value, long fetchedAtMs) { }

    private final AdminGateway mock = new MockAdminGateway();
    private final TcpControlClient tcpClient = new TcpControlClient(AdminConfig.CORE_HOST, AdminConfig.RAW_TCP_PORT);
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .build();
    private final List<AlertListener> alertListeners = new CopyOnWriteArrayList<>();
    private final RttMonitor rttMonitor =
            new RttMonitor(AdminConfig.RTT_WARN_MS, AdminConfig.RTT_CRIT_MS, this::publish);

    private final UdpMetricsListener metricsListener;
    private final PingProbe pingProbe;
    private final Object roomsFetchLock = new Object();
    private final Map<String, CachedValue<List<ParticipantInfo>>> participantsCache = new ConcurrentHashMap<>();

    private volatile Snapshot latest;
    private volatile CachedValue<List<RoomInfo>> cachedRooms;
    private volatile int rttMs;
    private volatile long rttAt;

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
     * Gộp METRICS mới nhất với RTT mới nhất. Nếu một trong hai đã quá hạn thì báo lỗi,
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
                    List<RoomInfo> combined = new ArrayList<>();
                    for (String st : List.of("LIVE", "PAUSED", "SOON", "END")) {
                        fetchByStatus(st, combined);
                    }
                    if (!combined.isEmpty()) {
                        List<RoomInfo> immutable = List.copyOf(combined);
                        this.cachedRooms = new CachedValue<>(immutable, System.currentTimeMillis());
                        return immutable;
                    }
                } catch (Exception e) {
                    log.debug("Không lấy được danh sách phòng từ Core HTTP, dùng fallback: {}", e.getMessage());
                }
                return mock.fetchRooms().join();
            }
        });
    }

    private void fetchByStatus(String status, List<RoomInfo> out) throws Exception {
        String url = "http://" + AdminConfig.CORE_HOST + ":" + AdminConfig.CORE_HTTP_PORT
                + "/api/v1/auction/get?page=0&size=50&status=" + status;
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(3))
                .GET()
                .build();
        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() != 200) return;

        JsonObject root = JsonParser.parseString(resp.body()).getAsJsonObject();
        JsonObject dataObj = root.has("data") && root.get("data").isJsonObject()
                ? root.getAsJsonObject("data") : null;
        if (dataObj == null || !dataObj.has("content") || !dataObj.get("content").isJsonArray()) return;

        JsonArray arr = dataObj.getAsJsonArray("content");
        LocalDateTime now = LocalDateTime.now();
        for (JsonElement el : arr) {
            JsonObject obj = el.getAsJsonObject();
            String code = str(obj, "sessionCode", str(obj, "plateNumber", "UNKNOWN"));
            String plate = str(obj, "plateNumber", code);
            String region = str(obj, "provinceName", "Toàn quốc");
            String statusCode = str(obj, "statusCode", status);
            long price = obj.has("currentPrice") && !obj.get("currentPrice").isJsonNull()
                    ? obj.get("currentPrice").getAsLong()
                    : (obj.has("price") && !obj.get("price").isJsonNull() ? obj.get("price").getAsLong() : 40_000_000L);
            int participants = obj.has("participantCount") && !obj.get("participantCount").isJsonNull()
                    ? obj.get("participantCount").getAsInt() : 0;

            String startStr = str(obj, "startTime", null);
            String endStr = str(obj, "endTime", null);
            RoomStatus roomStatus = mapRoomStatus(statusCode, startStr, endStr, now);
            String remaining = formatRemaining(roomStatus, startStr, endStr, now);

            out.add(new RoomInfo(code, plate, region, roomStatus, participants, price, remaining, rttMs));
        }
    }

    private static String str(JsonObject obj, String key, String def) {
        return obj.has(key) && !obj.get(key).isJsonNull() ? obj.get(key).getAsString() : def;
    }

    private static RoomStatus mapRoomStatus(String statusCode, String startStr, String endStr, LocalDateTime now) {
        if ("PAUSED".equalsIgnoreCase(statusCode)) return RoomStatus.PAUSED;
        if ("END".equalsIgnoreCase(statusCode)) return RoomStatus.CLOSED;
        if ("LIVE".equalsIgnoreCase(statusCode)) {
            if (endStr != null) {
                try {
                    long sec = Duration.between(now, LocalDateTime.parse(endStr)).getSeconds();
                    if (sec >= 0 && sec <= 30) return RoomStatus.EXTENDING;
                } catch (Exception ignored) {}
            }
            return RoomStatus.ACTIVE;
        }
        if (startStr != null) {
            try {
                long min = Duration.between(now, LocalDateTime.parse(startStr)).toMinutes();
                if (min >= 0 && min <= 15) return RoomStatus.WAITING;
            } catch (Exception ignored) {}
        }
        return RoomStatus.SCHEDULED;
    }

    private static String formatRemaining(RoomStatus rs, String startStr, String endStr, LocalDateTime now) {
        if (rs == RoomStatus.PAUSED) return "Tạm dừng";
        if (rs == RoomStatus.CLOSED || rs == RoomStatus.SETTLED) return "00:00:00";
        if ((rs == RoomStatus.ACTIVE || rs == RoomStatus.EXTENDING) && endStr != null) {
            try {
                long sec = Math.max(0, Duration.between(now, LocalDateTime.parse(endStr)).getSeconds());
                return String.format("%02d:%02d:%02d", sec / 3600, (sec % 3600) / 60, sec % 60);
            } catch (Exception ignored) {}
        }
        if (startStr != null) {
            try {
                LocalDateTime st = LocalDateTime.parse(startStr);
                return String.format("%02d:%02d", st.getHour(), st.getMinute());
            } catch (Exception ignored) {}
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
        return CompletableFuture.supplyAsync(() -> {
            List<ParticipantInfo> fresh = fetchParticipantsFromHttp(roomId);
            participantsCache.put(roomId, new CachedValue<>(fresh, System.currentTimeMillis()));
            return fresh;
        });
    }

    private List<ParticipantInfo> fetchParticipantsFromHttp(String roomId) {
        try {
            String encodedRoom = URLEncoder.encode(roomId.trim(), StandardCharsets.UTF_8).replace("+", "%20");
            String url = "http://" + AdminConfig.CORE_HOST + ":" + AdminConfig.CORE_HTTP_PORT
                    + "/api/v1/auction/room/" + encodedRoom;
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(3))
                    .GET()
                    .build();
            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() != 200) {
                return List.of();
            }

            JsonObject root = JsonParser.parseString(resp.body()).getAsJsonObject();
            JsonObject dataObj = root.has("data") && root.get("data").isJsonObject()
                    ? root.getAsJsonObject("data") : null;
            if (dataObj == null || !dataObj.has("initialBids") || !dataObj.get("initialBids").isJsonArray()) {
                return List.of();
            }

            JsonArray bids = dataObj.getAsJsonArray("initialBids");
            if (bids.isEmpty()) {
                return List.of();
            }

            LocalDateTime now = LocalDateTime.now();
            Map<String, ParticipantAccum> byUser = new LinkedHashMap<>();
            for (JsonElement el : bids) {
                if (!el.isJsonObject()) continue;
                JsonObject bid = el.getAsJsonObject();
                String uid = str(bid, "userId", null);
                String name = str(bid, "userName", uid != null ? "User " + uid : "Ẩn danh");
                String key = uid != null && !uid.isBlank() ? uid : name;
                String displayId = uid != null && !uid.isBlank() ? uid : key;
                long amount = bid.has("bidAmount") && !bid.get("bidAmount").isJsonNull()
                        ? bid.get("bidAmount").getAsLong() : 0L;
                LocalDateTime bidAt = parseBidTime(str(bid, "bidTime", null));
                boolean recentBid = bidAt != null && Math.abs(Duration.between(bidAt, now).toMillis()) <= 5_000L;

                ParticipantAccum acc = byUser.computeIfAbsent(key, k -> new ParticipantAccum(displayId, name));
                if (amount > acc.lastPrice) {
                    acc.lastPrice = amount;
                }
                if (recentBid) {
                    acc.bidsInLast5s++;
                }
            }

            int currentRtt = Math.max(0, rttMs);
            ConnectionState conn = currentRtt > AdminConfig.RTT_WARN_MS
                    ? ConnectionState.CHECK_NEEDED : ConnectionState.CONNECTED;
            return byUser.values().stream()
                    .map(acc -> new ParticipantInfo(acc.userId, acc.fullName, conn, acc.bidsInLast5s, acc.lastPrice, currentRtt))
                    .sorted(Comparator.comparingLong(ParticipantInfo::lastPrice).reversed())
                    .toList();
        } catch (Exception e) {
            log.debug("Không lấy được người tham gia phòng {} từ Core HTTP: {}", roomId, e.getMessage());
            return List.of();
        }
    }

    private static LocalDateTime parseBidTime(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            return LocalDateTime.parse(raw);
        } catch (Exception ignored) {
            try {
                return java.time.OffsetDateTime.parse(raw)
                        .atZoneSameInstant(java.time.ZoneId.systemDefault())
                        .toLocalDateTime();
            } catch (Exception ignored2) {
                return null;
            }
        }
    }

    private static final class ParticipantAccum {
        final String userId;
        final String fullName;
        int bidsInLast5s;
        long lastPrice;

        ParticipantAccum(String userId, String fullName) {
            this.userId = userId;
            this.fullName = fullName;
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
    public CompletableFuture<CommandResult> cancel(String roomId) {
        return tcpClient.sendCommand("CANCEL " + roomId)
                .whenComplete((r, ex) -> invalidateCache(roomId));
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
}