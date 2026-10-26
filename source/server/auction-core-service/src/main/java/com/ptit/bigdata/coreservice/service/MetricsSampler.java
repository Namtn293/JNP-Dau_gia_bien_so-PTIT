package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.model.vo.MetricsSample;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import org.springframework.stereotype.Component;

import java.lang.management.ManagementFactory;

/**
 * Lấy số liệu cho một chu kỳ METRICS.
 * CPU và RAM là của máy đang chạy core. Chỉ được gọi từ một luồng (scheduler).
 */
@Component
public class MetricsSampler {
    private static final double GB = 1024 * 1024 * 1024;

    private final AuctionSessionRepository repository;
    private final com.sun.management.OperatingSystemMXBean os;

    // Dùng để tính Bps: lần đo trước
    private long lastBidTotal = -1;
    private long lastSampleNanos = -1;

    public MetricsSampler(AuctionSessionRepository repository) {
        this.repository = repository;
        this.os = (com.sun.management.OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
    }

    public MetricsSample sample() {
        // getSystemCpuLoad trả về 0..1, hoặc số âm nếu hệ thống không đo được
        double cpuPercent = os.getSystemCpuLoad() * 100.0;

        long totalBytes = os.getTotalMemorySize();
        long freeBytes = os.getFreeMemorySize();
        double ramTotalGb = totalBytes / GB;
        double ramUsedGb = (totalBytes - freeBytes) / GB;

        int cores = Runtime.getRuntime().availableProcessors();

        Long online = repository.sumParticipantsByStatus(AuctionStatusEnum.LIVE);

        long bidTotal = repository.sumBidCount();
        long now = System.nanoTime();
        double bps = 0;
        if (lastBidTotal >= 0) {
            double seconds = (now - lastSampleNanos) / 1_000_000_000.0;
            if (seconds > 0) {
                // Không âm: nếu bidCount bị giảm (dữ liệu được sửa) thì coi như 0
                bps = Math.max(0, (bidTotal - lastBidTotal) / seconds);
            }
        }
        lastBidTotal = bidTotal;
        lastSampleNanos = now;

        return new MetricsSample(cpuPercent, cores, ramUsedGb, ramTotalGb, online, bps);
    }
}
