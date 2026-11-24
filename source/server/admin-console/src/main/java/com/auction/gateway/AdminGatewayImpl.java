package com.auction.gateway;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import com.auction.AdminConfig;
import com.auction.model.*;
import com.auction.net.http.CoreHttpClient;
import com.auction.net.tcp.TcpControlClient;
import com.auction.net.udp.UdpMonitoringClient;

/** Điều phối ba kênh độc lập: UDP giám sát, HTTP dữ liệu, TCP điều khiển. */
public final class AdminGatewayImpl implements AdminGateway, AutoCloseable {
    private final CoreHttpClient http = new CoreHttpClient();
    private final TcpControlClient tcp = new TcpControlClient(AdminConfig.CORE_HOST, AdminConfig.RAW_TCP_PORT);
    private final UdpMonitoringClient udp = new UdpMonitoringClient();

    /** Đăng ký callback nhận cảnh báo UDP hoặc cảnh báo RTT nội bộ. */
    public void addAlertListener(UdpMonitoringClient.AlertListener listener) {
        udp.addAlertListener(listener);
    }

    /** Lấy snapshot CPU/RAM và RTT hiện tại qua kênh giám sát UDP. */
    @Override
    public CompletableFuture<ServerMetrics> fetchMetrics() {
        return udp.fetchMetrics();
    }

    /** Lấy danh sách phòng thật từ Core qua HTTP. */
    @Override
    public CompletableFuture<List<RoomInfo>> fetchRooms() {
        return http.fetchRooms();
    }

    /** Lấy người tham gia phòng qua HTTP; cache ngắn hạn giảm request lặp. */
    @Override
    public CompletableFuture<List<ParticipantInfo>> fetchParticipants(String roomId) {
        return http.fetchParticipants(roomId);
    }

    /** Xác thực qua HTTP POST và nhận JWT từ Core Service. */
    @Override
    public CompletableFuture<AdminSession> login(String username, String password) {
        return http.login(username, password);
    }

    /** Tải danh sách biển số khả dụng qua HTTP GET có JWT. */
    @Override
    public CompletableFuture<List<AvailablePlateInfo>> fetchAvailablePlates() {
        return http.fetchAvailablePlates();
    }

    /** Gửi HTTP POST tạo phiên thật; Core xử lý lưu dữ liệu. */
    @Override
    public CompletableFuture<String> createSession(CreateSessionRequest input) {
        return http.createSession(input);
    }

    /** Gửi HTTP DELETE đến Core để xóa phiên. */
    @Override
    public CompletableFuture<CommandResult> deleteSession(String roomId) {
        return http.deleteSession(roomId);
    }

    /** Gửi lệnh raw TCP HALT để tạm dừng phiên. */
    @Override
    public CompletableFuture<CommandResult> halt(String roomId) {
        return command("HALT " + roomId, roomId);
    }

    /** Gửi lệnh raw TCP RESUME để tiếp tục phiên. */
    @Override
    public CompletableFuture<CommandResult> resume(String roomId) {
        return command("RESUME " + roomId, roomId);
    }

    /** Gửi lệnh raw TCP KICK với mã người dùng và mã phòng. */
    @Override
    public CompletableFuture<CommandResult> kick(String userId, String roomId) {
        return command("KICK " + userId + " " + roomId, roomId);
    }

    /** Gửi lệnh raw TCP UNKICK để mở khóa người dùng trong phòng. */
    @Override
    public CompletableFuture<CommandResult> unkick(String userId, String roomId) {
        return command("UNKICK " + userId + " " + roomId, roomId);
    }

    /** Gửi lệnh raw TCP CANCEL để hủy phiên. */
    @Override
    public CompletableFuture<CommandResult> cancel(String roomId) {
        return command("CANCEL " + roomId, roomId);
    }

    /** Gửi lệnh raw TCP ANNOUNCE chứa mã phòng và nội dung thông báo. */
    @Override
    public CompletableFuture<CommandResult> announce(String roomId, String message) {
        return command("ANNOUNCE " + roomId + " " + message, roomId);
    }

    /** Gửi một lệnh raw TCP; xóa cache HTTP khi lệnh kết thúc. */
    private CompletableFuture<CommandResult> command(String line, String roomId) {
        return tcp.sendCommand(line).whenComplete((result, error) -> http.invalidateCache(roomId));
    }

    /** Dừng tác vụ và giải phóng tài nguyên mạng thuộc thành phần. */
    @Override
    public void close() {
        udp.close();
    }
}
