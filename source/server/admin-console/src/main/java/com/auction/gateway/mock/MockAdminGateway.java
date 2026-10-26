package com.auction.gateway.mock;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Supplier;

import com.auction.AdminConfig;
import com.auction.gateway.AdminGateway;
import com.auction.model.CommandResult;
import com.auction.model.ConnectionState;
import com.auction.model.ParticipantInfo;
import com.auction.model.RoomInfo;
import com.auction.model.RoomStatus;
import com.auction.model.ServerMetrics;

/**
 * Bản giả lập: giữ trạng thái trong bộ nhớ, trả kết quả sau một khoảng trễ ngắn.
 * Số người tham gia mỗi phòng khớp với participantCount của phòng đó.
 */
public class MockAdminGateway implements AdminGateway {
    private static final long LATENCY_MS = 120;
    private static final String DEMO_ROOM = "AUC-1023";

    // 5 người đầu của AUC-1023, khớp thiết kế
    private static final List<ParticipantInfo> DEMO_PARTICIPANTS = List.of(
            new ParticipantInfo("U-0842", "Trần Quốc Huy", ConnectionState.CHECK_NEEDED, 18, 240_000_000L, 112),
            new ParticipantInfo("U-0317", "Lê Hoàng Nam", ConnectionState.CONNECTED, 2, 245_000_000L, 32),
            new ParticipantInfo("U-0521", "Nguyễn Thu Hà", ConnectionState.CONNECTED, 1, 235_000_000L, 32),
            new ParticipantInfo("U-0678", "Phạm Đức Long", ConnectionState.CONNECTED, 1, 225_000_000L, 32),
            new ParticipantInfo("U-0903", "Vũ Minh Phúc", ConnectionState.CONNECTED, 0, 220_000_000L, 326));

    private static final String[] SURNAMES = {
            "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi"
    };
    private static final String[] GIVEN_NAMES = {
            "An", "Bình", "Châu", "Dũng", "Hà", "Khánh", "Linh", "Minh", "Nam", "Phương", "Quân", "Thảo"
    };

    private final Map<String, RoomInfo> rooms = new LinkedHashMap<>();
    private final Map<String, List<ParticipantInfo>> participantsByRoom = new LinkedHashMap<>();

    public MockAdminGateway() {
        seed(new RoomInfo("AUC-1021", "51L - 888.88", "TP.HCM", RoomStatus.ACTIVE, 68, 380_000_000L, "04:52", 32));
        seed(new RoomInfo("AUC-1022", "43A - 567.89", "Đà Nẵng", RoomStatus.EXTENDING, 35, 165_000_000L, "00:24", 112));
        seed(new RoomInfo("AUC-1023", "30K - 999.99", "Hà Nội", RoomStatus.PAUSED, 42, 245_000_000L, "02:18", 32));
        seed(new RoomInfo("AUC-1024", "30L - 686.86", "Hà Nội", RoomStatus.ACTIVE, 51, 120_000_000L, "07:36", 326));
        seed(new RoomInfo("AUC-1025", "51M - 123.45", "TP.HCM", RoomStatus.WAITING, 29, 40_000_000L, "Chưa bắt đầu", 32));
        seed(new RoomInfo("AUC-1026", "43B - 888.89", "Đà Nẵng", RoomStatus.SCHEDULED, 0, 40_000_000L, "15:00 hôm nay", 32));
        seed(new RoomInfo("AUC-1019", "30K - 567.89", "Hà Nội", RoomStatus.CLOSED, 12, 210_000_000L, "00:00", 32));
        seed(new RoomInfo("AUC-1018", "51L - 666.68", "TP.HCM", RoomStatus.SETTLED, 11, 195_000_000L, "00:00", 32));
    }

    private void seed(RoomInfo room) {
        rooms.put(room.id(), room);
        participantsByRoom.put(room.id(), buildParticipants(room.id(), room.participantCount()));
    }

    /** Sinh đúng {@code count} người. Seed theo mã phòng nên mỗi lần chạy ra cùng danh sách. */
    private static List<ParticipantInfo> buildParticipants(String roomId, int count) {
        if (count <= 0) {
            return List.of();
        }

        List<ParticipantInfo> list = new ArrayList<>();
        if (DEMO_ROOM.equals(roomId)) {
            list.addAll(DEMO_PARTICIPANTS);
        }

        Random random = new Random(roomId.hashCode());
        for (int i = list.size(); i < count; i++) {
            // U-1000 trở lên, không trùng với 5 ID mẫu
            String userId = String.format("U-%04d", 1000 + i);
            String fullName = SURNAMES[random.nextInt(SURNAMES.length)] + " "
                    + GIVEN_NAMES[random.nextInt(GIVEN_NAMES.length)];
            ConnectionState connection = random.nextInt(10) == 0
                    ? ConnectionState.CHECK_NEEDED
                    : ConnectionState.CONNECTED;
            // Phần lớn người chơi đặt ít, thỉnh thoảng có người spam để demo cảnh báo
            int bids = random.nextInt(10) == 0 ? 6 + random.nextInt(8) : random.nextInt(3);
            long price = AdminConfig.START_PRICE_VND + AdminConfig.BID_STEP_VND * random.nextInt(42);
            int rtt = random.nextInt(8) == 0 ? 112 + random.nextInt(200) : 32;
            list.add(new ParticipantInfo(userId, fullName, connection, bids, price, rtt));
        }
        return List.copyOf(list);
    }

    // ===== Truy vấn =====
    @Override
    public CompletableFuture<List<RoomInfo>> fetchRooms() {
        return delayed(this::snapshotRooms);
    }

    @Override
    public CompletableFuture<List<ParticipantInfo>> fetchParticipants(String roomId) {
        return delayed(() -> participantsOf(roomId));
    }

    @Override
    public CompletableFuture<ServerMetrics> fetchMetrics() {
        return delayed(() -> {
            ThreadLocalRandom r = ThreadLocalRandom.current();
            return new ServerMetrics(
                    38 + r.nextDouble(-3, 3),
                    8,
                    9.9 + r.nextDouble(-0.2, 0.2),
                    16.0,
                    32 + r.nextInt(-5, 6),
                    248 + r.nextInt(-10, 11),
                    12.4 + r.nextDouble(-1, 1));
        });
    }

    // ===== Lệnh điều khiển =====
    @Override
    public CompletableFuture<CommandResult> halt(String roomId) {
        return delayed(() -> doHalt(roomId));
    }

    @Override
    public CompletableFuture<CommandResult> resume(String roomId) {
        return delayed(() -> doResume(roomId));
    }

    @Override
    public CompletableFuture<CommandResult> kick(String userId, String roomId) {
        return delayed(() -> doKick(userId, roomId));
    }

    @Override
    public CompletableFuture<CommandResult> cancel(String roomId) {
        return delayed(() -> doCancel(roomId));
    }

    private synchronized CommandResult doHalt(String roomId) {
        RoomInfo room = rooms.get(roomId);
        if (room == null) {
            return CommandResult.fail("Không tìm thấy phòng " + roomId);
        }
        if (!room.status().canHalt()) {
            return CommandResult.fail("Không thể HALT " + roomId + ": phòng đang " + room.status().label());
        }
        rooms.put(roomId, room.withStatus(RoomStatus.PAUSED));
        return CommandResult.ok("Đã tạm dừng " + roomId + "; đặt giá bị khóa; đếm ngược đóng băng tại "
                + room.remainingLabel() + ".");
    }

    private synchronized CommandResult doResume(String roomId) {
        RoomInfo room = rooms.get(roomId);
        if (room == null) {
            return CommandResult.fail("Không tìm thấy phòng " + roomId);
        }
        if (!room.status().canResume()) {
            return CommandResult.fail("Không thể RESUME " + roomId + ": phòng đang " + room.status().label());
        }
        String newRemaining = addSeconds(room.remainingLabel(), AdminConfig.EXTENSION_SECONDS);
        rooms.put(roomId, room.withStatus(RoomStatus.ACTIVE).withRemaining(newRemaining));
        return CommandResult.ok("Đã mở lại " + roomId + "; cộng " + AdminConfig.EXTENSION_SECONDS
                + " giây; đếm ngược " + newRemaining + ".");
    }

    private synchronized CommandResult doKick(String userId, String roomId) {
        if (!rooms.containsKey(roomId)) {
            return CommandResult.fail("Không tìm thấy phòng " + roomId);
        }
        boolean inRoom = participantsOf(roomId).stream().anyMatch(p -> p.userId().equals(userId));
        if (!inRoom) {
            return CommandResult.fail("Không tìm thấy tài khoản " + userId + " trong " + roomId);
        }
        return CommandResult.ok("Đã ngắt kết nối WebSocket của " + userId + " khỏi " + roomId + ".");
    }

    private synchronized CommandResult doCancel(String roomId) {
        RoomInfo room = rooms.get(roomId);
        if (room == null) {
            return CommandResult.fail("Không tìm thấy phòng " + roomId);
        }
        if (room.status().isFinished()) {
            return CommandResult.fail("Không thể CANCEL " + roomId + ": phòng đã " + room.status().label());
        }
        rooms.put(roomId, room.withStatus(RoomStatus.CLOSED).withRemaining("00:00"));
        return CommandResult.ok("Đã hủy " + roomId + "; hoàn 100% tiền cọc cho người tham gia.");
    }

    // ===== Tiện ích =====
    private synchronized List<RoomInfo> snapshotRooms() {
        return List.copyOf(rooms.values());
    }

    private synchronized List<ParticipantInfo> participantsOf(String roomId) {
        return participantsByRoom.getOrDefault(roomId, List.of());
    }

    /** Cộng thêm số giây vào nhãn dạng mm:ss, ví dụ 02:18 + 30 = 02:48. */
    static String addSeconds(String label, int seconds) {
        if (!label.matches("\\d{2}:\\d{2}")) {
            return label;
        }
        String[] parts = label.split(":");
        int total = Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]) + seconds;
        return String.format("%02d:%02d", total / 60, total % 60);
    }

    private static <T> CompletableFuture<T> delayed(Supplier<T> action) {
        return CompletableFuture.supplyAsync(() -> {
            sleepQuietly(LATENCY_MS);
            return action.get();
        });
    }

    private static void sleepQuietly(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}