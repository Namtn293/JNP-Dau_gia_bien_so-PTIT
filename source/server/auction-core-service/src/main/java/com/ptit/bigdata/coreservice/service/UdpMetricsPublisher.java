package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.core.util.MetricsFormatter;
import com.ptit.bigdata.coreservice.model.vo.MetricsSample;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetSocketAddress;
import java.net.SocketException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Gửi METRICS tới UDP server định kỳ. Chỉ được tạo khi udp.metrics.enabled=true,
 * nên khi tắt sẽ không có truy vấn DB hay gói UDP nào.
 * UDP không có xác nhận: gói mất thì chu kỳ sau gửi lại, không thử lại gói cũ.
 */
@Component
@ConditionalOnProperty(name = "udp.metrics.enabled", havingValue = "true")
public class UdpMetricsPublisher {
    private static final Logger log = LoggerFactory.getLogger(UdpMetricsPublisher.class);

    private final MetricsSampler sampler;
    private final InetSocketAddress target;
    private final DatagramSocket socket;

    // Bắt đầu từ epoch giây để seq luôn lớn hơn sau khi core khởi động lại
    private final AtomicLong seq = new AtomicLong(System.currentTimeMillis() / 1000);

    public UdpMetricsPublisher(MetricsSampler sampler,
                               @Value("${udp.metrics.host:127.0.0.1}") String host,
                               @Value("${udp.metrics.port:9001}") int port) throws SocketException {
        this.sampler = sampler;
        this.target = new InetSocketAddress(host, port);
        this.socket = new DatagramSocket();
        log.info("Gửi METRICS tới {}", target);
    }

    @Scheduled(fixedRateString = "${udp.metrics.interval-ms:1000}")
    public void publish() {
        try {
            MetricsSample sample = sampler.sample();

            // Không gửi số giả: nếu không đo được thì bỏ qua chu kỳ này
            if (sample.cpuPercent() < 0 || sample.ramTotalGb() <= 0) {
                log.warn("Không đo được CPU/RAM trên máy này, bỏ qua chu kỳ METRICS");
                return;
            }

            String line = MetricsFormatter.format(seq.incrementAndGet(), System.currentTimeMillis(), sample);
            byte[] data = line.getBytes(StandardCharsets.UTF_8);
            socket.send(new DatagramPacket(data, data.length, target));
        } catch (IOException e) {
            log.warn("Không gửi được METRICS: {}", e.getMessage());
        } catch (RuntimeException e) {
            // Lỗi DB hoặc đo đạc: ghi log, không làm dừng scheduler
            log.warn("Lỗi khi chuẩn bị METRICS: {}", e.getMessage());
        }
    }

    @PreDestroy
    public void close() {
        socket.close();
    }
}