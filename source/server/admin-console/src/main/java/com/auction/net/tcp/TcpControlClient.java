package com.auction.net.tcp;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.auction.model.CommandResult;

/**
 * Client kết nối trực tiếp tới Raw TCP Control Server của Auction Core Service (Cổng 9090).
 * Giao thức line-based: gửi lệnh văn bản, nhận phản hồi "OK ..." hoặc "FAIL ...".
 */
public final class TcpControlClient {
    private static final Logger log = LoggerFactory.getLogger(TcpControlClient.class);
    private static final int TIMEOUT_MS = 4000;

    private final String host;
    private final int port;

    public TcpControlClient(String host, int port) {
        this.host = host;
        this.port = port;
    }

    public CompletableFuture<CommandResult> sendCommand(String commandLine) {
        return CompletableFuture.supplyAsync(() -> executeBlocking(commandLine));
    }

    private CommandResult executeBlocking(String commandLine) {
        if (commandLine == null || commandLine.isBlank()) {
            return CommandResult.fail("Lệnh rỗng");
        }
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), TIMEOUT_MS);
            socket.setSoTimeout(TIMEOUT_MS);

            BufferedWriter writer = new BufferedWriter(
                    new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8));
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));

            log.info("[TCP :{}] Gửi lệnh: {}", port, commandLine);
            writer.write(commandLine);
            writer.newLine();
            writer.flush();

            String response = reader.readLine();
            if (response == null) {
                return CommandResult.fail("Server đóng kết nối mà không phản hồi.");
            }
            log.info("[TCP :{}] Nhận phản hồi: {}", port, response);

            if (response.startsWith("OK ")) {
                return CommandResult.ok(response.substring(3).trim());
            }
            if (response.equals("OK")) {
                return CommandResult.ok("Thành công");
            }
            if (response.startsWith("FAIL ")) {
                return CommandResult.fail(response.substring(5).trim());
            }
            return CommandResult.fail(response);
        } catch (IOException e) {
            log.warn("[TCP :{}] Lỗi gửi lệnh '{}': {}", port, commandLine, e.getMessage());
            return CommandResult.fail("Không kết nối được Core TCP " + host + ":" + port + " (" + e.getMessage() + ")");
        }
    }
}

