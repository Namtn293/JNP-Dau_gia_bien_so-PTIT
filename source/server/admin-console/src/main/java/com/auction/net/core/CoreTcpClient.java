package com.auction.net.core;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Kênh lệnh điều khiển TCP 9090 của auction-core-service.
 * Mỗi lệnh mở một kết nối mới, xác thực, gửi một dòng lệnh rồi đóng kết nối.
 * Nhờ vậy client không tái sử dụng socket sau khi Core đã đóng kết nối nhàn rỗi.
 */
public class CoreTcpClient implements AutoCloseable {
    private final String host;
    private final int port;
    private final String secret;
    private final ExecutorService executor = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "core-tcp-control");
        t.setDaemon(true);
        return t;
    });

    public CoreTcpClient(String host, int port) {
        this(host, port, "");
    }

    public CoreTcpClient(String host, int port, String secret) {
        this.host = host;
        this.port = port;
        this.secret = secret;
    }

    /** Gửi một lệnh và trả về dòng phản hồi nguyên gốc. */
    public CompletableFuture<String> send(String command) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return exchange(command);
            } catch (IOException e) {
                throw new CompletionException(e);
            }
        }, executor);
    }

    private String exchange(String command) throws IOException {
        if (secret == null || secret.isBlank()) {
            throw new IOException("Chưa cấu hình TCP_CONTROL_SECRET");
        }

        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), 3000);
            socket.setSoTimeout(15000);

            try (BufferedReader in = new BufferedReader(
                    new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
                 BufferedWriter out = new BufferedWriter(
                         new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8))) {
                out.write("AUTH " + secret);
                out.newLine();
                out.flush();

                String authReply = in.readLine();
                if (authReply == null || !authReply.startsWith("OK")) {
                    throw new IOException(authReply != null ? authReply : "Core đã đóng kết nối khi xác thực");
                }

                out.write(command);
                out.newLine();
                out.flush();

                String reply = in.readLine();
                if (reply == null) {
                    throw new IOException("Core đã đóng kết nối TCP");
                }
                return reply;
            }
        }
    }

    @Override
    public void close() {
        executor.shutdownNow();
    }
}
