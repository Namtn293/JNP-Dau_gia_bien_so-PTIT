package com.auction.udp.protocol;

public sealed interface Message permits Message.Metrics, Message.Ping, Message.Pong, Message.Alert {
    long seq();

    long ts();

    /** Chỉ số hệ thống, core gửi định kỳ. */
    record Metrics(long seq, long ts, double cpu, int cores, double ramUsedGb, double ramTotalGb, int online,
            double bps) implements Message {
        public Metrics {
            if (cpu < 0 || cpu > 100) {
                throw new ProtocolException("CPU ngoài khoảng 0-100: " + cpu);
            }
            if (ramTotalGb <= 0) {
                throw new ProtocolException("ram_total phải lớn hơn không");
            }
        }
    }

    /** Admin gửi để đo RTT. */
    record Ping(long seq, long ts) implements Message {
    }

    /** Server trả lại PING, giữ nguyên seq và ts. */
    record Pong(long seq, long ts) implements Message {
    }

    /** Cảnh báo ngưỡng, hoặc thông báo đã hết ngưỡng. */
    record Alert(long seq, long ts, Level level, String metric,
            double value, double threshold) implements Message {
    }

    enum Level {
        CRITICAL, WARNING, RESOLVED
    }
}