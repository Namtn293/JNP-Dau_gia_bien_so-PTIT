package com.auction.udp.sender;

import java.io.IOException;

import com.auction.udp.util.PeriodicTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.auction.udp.protocol.Message;
import com.auction.udp.protocol.MessageFormatter;
import com.auction.udp.store.LatestMetrics;

/** Mỗi chu kỳ gửi snapshot mới nhất (nếu còn mới) tới Admin Console. */
public final class MetricsForwarder implements AutoCloseable {
    private static final Logger log = LoggerFactory.getLogger(MetricsForwarder.class);

    private final LatestMetrics store;
    private final AdminSender sender;
    private final PeriodicTask scheduler;

    /** Khởi tạo thành phần và lưu các phụ thuộc cần thiết. */
    public MetricsForwarder(LatestMetrics store, AdminSender sender, long intervalMillis) {
        this.store = store;
        this.sender = sender;
        this.scheduler = new PeriodicTask("metrics-forwarder", intervalMillis, this::tick);
    }

    /** Khởi động luồng nhận hoặc tác vụ định kỳ của thành phần. */
    public void start() {
        scheduler.start();
    }

    /** Thực hiện một chu kỳ xử lý; không để lỗi làm dừng scheduler. */
    private void tick() {
        // Bắt mọi lỗi: nếu task ném exception, scheduleAtFixedRate sẽ dừng hẳn
        try {
            store.fresh(System.currentTimeMillis()).ifPresent(snapshot -> send(snapshot.metrics()));
        } catch (RuntimeException e) {
            log.error("Lỗi trong chu kỳ gửi METRICS", e);
        }
    }

    /** Định dạng snapshot METRICS rồi gửi UDP tới Admin Console. */
    private void send(Message.Metrics m) {
        try {
            sender.send(MessageFormatter.format(m));
        } catch (IOException e) {
            log.warn("Không gửi được METRICS tới admin: {}", e.getMessage());
        }
    }

    /** Dừng tác vụ và giải phóng tài nguyên mạng thuộc thành phần. */
    @Override
    public void close() {
        scheduler.close();
    }
}