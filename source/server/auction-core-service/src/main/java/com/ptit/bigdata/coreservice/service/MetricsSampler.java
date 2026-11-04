package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.model.vo.MetricsSample;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.lang.management.ManagementFactory;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Lấy số liệu cho một chu kỳ METRICS.
 * CPU và RAM là của máy đang chạy core, đọc ngay mỗi chu kỳ.
 * Số người online và lượt đặt giá/giây lấy từ DB ở luồng nền (5 giây một lần)
 * để chu kỳ METRICS không phải chờ DB. sample() chỉ được gọi từ một luồng
 * (scheduler).
 */
@Component
public class MetricsSampler {
    private static final Logger log = LoggerFactory.getLogger(MetricsSampler.class);
    private static final double GB = 1024 * 1024 * 1024;
    private static final long DB_REFRESH_NANOS = 5_000_000_000L;

    private final AuctionSessionRepository repository;
    private final com.sun.management.OperatingSystemMXBean os;

    // Số liệu lấy từ DB, được làm mới ở luồng nền
    private volatile long onlineCache;
    private volatile double bpsCache;

    private long lastDbStartNanos = -1; // chỉ dùng trong luồng scheduler
    private final AtomicBoolean dbRefreshing = new AtomicBoolean(false);
    private final ExecutorService dbExecutor = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "metrics-db");
        t.setDaemon(true);
        return t;
    });

    // Dùng để tính Bps: lần đọc DB trước (chỉ dùng trong luồng metrics-db)
    private long lastBidTotal = -1;
    private long lastBidReadNanos = -1;

    public MetricsSampler(AuctionSessionRepository repository) {
        this.repository = repository;
        this.os = (com.sun.management.OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
    }

    public MetricsSample sample() {
        // getCpuLoad trả về 0..1, hoặc số âm nếu hệ thống không đo được
        double cpuPercent = os.getCpuLoad() * 100.0;

        long totalBytes = os.getTotalMemorySize();
        long freeBytes = os.getFreeMemorySize();
        double ramTotalGb = totalBytes / GB;
        double ramUsedGb = (totalBytes - freeBytes) / GB;

        int cores = Runtime.getRuntime().availableProcessors();

        refreshDbValuesIfDue();
        return new MetricsSample(cpuPercent, cores, ramUsedGb, ramTotalGb, onlineCache, bpsCache);
    }

    private void refreshDbValuesIfDue() {
        long now = System.nanoTime();
        if (lastDbStartNanos >= 0 && now - lastDbStartNanos < DB_REFRESH_NANOS) {
            return;
        }
        if (!dbRefreshing.compareAndSet(false, true)) {
            return; // lần đọc trước chưa xong
        }
        lastDbStartNanos = now;

        dbExecutor.execute(() -> {
            try {
                readDbValues();
            } catch (RuntimeException e) {
                // Lỗi DB: giữ giá trị cũ, chu kỳ METRICS không bị ảnh hưởng
                log.warn("Không đọc được số liệu DB cho METRICS, giữ giá trị cũ: {}", e.getMessage());
            } finally {
                dbRefreshing.set(false);
            }
        });
    }

    private void readDbValues() {
        Long online = repository.sumParticipantsByStatus(AuctionStatusEnum.LIVE);
        long bidTotal = repository.sumBidCount();
        long now = System.nanoTime();

        if (lastBidTotal >= 0) {
            double seconds = (now - lastBidReadNanos) / 1_000_000_000.0;
            if (seconds > 0) {
                // Không âm: nếu bidCount bị giảm (dữ liệu được sửa) thì coi như 0
                bpsCache = Math.max(0, (bidTotal - lastBidTotal) / seconds);
            }
        }
        lastBidTotal = bidTotal;
        lastBidReadNanos = now;
        onlineCache = online != null ? online : 0;
    }
}