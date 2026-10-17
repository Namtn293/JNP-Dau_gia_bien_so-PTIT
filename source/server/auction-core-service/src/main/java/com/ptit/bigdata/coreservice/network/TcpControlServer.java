package com.ptit.bigdata.coreservice.network;

import com.ptit.bigdata.coreservice.model.vo.AdminCommandResultVO;
import com.ptit.bigdata.coreservice.service.AdminAuctionService;
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
 *     3. KICK <userId> [roomId]: Cưỡng chế ngắt kết nối tài khoản gian lận
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

    @Value("${tcp.control.port:9090}")
    private int port;

    private ServerSocket serverSocket;
    private volatile boolean running = false;
    private final ExecutorService threadPool = Executors.newCachedThreadPool();

    @PostConstruct
    public void start() {
        new Thread(this::listen, "tcp-control-server-listener").start();
    }

    private void listen() {
        try {
            serverSocket = new ServerSocket(port);
            running = true;
            log.info("===== TCP Control Server đã khởi động trên cổng {} (Raw TCP Socket) =====", port);

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

            case "PING":
                return "OK PONG 9090";

            default:
                return "FAIL Lệnh không được hỗ trợ: " + command + ". Hỗ trợ: HALT, RESUME, KICK, CANCEL, PING";
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
