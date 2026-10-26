package com.auction.udp.monitor;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Chạy ThresholdMonitor.evaluate mỗi chu kỳ. */
public final class AlertScheduler implements AutoCloseable {
    private static final Logger log = LoggerFactory.getLogger(AlertScheduler.class);

    private final ThresholdMonitor monitor;
    private final long intervalMs;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "alert-scheduler");
        t.setDaemon(true);
        return t;
    });

    public AlertScheduler(ThresholdMonitor monitor, long intervalMs) {
        this.monitor = monitor;
        this.intervalMs = intervalMs;
    }

    public void start() {
        scheduler.scheduleAtFixedRate(this::tick, 0, intervalMs, TimeUnit.MILLISECONDS);
    }

    private void tick() {
        // Bắt mọi lỗi: nếu task ném exception, scheduleAtFixedRate sẽ dừng hẳn
        try {
            monitor.evaluate(System.currentTimeMillis());
        } catch (RuntimeException e) {
            log.error("Lỗi khi đánh giá ngưỡng", e);
        }
    }

    @Override
    public void close() {
        scheduler.shutdownNow();
    }
}