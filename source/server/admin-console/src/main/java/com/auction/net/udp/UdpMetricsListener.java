package com.auction.net.udp;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.SocketException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.auction.model.ServerMetrics;

/**
 * Lắng nghe UDP trên cổng của admin, nhận METRICS và ALERT từ UDP server.
 * Callback chạy trên luồng nhận, không phải EDT: cần chuyển về EDT trước khi
 * cập nhật giao diện.
 */
public final class UdpMetricsListener implements AutoCloseable {
    private static final Logger log = LoggerFactory.getLogger(UdpMetricsListener.class);
    private static final int MAX_PACKET = 1400;

    public interface Listener {
        /** pingMs luôn là 0 ở đây, RTT được đo riêng bởi PingProbe. */
        void onMetrics(ServerMetrics metrics, long receivedAt);

        void onAlert(String level, String metric, double value, double threadhold);
    }

    private final Listener listener;
    private final DatagramSocket socket;
    private volatile boolean running = true;

    public UdpMetricsListener(int port, Listener listener) throws SocketException {
        this.listener = listener;
        this.socket = new DatagramSocket(port);
    }

    public void start() {
        Thread thread = new Thread(this::loop, "udp-metrics-listener");
        thread.setDaemon(true);
        thread.start();
        log.info("Nhận METRICS/ALERT trên cổng {}", socket.getLocalPort());
    }

    private void loop() {
        byte[] buffer = new byte[MAX_PACKET];
        while (running) {
            DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
            try {
                socket.receive(packet);
            } catch (IOException e) {
                if (running) {
                    log.warn("Lỗi nhận gói: {}", e.getMessage());
                }
                continue;
            }

            String text = new String(packet.getData(), packet.getOffset(), packet.getLength(), StandardCharsets.UTF_8)
                    .trim();
            try {
                handle(text, System.currentTimeMillis());
            } catch (RuntimeException e) {
                log.warn("Bỏ gói lỗi: \"{}\" ({})", text, e.getMessage());
            }
        }
    }

    private void handle(String text, long now) {
        String type = text.split("\\s+", 2)[0];
        Map<String, String> f = fields(text);

        switch (type) {
            case "METRICS" -> {
                double cpu = number(f, "cpu");
                if (cpu < 0 || cpu > 100) {
                    throw new IllegalArgumentException("cpu ngoài khoảng 0-100");
                }
                listener.onMetrics(new ServerMetrics(
                        cpu,
                        (int) number(f, "cores"),
                        number(f, "ram_used"),
                        number(f, "ram_total"),
                        0,
                        (int) number(f, "online"),
                        number(f, "bps")), now);
            }
            case "ALERT" -> listener.onAlert(
                    f.getOrDefault("level", "?"),
                    f.getOrDefault("metric", "?"),
                    number(f, "value"),
                    number(f, "threshold"));
            default -> log.debug("Bỏ gói không xử lý: {}", type);
        }
    }

    /** Tách "KEY=VALUE" thành map, bỏ qua token đầu tiên là loại gói. */
    private static Map<String, String> fields(String line) {
        Map<String, String> map = new HashMap<>();
        String[] parts = line.split("\\s+");
        for (int i = 1; i < parts.length; i++) {
            int eq = parts[i].indexOf('=');
            if (eq > 0) {
                map.put(parts[i].substring(0, eq), parts[i].substring(eq + 1));
            }
        }
        return map;
    }

    private static double number(Map<String, String> f, String key) {
        String v = f.get(key);
        if (v == null) {
            throw new IllegalArgumentException("thiếu trường " + key);
        }
        try {
            return Double.parseDouble(v);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("trường " + key + " không phải số");
        }
    }

    @Override
    public void close() {
        running = false;
        socket.close();
    }
}