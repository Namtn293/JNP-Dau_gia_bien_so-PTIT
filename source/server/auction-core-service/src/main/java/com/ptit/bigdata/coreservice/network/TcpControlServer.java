package com.ptit.bigdata.coreservice.network;

import com.ptit.bigdata.coreservice.enumration.AnnouncementLevelEnum;
import com.ptit.bigdata.coreservice.model.dto.AnnouncementDTO;
import com.ptit.bigdata.coreservice.model.vo.AdminCommandResultVO;
import com.ptit.bigdata.coreservice.service.AdminAuctionService;
import com.ptit.bigdata.coreservice.service.RoomAnnouncementService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * TcpControlServer - Máy chủ Điều hành Khẩn cấp qua Raw TCP Socket (Cổng 9090)
 *
 * Đúng theo sơ đồ kiến trúc Lập trình mạng:
 * - Kênh TCP độc lập, tách rời hoàn toàn khỏi luồng Web HTTP (8080).
 * - Admin Console gửi trực tiếp các lệnh dạng văn bản (Line-based text protocol):
 *     1. HALT <roomId>        : Đóng băng phiên đấu giá khẩn cấp
 *     2. RESUME <roomId>      : Mở lại phiên, cộng thêm 30 giây
 *     3. KICK <userId> [roomId]: Chặn tài khoản đặt giá trong phiên
 *     4. CANCEL <roomId>      : Hủy phiên đấu giá và kích hoạt hoàn cọc
 *
 * Phản hồi:
 * - "OK <thông điệp>" khi thành công
 * - "FAIL <lý do>" khi thất bại
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TcpControlServer {

    private final AdminAuctionService adminAuctionService;
    private final RoomAnnouncementService roomAnnouncementService;

    @Value("${tcp.control.host:127.0.0.1}")
    private String host;

    @Value("${tcp.control.port:9090}")
    private int port;

    @Value("${tcp.control.secret:${TCP_CONTROL_SECRET:}}")
    private String controlSecret;

    private ServerSocket serverSocket;
    private volatile boolean running = false;
    private final ExecutorService threadPool = Executors.newCachedThreadPool();

    @PostConstruct
    public void start() {
        if (controlSecret == null || controlSecret.isBlank()) {
            log.warn("TCP_CONTROL_SECRET chưa được cấu hình; cổng TCP sẽ từ chối mọi lệnh.");
        }
        new Thread(this::listen, "tcp-control-server-listener").start();
    }

    private void listen() {
        try {
            serverSocket = new ServerSocket(port, 50, java.net.InetAddress.getByName(host));
            running = true;
            log.info("===== TCP Control Server đã khởi động trên {}:{} (Raw TCP Socket) =====", host, port);

            while (running && !serverSocket.isClosed()) {
                try {
                    Socket clientSocket = serverSocket.accept();
                    log.info("[TCP :9090] Kết nối mới từ Admin Console: {}", clientSocket.getRemoteSocketAddress());
                    threadPool.submit(() -> handleClient(clientSocket));
                } catch (IOException e) {
                    if (!running) break;
                    log.warn("[TCP :9090] Lỗi khi accept kết nối: {}", e.getMessage());
                }
            }
        } catch (IOException e) {
            log.error("[TCP :9090] Không thể khởi động ServerSocket trên cổng {}: {}", port, e.getMessage());
        }
    }

    private void handleClient(Socket socket) {
        try (
            BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8))
        ) {
            socket.setSoTimeout(5000);
            String authLine = reader.readLine();
            if (!isAuthorized(authLine)) {
                writer.write("FAIL Unauthorized");
                writer.newLine();
                writer.flush();
                log.warn("[TCP :9090] Từ chối kết nối chưa xác thực từ {}", socket.getRemoteSocketAddress());
                return;
            }
            writer.write("OK AUTHENTICATED");
            writer.newLine();
            writer.flush();

            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;
                log.info("[TCP :9090] Nhận lệnh từ Admin Console: '{}'", line);

                String response = processCommand(line);
                writer.write(response);
                writer.newLine();
                writer.flush();
                log.info("[TCP :9090] Phản hồi kết quả: '{}'", response);
            }
        } catch (IOException e) {
            log.info("[TCP :9090] Đã đóng kết nối với Admin Console ({})", e.getMessage());
        } finally {
            try {
                socket.close();
            } catch (IOException ignored) {}
        }
    }

    private boolean isAuthorized(String line) {
        if (controlSecret == null || controlSecret.isBlank() || line == null || !line.startsWith("AUTH ")) {
            return false;
        }
        byte[] expected = controlSecret.getBytes(StandardCharsets.UTF_8);
        byte[] supplied = line.substring(5).trim().getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expected, supplied);
    }

    private String processCommand(String rawCommand) {
        String[] parts = rawCommand.split("\\s+");
        if (parts.length == 0) return "FAIL Lệnh rỗng";

        String command = parts[0].toUpperCase();

        switch (command) {
            case "HALT":
                if (parts.length < 2) return "FAIL Cú pháp: HALT <roomId>";
                AdminCommandResultVO haltRes = adminAuctionService.halt(parts[1]);
                return (haltRes.isSuccess() ? "OK " : "FAIL ") + haltRes.getMessage();

            case "RESUME":
                if (parts.length < 2) return "FAIL Cú pháp: RESUME <roomId>";
                AdminCommandResultVO resumeRes = adminAuctionService.resume(parts[1]);
                return (resumeRes.isSuccess() ? "OK " : "FAIL ") + resumeRes.getMessage();

            case "KICK":
                if (parts.length < 2) return "FAIL Cú pháp: KICK <userId> [roomId]";
                String userId = parts[1];
                String roomId = parts.length >= 3 ? parts[2] : "ALL";
                AdminCommandResultVO kickRes = adminAuctionService.kick(userId, roomId);
                return (kickRes.isSuccess() ? "OK " : "FAIL ") + kickRes.getMessage();

            case "CANCEL":
                if (parts.length < 2) return "FAIL Cú pháp: CANCEL <roomId>";
                AdminCommandResultVO cancelRes = adminAuctionService.cancel(parts[1]);
                return (cancelRes.isSuccess() ? "OK " : "FAIL ") + cancelRes.getMessage();

            case "ANNOUNCE":
                if (parts.length < 3) return "FAIL Cú pháp: ANNOUNCE <roomId> <nội dung>";
                String announceRoom = parts[1];
                int prefixLen = parts[0].length() + 1 + parts[1].length() + 1;
                String content = rawCommand.substring(Math.min(prefixLen, rawCommand.length())).trim();
                try {
                    AnnouncementDTO dto = AnnouncementDTO.builder()
                            .content(content)
                            .pinned(false)
                            .level(AnnouncementLevelEnum.INFO)
                            .notifyWatchers(true)
                            .build();
                    roomAnnouncementService.post(announceRoom, null, dto);
                    return "OK Đã phát thông báo vào phòng " + announceRoom;
                } catch (Exception e) {
                    return "FAIL Lỗi khi gửi thông báo: " + e.getMessage();
                }

            case "PING":
                return "OK PONG 9090";

            default:
                return "FAIL Lệnh không được hỗ trợ: " + command + ". Hỗ trợ: HALT, RESUME, KICK, CANCEL, ANNOUNCE, PING";
        }
    }

    @PreDestroy
    public void stop() {
        running = false;
        try {
            if (serverSocket != null && !serverSocket.isClosed()) {
                serverSocket.close();
            }
        } catch (IOException ignored) {}
        threadPool.shutdownNow();
        log.info("[TCP :9090] TCP Control Server trên cổng {} đã dừng.", port);
    }
}
