package com.auction.udp.monitor;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;

import com.auction.udp.protocol.Message;
import com.auction.udp.store.LatestMetrics;

/**
 * So snapshot với ngưỡng và phát ALERT:
 * - Cảnh báo chỉ phát sau khi ngưỡng được duy trì liên tục đủ lâu.
 * - Khi vẫn ở mức cảnh báo hoặc nghiêm trọng, nhắc lại theo REPEAT_MS.
 * - Khi trở về bình thường, phát RESOLVED một lần.
 * - Core im lặng quá silenceMs được coi là nghiêm trọng, và RESOLVED khi core
 * gửi lại.
 * Chỉ được gọi từ một luồng (AlertScheduler), nên không cần đồng bộ hóa.
 */
public final class ThresholdMonitor {
    /** Khoảng nhắc lại khi một chỉ số vẫn vượt ngưỡng. */
    public static final long MIN_SUSTAINED_MS = 30_000;
    public static final long REPEAT_MS = 30_000;

    /** Ngưỡng của một chỉ số: "cpu" hoặc "ram" (phần trăm). */
    public record Rule(String metric, double warning, double critical) {
    }

    private enum State {
        NORMAL, WARNING, CRITICAL
    }

    private final LatestMetrics store;
    private final long silenceMs;
    private final Consumer<Message.Alert> sink;
    private final Rule[] rules;

    private final Map<String, Long> lastEmitAt = new HashMap<>();
    private final Map<String, Long> aboveSince = new HashMap<>();
    private final Map<String, State> alertedStates = new HashMap<>();
    private final AtomicLong seq = new AtomicLong();
    private boolean coreSilent;

    public ThresholdMonitor(LatestMetrics store, long silenceMs, Consumer<Message.Alert> sink, Rule... rules) {
        this.store = store;
        this.silenceMs = silenceMs;
        this.sink = sink;
        this.rules = rules;
    }

    public void evaluate(long now) {
        Optional<Long> last = store.lastReceivedAt();
        if (last.isEmpty()) {
            return; // chưa từng nhận METRICS, chưa có gì để cảnh báo
        }

        long age = now - last.get();

        if (age > silenceMs) {
            if (!coreSilent) {
                coreSilent = true;
                emit(Message.Level.CRITICAL, "core", age / 1000.0, silenceMs / 1000.0, now);
            }
            return; // Không có số liệu mới để đánh giá
        }

        if (coreSilent) {
            coreSilent = false;
            emit(Message.Level.RESOLVED, "core", 0, silenceMs / 1000.0, now);
        }

        store.fresh(now).ifPresent(snapshot -> checkRules(snapshot.metrics(), now));
    }

    private void checkRules(Message.Metrics m, long now) {
        for (Rule rule : rules) {
            double value = valueOf(rule.metric(), m);
            State next = value >= rule.critical() ? State.CRITICAL
                    : value >= rule.warning() ? State.WARNING
                    : State.NORMAL;
            if (next == State.NORMAL) {
                State alerted = alertedStates.remove(rule.metric());
                aboveSince.remove(rule.metric());
                if (alerted != null) {
                    double crossed = alerted == State.CRITICAL ? rule.critical() : rule.warning();
                    emit(Message.Level.RESOLVED, rule.metric(), value, crossed, now);
                }
                continue;
            }

            long since = aboveSince.computeIfAbsent(rule.metric(), ignored -> now);
            if (now - since < MIN_SUSTAINED_MS) continue;

            State alerted = alertedStates.get(rule.metric());
            long lastAt = lastEmitAt.getOrDefault(rule.metric(), 0L);
            if (alerted != next || now - lastAt >= REPEAT_MS) {
                emitLevel(rule, next, value, now);
                alertedStates.put(rule.metric(), next);
            }
        }
    }

    private void emitLevel(Rule rule, State state, double value, long now) {
        if (state == State.CRITICAL) {
            emit(Message.Level.CRITICAL, rule.metric(), value, rule.critical(), now);
        } else {
            emit(Message.Level.WARNING, rule.metric(), value, rule.warning(), now);
        }
    }

    private void emit(Message.Level level, String metric, double value, double threshold, long now) {
        sink.accept(new Message.Alert(seq.incrementAndGet(), now, level, metric, value, threshold));
        lastEmitAt.put(metric, now);
    }

    private static double valueOf(String metric, Message.Metrics m) {
        return switch (metric) {
            case "cpu" -> m.cpu();
            case "ram" -> m.ramTotalGb() > 0 ? m.ramUsedGb() / m.ramTotalGb() * 100.0 : 0.0;
            default -> throw new IllegalArgumentException("chỉ số không hỗ trợ: " + metric);
        };
    }
}
