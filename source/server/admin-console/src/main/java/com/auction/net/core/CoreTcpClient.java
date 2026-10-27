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
 * Kênh lệnh điều khiển TCP 9090 của auction-core-service (giao thức một dòng).
 * Gửi "HALT AUC-1023", nhận "OK ..." hoặc "FAIL ...".
 * Một kết nối dùng chung, các lệnh chạy tuần tự trên một luồng; mất kết nối thì
 * kết nối lại ở lệnh sau.
 */
public class CoreTcpClient implements AutoCloseable {
    private final String host;
    private final int port;
    private final ExecutorService executor = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "core-tcp-control");
        t.setDaemon(true);
        return t;
    });

    private Socket socket;
    private BufferedReader in;
    private BufferedWriter out;

    public CoreTcpClient(String host, int port) {
        this.host = host;
        this.port = port;
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
        ensureConnected();

        try {
            out.write(command);
            out.write('\n');
            out.flush();

            String reply = in.readLine();
            if (reply == null) {
                throw new IOException("Core đã đóng kết nối TCP");
            }

            return reply;
        } catch (IOException e) {
            closeQuietly();
            throw e;
        }
    }

    private void ensureConnected() throws IOException {
        if (socket != null && socket.isConnected() && !socket.isClosed()) {
            return;
        }

        closeQuietly();

        Socket s = new Socket();
        s.connect(new InetSocketAddress(host, port), 3000);
        s.setSoTimeout(5000);

        socket = s;

        in = new BufferedReader(new InputStreamReader(s.getInputStream(), StandardCharsets.UTF_8));
        out = new BufferedWriter(new OutputStreamWriter(s.getOutputStream(), StandardCharsets.UTF_8));
    }

    private void closeQuietly() {
        try {
            if (socket != null) {
                socket.close();
            }
        } catch (Exception e) {
            // Bỏ qua: đóng kết nối lỗi
        }
        socket = null;
        in = null;
        out = null;
    }

    @Override
    public void close() {
        closeQuietly();
        executor.shutdownNow();
    }
}
