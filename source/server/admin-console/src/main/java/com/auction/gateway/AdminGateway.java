package com.auction.gateway;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import com.auction.model.CommandResult;
import com.auction.model.ParticipantInfo;
import com.auction.model.RoomInfo;
import com.auction.model.ServerMetrics;

/**
 * Cổng giao tiếp giữa Admin Console và server.
 * Bản mock dùng để làm giao diện. Bản thật (TCP 9090, UDP 8888) sẽ implement cùng interface này.
 */
public interface AdminGateway {
    CompletableFuture<List<RoomInfo>> fetchRooms();

    CompletableFuture<List<ParticipantInfo>> fetchParticipants(String roomId);

    CompletableFuture<ServerMetrics> fetchMetrics();

    CompletableFuture<CommandResult> halt(String roomId);

    CompletableFuture<CommandResult> resume(String roomId);

    CompletableFuture<CommandResult> kick(String userId, String roomId);

    CompletableFuture<CommandResult> cancel(String roomId);
}