package com.auction.net.core;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.auction.gateway.AdminGateway;
import com.auction.model.CommandResult;
import com.auction.model.ConnectionState;
import com.auction.model.ParticipantInfo;
import com.auction.model.RoomInfo;
import com.auction.model.RoomStatus;
import com.auction.model.ServerMetrics;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Nguồn dữ liệu thật từ auction-core-service:
 * - Danh sách phòng và người tham gia: REST /api/v1/admin/... (cần quyền
 * ADMIN).
 * - HALT, RESUME, KICK, CANCEL: kênh TCP 9090.
 * - Số liệu hệ thống (CPU, RAM, RTT) không lấy ở đây mà lấy qua UDP
 * (UdpAdminGateway).
 */
public class CoreAdminGateway implements AdminGateway, AutoCloseable {
    private static final Logger log = LoggerFactory.getLogger(CoreAdminGateway.class);

    private final CoreHttpClient http;
    private final CoreTcpClient tcp;

    // Chỉ ghi log khi trạng thái đổi, tránh ghi log mỗi giây khi core đang tắt
    private volatile boolean failing;

    public CoreAdminGateway(CoreHttpClient http, CoreTcpClient tcp) {
        this.http = http;
        this.tcp = tcp;
    }

    @Override
    public CompletableFuture<List<RoomInfo>> fetchRooms() {
        String path = "/api/v1/admin/auction/rooms";
        return track(http.getJson(path).thenApply(CoreAdminGateway::toRooms),
                "danh sách phòng");
    }

    @Override
    public CompletableFuture<List<ParticipantInfo>> fetchParticipants(String roomdId) {
        String path = "/api/v1/admin/auction/rooms/" + encode(roomdId) + "/participants";
        return track(http.getJson(path).thenApply(CoreAdminGateway::toParticipants),
                "người tham gia");
    }

    @Override
    public CompletableFuture<ServerMetrics> fetchMetrics() {
        return CompletableFuture.failedFuture(
                new UnsupportedOperationException("Số liệu hệ thống lấy qua UDP, không lấy từ CoreAdminGateway"));
    }

    @Override
    public CompletableFuture<CommandResult> halt(String roomId) {
        return command("HALT" + roomId);
    }

    @Override
    public CompletableFuture<CommandResult> resume(String roomId) {
        return command("RESUME " + roomId);
    }

    @Override
    public CompletableFuture<CommandResult> kick(String userId, String roomId) {
        return command("KICK " + userId + " " + roomId);
    }

    @Override
    public CompletableFuture<CommandResult> cancel(String roomId) {
        return command("CANCEL " + roomId);
    }

    /** Core trả "OK <thông điệp>" hoặc "FAIL <lý do>". */
    private CompletableFuture<CommandResult> command(String line) {
        return tcp.send(line).thenApply(reply -> {
            String message = reply.replaceFirst("^(OK|FAIL)\\s*", "");
            return reply.startsWith("OK") ? CommandResult.ok(message) : CommandResult.fail(message);
        });
    }

    @Override
    public void close() {
        tcp.close();
    }

    private <T> CompletableFuture<T> track(CompletableFuture<T> future, String what) {
        return future.whenComplete((value, ex) -> {
            if (ex != null) {
                if (!failing) {
                    log.warn("Không lấy được {} từ core: {}", what, rootMessage(ex));
                    failing = true;
                }
            } else if (failing) {
                log.info("Đã kết nối lại core ({})", what);
                failing = false;
            }
        });
    }

    private static String rootMessage(Throwable t) {
        Throwable cur = t;
        while (cur instanceof CompletionException && cur.getCause() != null) {
            cur = cur.getCause();
        }

        return cur.getMessage() != null ? cur.getMessage() : cur.toString();
    }

    private static List<RoomInfo> toRooms(JsonNode array) {
        List<RoomInfo> rooms = new ArrayList<>();

        for (JsonNode n : array) {
            rooms.add(new RoomInfo(
                    n.path("id").asText(),
                    n.path("plate").asText(),
                    n.path("region").asText(),
                    RoomStatus.valueOf(n.path("status").asText()),
                    n.path("participantCount").asInt(),
                    n.path("currentPrice").asLong(),
                    n.path("remainingLabel").asText(),
                    n.path("rttMs").asInt()));
        }

        return rooms;
    }

    private static List<ParticipantInfo> toParticipants(JsonNode array) {
        List<ParticipantInfo> list = new ArrayList<>();
        for (JsonNode n : array) {
            list.add(new ParticipantInfo(
                    n.path("userId").asText(),
                    n.path("fullName").asText(),
                    ConnectionState.valueOf(n.path("connection").asText()),
                    n.path("bidsInLast5s").asInt(),
                    n.path("lastPrice").asLong(),
                    n.path("rttMs").asInt()));
        }
        return list;
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

}
