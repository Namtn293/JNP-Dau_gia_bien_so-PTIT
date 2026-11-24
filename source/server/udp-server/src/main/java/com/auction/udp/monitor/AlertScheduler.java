package com.auction.udp.monitor;

import com.auction.udp.util.PeriodicTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Chạy ThresholdMonitor.evaluate mỗi chu kỳ. */
public final class AlertScheduler implements AutoCloseable {
    private static final Logger log = LoggerFactory.getLogger(AlertScheduler.class);

    private final ThresholdMonitor monitor;
    private final PeriodicTask scheduler;

    /** Khởi tạo thành phần và lưu các phụ thuộc cần thiết. */
    public AlertScheduler(ThresholdMonitor monitor, long intervalMs) {
        this.monitor = monitor;
        this.scheduler = new PeriodicTask("alert-scheduler", intervalMs, this::tick);
    }

    /** Khởi động luồng nhận hoặc tác vụ định kỳ của thành phần. */
    public void start() {
        scheduler.start();
    }

    /** Thực hiện một chu kỳ xử lý; không để lỗi làm dừng scheduler. */
    private void tick() {
        // Bắt mọi lỗi: nếu task ném exception, scheduleAtFixedRate sẽ dừng hẳn
        try {
            monitor.evaluate(System.currentTimeMillis());
        } catch (RuntimeException e) {
            log.error("Lỗi khi đánh giá ngưỡng", e);
        }
    }

    /** Dừng tác vụ và giải phóng tài nguyên mạng thuộc thành phần. */
    @Override
    public void close() {
        scheduler.close();
    }
}