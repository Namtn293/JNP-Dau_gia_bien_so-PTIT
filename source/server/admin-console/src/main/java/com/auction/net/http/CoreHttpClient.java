package com.auction.net.http;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.auction.AdminConfig;
import com.auction.model.AdminSession;
import com.auction.model.AvailablePlateInfo;
import com.auction.model.CommandResult;
import com.auction.model.ConnectionState;
import com.auction.model.ParticipantInfo;
import com.auction.model.RoomInfo;
import com.auction.model.RoomStatus;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.IOException;
import com.auction.model.CreateSessionRequest;

/** HTTP REST client: xác thực, tải dữ liệu, tạo/xóa phiên và cache kết quả. */
public final class CoreHttpClient {
    private static final Logger log = LoggerFactory.getLogger(CoreHttpClient.class);
    private static final long ROOMS_CACHE_TTL_MS = 500L;
    private static final long PARTICIPANTS_CACHE_TTL_MS = 500L;

    private record CachedValue<T>(T value, long fetchedAtMs) {
    }

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(6)).build();
    private final Object roomsFetchLock = new Object();
    private final Map<String, CachedValue<List<ParticipantInfo>>> participantsCache = new ConcurrentHashMap<>();
    private final Map<String, CompletableFuture<List<ParticipantInfo>>> participantsInFlight = new ConcurrentHashMap<>();
    private volatile CachedValue<List<RoomInfo>> cachedRooms;
    private volatile String adminJwt;

    /** Lấy danh sách phòng thật từ Core qua HTTP, không tạo dữ liệu giả. */
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

    /**
     * Đọc snapshot danh sách phòng từ endpoint quản trị HTTP để tránh sai lệch khi
     * chuyển trạng thái.
     */
    private List<RoomInfo> fetchRoomsFromAdminApi() throws Exception {
        String url = baseUrl() + "/api/v1/admin/auction/rooms";
        HttpRequest req = request(url, 6)
                .header("Authorization", "Bearer " + resolveAdminJwt())
                .GET()
                .build();
        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() != 200) {
            throw new IOException("Core Service trả về HTTP " + resp.statusCode()
                    + " khi lấy danh sách phòng admin");
        }

        JsonArray arr = JsonParser.parseString(resp.body()).getAsJsonArray();
        List<RoomInfo> rooms = new ArrayList<>(arr.size());
        for (JsonElement el : arr) {
            JsonObject obj = el.getAsJsonObject();
            String code = str(obj, "id", "UNKNOWN");
            RoomStatus status = mapAdminRoomStatus(str(obj, "status", "SCHEDULED"));
            rooms.add(new RoomInfo(code, str(obj, "plate", code), str(obj, "region", "Toàn quốc"), status,
                    intValue(obj, "participantCount", 0), longValue(obj, "currentPrice", 0L),
                    str(obj, "remainingLabel", defaultRemaining(status)),
                    nullableLong(obj, "depositAmount")));
        }
        return List.copyOf(rooms);
    }

    /** Ánh xạ trạng thái do Core trả về sang enum hiển thị. */
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

    /** Đọc trường JSON kiểu int hoặc dùng giá trị dự phòng. */
    private static int intValue(JsonObject obj, String key, int fallback) {
        return obj.has(key) && !obj.get(key).isJsonNull() ? obj.get(key).getAsInt() : fallback;
    }

    /** Đọc trường JSON kiểu long hoặc dùng giá trị dự phòng. */
    private static long longValue(JsonObject obj, String key, long fallback) {
        return obj.has(key) && !obj.get(key).isJsonNull() ? obj.get(key).getAsLong() : fallback;
    }

    /** Đọc trường JSON kiểu long, trả null nếu không có dữ liệu. */
    private static Long nullableLong(JsonObject obj, String key) {
        return obj.has(key) && !obj.get(key).isJsonNull() ? obj.get(key).getAsLong() : null;
    }

    /** Đọc trường JSON kiểu chuỗi hoặc dùng giá trị dự phòng. */
    private static String str(JsonObject obj, String key, String def) {
        return obj.has(key) && !obj.get(key).isJsonNull() ? obj.get(key).getAsString() : def;
    }

    /** Lấy người tham gia phòng qua HTTP; cache ngắn hạn giảm request lặp. */
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

    /**
     * Gọi HTTP GET có Bearer JWT, đọc JSON và sắp xếp người tham gia theo giá giảm
     * dần.
     */
    private List<ParticipantInfo> fetchParticipantsFromHttp(String roomId) {
        try {
            String encodedRoom = encodeRoom(roomId);
            String url = baseUrl() + "/api/v1/admin/auction/rooms/" + encodedRoom + "/participants";
            HttpRequest req = request(url, 6)
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

    /** Xóa cache phòng/người tham gia để lần tải tiếp theo lấy dữ liệu mới. */
    public void invalidateCache(String roomId) {
        cachedRooms = null;
        if (roomId != null) {
            participantsCache.remove(roomId);
        } else {
            participantsCache.clear();
        }
    }

    /** Gửi HTTP DELETE đến Core để xóa phiên. */
    public CompletableFuture<CommandResult> deleteSession(String roomId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String encodedRoom = encodeRoom(roomId);
                String url = baseUrl() + "/api/v1/admin/auction/rooms/" + encodedRoom;
                HttpRequest request = request(url, 10)
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

    /**
     * Lấy JWT đăng nhập hoặc biến môi trường dự phòng; không gửi request thiếu
     * token.
     */
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

    /** Xác thực qua HTTP POST và nhận JWT từ Core Service. */
    public CompletableFuture<AdminSession> login(String username, String password) {
        return CompletableFuture.supplyAsync(() -> {
            if (username == null || username.isBlank() || password == null || password.isBlank()) {
                throw new IllegalArgumentException("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
            }

            JsonObject body = new JsonObject();
            body.addProperty("userName", username.trim());
            body.addProperty("password", password);

            String url = baseUrl() + "/api/auth/login";

            HttpRequest request = request(url, 45)
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

    /** Tải danh sách biển số khả dụng qua HTTP GET có JWT. */
    public CompletableFuture<List<AvailablePlateInfo>> fetchAvailablePlates() {
        return CompletableFuture.supplyAsync(() -> {
            String jwt = resolveAdminJwt();
            String url = baseUrl() + "/api/v1/admin/auction/available-plates";

            HttpRequest request = request(url, 45)
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

    /**
     * Giải mã Base64URL phần payload JWT để đọc claims; không thay thế xác minh chữ
     * ký tại Core.
     */
    private static JsonObject decodeJwtPayload(String jwt) {
        String[] parts = jwt.split("\\.");
        if (parts.length < 2) {
            throw new IllegalStateException("JWT không đúng định dạng");
        }
        byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
        String json = new String(decoded, StandardCharsets.UTF_8);
        return JsonParser.parseString(json).getAsJsonObject();
    }

    /** Kiểm tra claim roles để quyết định cho phép mở giao diện quản trị. */
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

    /** Gửi HTTP POST tạo phiên thật; Core xử lý lưu dữ liệu. */
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
            String url = baseUrl() + "/api/v1/admin/auction/rooms";

            // 4. Tạo HTTP POST request
            HttpRequest request = request(url, 45)
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

    /** Trích xuất thông báo lỗi từ JSON trả về của Core. */
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

    /** Nhãn dự phòng khi API không trả remainingLabel. */
    private static String defaultRemaining(RoomStatus status) {
        return switch (status) {
            case PAUSED -> "Tạm dừng";
            case CLOSED, SETTLED -> "00:00:00";
            default -> "—";
        };
    }

    /** Tạo HTTP request có timeout riêng cho từng loại nghiệp vụ. */
    private static HttpRequest.Builder request(String url, long timeoutSeconds) {
        return HttpRequest.newBuilder().uri(URI.create(url)).timeout(Duration.ofSeconds(timeoutSeconds));
    }

    /** Dùng chung địa chỉ Core, không thay đổi host/cổng hiện tại. */
    private static String baseUrl() {
        return "http://" + AdminConfig.CORE_HOST + ":" + AdminConfig.CORE_HTTP_PORT;
    }

    /** Mã hóa mã phòng thành một đoạn URL, không dùng dấu + cho khoảng trắng. */
    private static String encodeRoom(String roomId) {
        return URLEncoder.encode(roomId.trim(), StandardCharsets.UTF_8).replace("+", "%20");
    }
}
