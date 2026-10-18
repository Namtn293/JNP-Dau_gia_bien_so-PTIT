package com.auction.udp;

import java.net.InetSocketAddress;
import java.util.concurrent.CountDownLatch;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.auction.udp.protocol.Message;
import com.auction.udp.receiver.MessageHandler;
import com.auction.udp.receiver.PingResponder;
import com.auction.udp.receiver.UdpReceiver;
import com.auction.udp.sender.AdminSender;
import com.auction.udp.sender.MetricsForwarder;
import com.auction.udp.store.LatestMetrics;

/**
 * Điểm vào của UDP server.
 * - Cổng 9001: nhận METRICS từ core, lưu snapshot mới nhất, gửi định kỳ tới admin (8888).
 * - Cổng 9002: nhận PING từ admin, trả PONG.
 */
public final class UdpMetricsServerApp {
    private static final Logger log = LoggerFactory.getLogger(UdpMetricsServerApp.class);

    public static void main(String[] args) throws Exception {
        int metricsPort = Integer.parseInt(env("UDP_METRICS_PORT", "9001"));
        int pingPort = Integer.parseInt(env("UDP_PING_PORT", "9002"));
        String adminHost = env("ADMIN_HOST", "127.0.0.1");
        int adminPort = Integer.parseInt(env("ADMIN_PORT", "8888"));
        long intervalMs = Long.parseLong(env("FORWARD_INTERVAL_MS", "1000"));
        long staleMs = Long.parseLong(env("CORE_STALE_MS", "3000"));

        LatestMetrics store = new LatestMetrics(staleMs);
        AdminSender adminSender = new AdminSender(new InetSocketAddress(adminHost, adminPort));
        MetricsForwarder forwarder = new MetricsForwarder(store, adminSender, intervalMs);

        MessageHandler metricsHandler = (message, from, channel) -> {
            if (message instanceof Message.Metrics m) {
                boolean stored = store.update(m, System.currentTimeMillis());
                if (stored) {
                    log.info("METRICS seq={} từ {} đã lưu", m.seq(), from);
                } else {
                    log.info("METRICS seq={} từ {} bị bỏ vì cũ hơn gói hiện tại", m.seq(), from);
                }
            } else {
                log.warn("Bỏ gói {} nhận trên cổng metrics từ {}", message.getClass().getSimpleName(), from);
            }
        };

        UdpReceiver metrics = new UdpReceiver(metricsPort, metricsHandler);
        UdpReceiver ping = new UdpReceiver(pingPort, new PingResponder());
        metrics.start();
        ping.start();
        forwarder.start();
        log.info("Gửi METRICS tới admin {}:{} mỗi {} ms", adminHost, adminPort, intervalMs);

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            forwarder.close();
            metrics.close();
            ping.close();
            adminSender.close();
            log.info("UDP server đã dừng");
        }));

        new CountDownLatch(1).await();
    }

    private static String env(String name, String defaultValue) {
        String v = System.getenv(name);
        return (v == null || v.isBlank()) ? defaultValue : v.trim();
    }
}