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
 * Bản mock dùng để làm giao diện. Bản thật (TCP 9090, UDP 8888) sẽ implement
 * cùng interface này.
 */
public interface AdminGateway {
    CompletableFuture<List<RoomInfo>> fetchRooms();

    CompletableFuture<List<ParticipantInfo>> fetchParticipants(String roomId);

    CompletableFuture<ServerMetrics> fetchMetrics();

    CompletableFuture<CommandResult> halt(String roomId);

    CompletableFuture<CommandResult> resume(String roomId);

    CompletableFuture<CommandResult> kick(String userId, String roomId);

    default CompletableFuture<CommandResult> unkick(String userId, String roomId) {
        return CompletableFuture.completedFuture(CommandResult.fail("Chưa hỗ trợ mở khóa tài khoản (UNKICK)"));
    }

    CompletableFuture<CommandResult> cancel(String roomId);

    default CompletableFuture<CommandResult> announce(String roomId, String message) {
        return CompletableFuture.completedFuture(CommandResult.fail("Chưa hỗ trợ gửi thông báo"));
    }

    default CompletableFuture<AdminSession> login(String username, String password) {
        return CompletableFuture.failedFuture(
                new UnsupportedOperationException("Gateway không hỗ trợ đăng nhập"));
    }

    default CompletableFuture<List<AvailablePlateInfo>> fetchAvailablePlates() {
        return CompletableFuture.failedFuture(
                new UnsupportedOperationException("Gateway không hỗ trợ tải danh sách biển số"));
    }

    default CompletableFuture<String> createSession(
            CreateSessionRequest request) {
        return CompletableFuture.failedFuture(
                new UnsupportedOperationException(
                        "Gateway không hỗ trợ tạo phiên thật"));
    }
}