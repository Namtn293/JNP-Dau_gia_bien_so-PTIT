package com.auction.udp;

import java.net.InetSocketAddress;
import java.util.concurrent.CountDownLatch;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.auction.udp.config.UdpServerConfig;
import com.auction.udp.monitor.AlertScheduler;
import com.auction.udp.monitor.ThresholdMonitor;
import com.auction.udp.protocol.Message;
import com.auction.udp.receiver.MessageHandler;
import com.auction.udp.receiver.PingResponder;
import com.auction.udp.receiver.UdpReceiver;
import com.auction.udp.sender.AdminSender;
import com.auction.udp.sender.AlertSender;
import com.auction.udp.sender.MetricsForwarder;
import com.auction.udp.store.LatestMetrics;

/**
 * Điểm vào của UDP server.
 * - Cổng 9001: nhận METRICS từ core, lưu snapshot, gửi định kỳ tới admin
 * (8888), đánh giá ngưỡng.
 * - Cổng 9002: nhận PING từ admin, trả PONG.
 */
public final class UdpMetricsServerApp {
    private static final Logger log = LoggerFactory.getLogger(UdpMetricsServerApp.class);

    /**
     * Đọc cấu hình, mở hai socket UDP riêng cho METRICS và PING, chạy tác vụ định
     * kỳ và đăng ký shutdown hook.
     */
    public static void main(String[] args) throws Exception {
        UdpServerConfig config = UdpServerConfig.fromEnv();

        LatestMetrics store = new LatestMetrics(config.staleMs());
        AdminSender adminSender = new AdminSender(new InetSocketAddress(config.adminHost(), config.adminPort()));
        MetricsForwarder forwarder = new MetricsForwarder(store, adminSender, config.intervalMs());

        AlertSender alertSender = new AlertSender(adminSender);
        ThresholdMonitor monitor = new ThresholdMonitor(store, config.staleMs(), alertSender::send,
                new ThresholdMonitor.Rule("cpu", config.cpuWarn(), config.cpuCrit()),
                new ThresholdMonitor.Rule("ram", config.ramWarn(), config.ramCrit()));
        AlertScheduler alertScheduler = new AlertScheduler(monitor, 1000);

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

        UdpReceiver metrics = new UdpReceiver(config.metricsPort(), metricsHandler);
        UdpReceiver ping = new UdpReceiver(config.pingPort(), new PingResponder());
        metrics.start();
        ping.start();
        forwarder.start();
        alertScheduler.start();
        log.info("Gửi METRICS tới admin {}:{} mỗi {} ms; ngưỡng CPU {}/{}, RAM {}/{}; core im quá {} ms",
                config.adminHost(), config.adminPort(), config.intervalMs(), config.cpuWarn(), config.cpuCrit(),
                config.ramWarn(), config.ramCrit(), config.staleMs());

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            alertScheduler.close();
            forwarder.close();
            metrics.close();
            ping.close();
            adminSender.close();
            log.info("UDP server đã dừng");
        }));

        new CountDownLatch(1).await();
    }
}