package com.auction.ui.common;

import java.util.Locale;

import javax.swing.text.StyledDocument;

import com.auction.net.udp.UdpAdminGateway;

/** Ghi cảnh báo UDP và RTT vào nhật ký giao diện. */
public final class AlertLogger implements UdpAdminGateway.AlertListener {
    private final StyledDocument document;

    public AlertLogger(StyledDocument document) {
        this.document = document;
    }

    @Override
    public void onAlert(String level, String metric, double value, double threshold) {
        LogPanel.Level logLevel = switch (level) {
            case "CRITICAL" -> LogPanel.Level.ERROR;
            case "WARNING" -> LogPanel.Level.WARNING;
            case "RESOLVED" -> LogPanel.Level.SUCCESS;
            default -> LogPanel.Level.INFO;
        };
        LogPanel.appendTo(document, logLevel, describe(level, metric, value, threshold));
    }

    private static String describe(String level, String metric, double value, double threshold) {
        if ("core".equals(metric)) {
            return "CRITICAL".equals(level)
                    ? String.format(Locale.ROOT, "Core không gửi METRICS trong %.1f giây (ngưỡng %.1f giây)",
                            value, threshold)
                    : "Core đã gửi lại METRICS";
        }

        String name = switch (metric) {
            case "cpu" -> "CPU";
            case "ram" -> "RAM";
            case "rtt" -> "RTT";
            default -> metric;
        };
        String unit = "rtt".equals(metric) ? "ms" : "%";

        return switch (level) {
            case "CRITICAL" -> String.format(Locale.ROOT, "%s %.1f %s vượt ngưỡng nghiêm trọng %.0f %s",
                    name, value, unit, threshold, unit);
            case "WARNING" -> String.format(Locale.ROOT, "%s %.1f %s vượt ngưỡng cảnh báo %.0f %s",
                    name, value, unit, threshold, unit);
            default -> name + " đã trở về bình thường";
        };
    }
}