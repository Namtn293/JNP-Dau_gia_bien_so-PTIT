package com.auction.gateway;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import com.auction.model.AdminSession;
import com.auction.model.AvailablePlateInfo;
import com.auction.model.CommandResult;
import com.auction.model.ParticipantInfo;
import com.auction.model.RoomInfo;
import com.auction.model.ServerMetrics;
import com.auction.model.CreateSessionRequest;

/**
 * Cổng giao tiếp giữa Admin Console và server.
 * Implementation thật sử dụng HTTP REST, raw TCP và UDP giám sát.
 */
public interface AdminGateway {
    /** Lấy danh sách phòng thật từ Core qua HTTP. */
    CompletableFuture<List<RoomInfo>> fetchRooms();

    /** Lấy người tham gia phòng qua HTTP; cache ngắn hạn giảm request lặp. */
    CompletableFuture<List<ParticipantInfo>> fetchParticipants(String roomId);

    /** Lấy snapshot CPU/RAM và RTT hiện tại qua kênh giám sát UDP. */
    CompletableFuture<ServerMetrics> fetchMetrics();

    /** Gửi lệnh raw TCP HALT để tạm dừng phiên. */
    CompletableFuture<CommandResult> halt(String roomId);

    /** Gửi lệnh raw TCP RESUME để tiếp tục phiên. */
    CompletableFuture<CommandResult> resume(String roomId);

    /** Gửi lệnh raw TCP KICK với mã người dùng và mã phòng. */
    CompletableFuture<CommandResult> kick(String userId, String roomId);

    /**
     * Khai báo hợp đồng mở khóa người dùng; trả lỗi nếu implementation chưa hỗ trợ.
     */
    default CompletableFuture<CommandResult> unkick(String userId, String roomId) {
        return CompletableFuture.completedFuture(CommandResult.fail("Chưa hỗ trợ mở khóa tài khoản (UNKICK)"));
    }

    /** Gửi lệnh raw TCP CANCEL để hủy phiên. */
    CompletableFuture<CommandResult> cancel(String roomId);

    /** Khai báo hợp đồng xóa phiên; implementation phải gọi Core thật. */
    default CompletableFuture<CommandResult> deleteSession(String roomId) {
        return CompletableFuture.failedFuture(
                new UnsupportedOperationException("Gateway không hỗ trợ xóa phiên thật"));
    }

    /** Khai báo hợp đồng gửi thông báo đến phòng. */
    default CompletableFuture<CommandResult> announce(String roomId, String message) {
        return CompletableFuture.completedFuture(CommandResult.fail("Chưa hỗ trợ gửi thông báo"));
    }

    /** Khai báo hợp đồng xác thực quản trị viên. */
    default CompletableFuture<AdminSession> login(String username, String password) {
        return CompletableFuture.failedFuture(
                new UnsupportedOperationException("Gateway không hỗ trợ đăng nhập"));
    }

    /** Khai báo hợp đồng tải biển số khả dụng. */
    default CompletableFuture<List<AvailablePlateInfo>> fetchAvailablePlates() {
        return CompletableFuture.failedFuture(
                new UnsupportedOperationException("Gateway không hỗ trợ tải danh sách biển số"));
    }

    /** Khai báo hợp đồng tạo phiên đấu giá. */
    default CompletableFuture<String> createSession(CreateSessionRequest request) {
        return CompletableFuture.failedFuture(
                new UnsupportedOperationException(
                        "Gateway không hỗ trợ tạo phiên thật"));
    }
}
