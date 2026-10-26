package com.auction.net.udp;

/**
 * Phân loại RTT thành NORMAL / WARNING / CRITICAL và báo khi đổi mức.
 * Chỉ đổi mức khi giá trị mới giữ nguyên mức đó HOLD_SAMPLES mẫu liên tiếp,
 * tránh nhấp nháy.
 * Chỉ được gọi từ luồng nhận PONG của PingProbe, nên không cần đồng bộ hóa.
 */
final class RttMonitor {
    private static final int HOLD_SAMPLES = 3;

    private enum Level {
        NORMAL, WARNING, CRITICAL
    }

    private final int warnMs;
    private final int critMs;
    private final UdpAdminGateway.AlertListener sink;

    private Level current = Level.NORMAL;
    private Level candidate;
    private int candidateCount;

    RttMonitor(int warnMs, int critMs, UdpAdminGateway.AlertListener sink) {
        this.warnMs = warnMs;
        this.critMs = critMs;
        this.sink = sink;
    }

    void update(int rttMs) {
        Level measured = rttMs > critMs ? Level.CRITICAL
                : rttMs > warnMs ? Level.WARNING
                        : Level.NORMAL;

        if (measured == current) {
            candidate = null;
            candidateCount = 0;
            return;
        }

        if (measured == candidate) {
            candidateCount++;
        } else {
            candidate = measured;
            candidateCount = 1;
        }

        if (candidateCount < HOLD_SAMPLES) {
            return;
        }

        Level previous = current;
        current = measured;
        candidateCount = 0;
        candidate = null;

        if (current == Level.NORMAL) {
            double threshold = previous == Level.CRITICAL ? critMs : warnMs;
            sink.onAlert("RESOLVED", "rtt", rttMs, threshold);
        } else if (current == Level.CRITICAL) {
            sink.onAlert("CRITICAL", "rtt", rttMs, critMs);
        } else {
            sink.onAlert("WARNING", "rtt", rttMs, warnMs);
        }
    }
}