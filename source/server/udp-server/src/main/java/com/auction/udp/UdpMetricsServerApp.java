package com.auction.udp;

import java.util.concurrent.CountDownLatch;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.auction.udp.receiver.MessageHandler;
import com.auction.udp.receiver.UdpReceiver;

/**
 * Điểm vào của UDP server.
 * Bước 1: chỉ nhận gói và ghi log. Chưa trả PONG, chưa gửi cảnh báo.
 */
public final class UdpMetricsServerApp {
    private static final Logger log = LoggerFactory.getLogger(UdpMetricsServerApp.class);

    public static void main(String[] args) throws Exception {
        int metricsPort = Integer.parseInt(env("UDP_METRICS_PORT", "9001"));
        int pingPort = Integer.parseInt(env("UDP_PING_PORT", "9002"));

        MessageHandler logOnly = (message, from) ->
                log.info("{} từ {}: {}", message.getClass().getSimpleName(), from, message);

        UdpReceiver metrics = new UdpReceiver(metricsPort, logOnly);
        UdpReceiver ping = new UdpReceiver(pingPort, logOnly);
        metrics.start();
        ping.start();

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            metrics.close();
            ping.close();
            log.info("UDP server đã dừng");
        }));

        new CountDownLatch(1).await();
    }

    private static String env(String name, String defaultValue) {
        String v = System.getenv(name);
        return (v == null || v.isBlank()) ? defaultValue : v.trim();
    }
}