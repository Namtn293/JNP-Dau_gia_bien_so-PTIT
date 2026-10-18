package com.auction.udp.store;

import java.util.Optional;

import com.auction.udp.protocol.Message;

/**
 * Giữ gói METRICS mới nhất. Gói có seq nhỏ hơn hoặc bằng gói hiện tại bị bỏ,
 * trừ khi gói hiện tại đã quá hạn (core có thể đã khởi động lại và seq quay về 1).
 */
public final class LatestMetrics {
    private final long staleAfterMillis;
    private Snapshot current;

    public LatestMetrics(long staleAfterMillis) {
        this.staleAfterMillis = staleAfterMillis;
    }

    /** @return true nếu gói được lưu, false nếu bị bỏ vì cũ hơn. */
    public synchronized boolean update(Message.Metrics metrics, long nowMillis) {
        if (current != null
                && metrics.seq() <= current.metrics().seq()
                && nowMillis - current.receivedAt() < staleAfterMillis) {
            return false;
        }
        current = new Snapshot(metrics, nowMillis);
        return true;
    }

    /** Snapshot còn mới, hoặc empty nếu chưa có gói nào hoặc gói đã quá hạn. */
    public synchronized Optional<Snapshot> fresh(long nowMillis) {
        if (current == null || nowMillis - current.receivedAt() >= staleAfterMillis) {
            return Optional.empty();
        }
        return Optional.of(current);
    }

    public record Snapshot(Message.Metrics metrics, long receivedAt) { }
}