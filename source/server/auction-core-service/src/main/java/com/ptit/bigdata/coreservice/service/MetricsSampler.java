package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.model.vo.MetricsSample;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.AuctionRegistrationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import jakarta.annotation.PreDestroy;

import java.lang.management.ManagementFactory;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Lấy số liệu cho một chu kỳ METRICS.
 * CPU được lấy mỗi chu kỳ; RAM hệ thống được làm mới nền tối đa 5 giây một lần.
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
    private final AuctionRegistrationRepository registrationRepository;
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
    private final ExecutorService memoryExecutor = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "metrics-memory");
        t.setDaemon(true);
        return t;
    });
    private final AtomicBoolean memoryRefreshing = new AtomicBoolean(false);
    private volatile long memoryRefreshedAtNanos;
    private volatile double ramUsedCacheGb;
    private volatile double ramTotalCacheGb;

    // Dùng để tính Bps: lần đọc DB trước (chỉ dùng trong luồng metrics-db)
    private long lastBidTotal = -1;
    private long lastBidReadNanos = -1;

    public MetricsSampler(AuctionSessionRepository repository, AuctionRegistrationRepository registrationRepository) {
        this.repository = repository;
        this.registrationRepository = registrationRepository;
        this.os = (com.sun.management.OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
        long total = os.getTotalMemorySize();
        long free = os.getFreeMemorySize();
        this.ramTotalCacheGb = total / GB;
        this.ramUsedCacheGb = Math.max(0, total - free) / GB;
    }

    public MetricsSample sample() {
        // getCpuLoad trả về 0..1, hoặc số âm nếu hệ thống không đo được
        double cpuPercent = os.getCpuLoad() * 100.0;

        refreshMemoryIfDue();

        int cores = Runtime.getRuntime().availableProcessors();

        refreshDbValuesIfDue();
        return new MetricsSample(cpuPercent, cores, ramUsedCacheGb, ramTotalCacheGb, onlineCache, bpsCache);
    }

    private void refreshMemoryIfDue() {
        long now = System.nanoTime();
        if (memoryRefreshedAtNanos != 0 && now - memoryRefreshedAtNanos < DB_REFRESH_NANOS) return;
        if (!memoryRefreshing.compareAndSet(false, true)) return;
        memoryExecutor.execute(() -> {
            try {
                double[] values = readMemoryUsage();
                ramUsedCacheGb = values[0];
                ramTotalCacheGb = values[1];
                memoryRefreshedAtNanos = System.nanoTime();
            } catch (Exception e) {
                log.debug("Không đọc được bộ nhớ khả dụng; giữ số liệu hiện tại: {}", e.getMessage());
                if (ramTotalCacheGb <= 0) {
                    long total = os.getTotalMemorySize();
                    long free = os.getFreeMemorySize();
                    ramTotalCacheGb = total / GB;
                    ramUsedCacheGb = Math.max(0, total - free) / GB;
                }
                memoryRefreshedAtNanos = System.nanoTime();
            } finally {
                memoryRefreshing.set(false);
            }
        });
    }

    private double[] readMemoryUsage() throws IOException, InterruptedException {
        String osName = System.getProperty("os.name", "").toLowerCase();
        if (osName.contains("linux")) {
            long totalKb = 0;
            long availableKb = 0;
            for (String line : Files.readAllLines(Path.of("/proc/meminfo"))) {
                if (line.startsWith("MemTotal:")) totalKb = parseMeminfoKb(line);
                else if (line.startsWith("MemAvailable:")) availableKb = parseMeminfoKb(line);
            }
            if (totalKb > 0 && availableKb > 0) {
                return new double[]{(totalKb - availableKb) * 1024.0 / GB, totalKb * 1024.0 / GB};
            }
        } else if (osName.contains("mac")) {
            Process process = new ProcessBuilder("vm_stat").redirectErrorStream(true).start();
            if (!process.waitFor(2, TimeUnit.SECONDS)) {
                process.destroyForcibly();
                throw new IOException("vm_stat timeout");
            }
            String output = new String(process.getInputStream().readAllBytes());
            return parseMacMemoryUsage(output, os.getTotalMemorySize());
        }
        long total = os.getTotalMemorySize();
        long free = os.getFreeMemorySize();
        return new double[]{Math.max(0, total - free) / GB, total / GB};
    }

    static double[] parseMacMemoryUsage(String vmStatOutput, long totalBytes) throws IOException {
        long pageSize = parseNumber(vmStatOutput, "page size of (\\d+) bytes");
        long anonymous = parsePageCount(vmStatOutput, "Anonymous pages");
        if (pageSize <= 0 || anonymous <= 0 || totalBytes <= 0) {
            throw new IOException("vm_stat thiếu page size, Anonymous pages hoặc tổng RAM");
        }

        long purgeable = parsePageCount(vmStatOutput, "Pages purgeable");
        long wired = parsePageCount(vmStatOutput, "Pages wired down");
        long compressed = parsePageCount(vmStatOutput, "Pages occupied by compressor");
        long appPages = Math.max(0, anonymous - purgeable);
        double usedBytes = (double) (appPages + wired + compressed) * pageSize;
        return new double[]{Math.min(totalBytes, usedBytes) / GB, totalBytes / (double) GB};
    }

    private static long parseMeminfoKb(String line) {
        Matcher matcher = Pattern.compile("(\\d+)").matcher(line);
        return matcher.find() ? Long.parseLong(matcher.group(1)) : 0;
    }

    private static long parseNumber(String text, String regex) {
        Matcher matcher = Pattern.compile(regex).matcher(text);
        return matcher.find() ? Long.parseLong(matcher.group(1)) : 0;
    }

    private static long parsePageCount(String text, String name) {
        Matcher matcher = Pattern.compile("(?m)^" + Pattern.quote(name) + ":\\s+(\\d+)").matcher(text);
        return matcher.find() ? Long.parseLong(matcher.group(1)) : 0;
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
        Long online = registrationRepository.countActiveRegistrationsBySessionStatus(AuctionStatusEnum.LIVE);
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

    @PreDestroy
    public void stop() {
        dbExecutor.shutdownNow();
        memoryExecutor.shutdownNow();
    }
}
