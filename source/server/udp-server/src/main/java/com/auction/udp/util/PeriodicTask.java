package com.auction.udp.util;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/** Một tác vụ định kỳ trên luồng daemon, dùng chung cho metrics và cảnh báo. */
public final class PeriodicTask implements AutoCloseable {
    private final ScheduledExecutorService scheduler;
    private final long intervalMs;
    private final Runnable task;

    /** Khởi tạo một executor riêng, giữ mỗi tác vụ trên một luồng. */
    public PeriodicTask(String name, long intervalMs, Runnable task) {
        this.intervalMs = intervalMs;
        this.task = task;
        scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread thread = new Thread(r, name);
            thread.setDaemon(true);
            return thread;
        });
    }

    /** Chạy ngay lần đầu, sau đó lặp lại với chu kỳ cấu hình. */
    public void start() {
        scheduler.scheduleAtFixedRate(task, 0, intervalMs, TimeUnit.MILLISECONDS);
    }

    /** Dừng tác vụ khi server đóng. */
    @Override
    public void close() {
        scheduler.shutdownNow();
    }
}
