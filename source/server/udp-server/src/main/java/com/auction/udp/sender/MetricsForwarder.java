package com.auction.udp.sender;

import java.io.IOException;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

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
    private final long intervalMillis;
    private final ScheduledExecutorService scheduler =
            Executors.newSingleThreadScheduledExecutor(r -> {
                Thread t = new Thread(r, "metrics-forwarder");
                t.setDaemon(true);
                return t;
            });

    public MetricsForwarder(LatestMetrics store, AdminSender sender, long intervalMillis) {
        this.store = store;
        this.sender = sender;
        this.intervalMillis = intervalMillis;
    }

    public void start() {
        scheduler.scheduleAtFixedRate(this::tick, 0, intervalMillis, TimeUnit.MILLISECONDS);
    }

    private void tick() {
        // Bắt mọi lỗi: nếu task ném exception, scheduleAtFixedRate sẽ dừng hẳn
        try {
            store.fresh(System.currentTimeMillis()).ifPresent(snapshot -> send(snapshot.metrics()));
        } catch (RuntimeException e) {
            log.error("Lỗi trong chu kỳ gửi METRICS", e);
        }
    }

    private void send(Message.Metrics m) {
        try {
            sender.send(MessageFormatter.format(m));
        } catch (IOException e) {
            log.warn("Không gửi được METRICS tới admin: {}", e.getMessage());
        }
    }

    @Override
    public void close() {
        scheduler.shutdownNow();
    }
}