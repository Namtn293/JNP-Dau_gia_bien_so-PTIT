package com.auction.udp.protocol;

import java.util.HashMap;
import java.util.Map;

/**
 * Đọc gói dạng text: "LOAI key=value key=value ...".
 * Ví dụ: METRICS seq=1 ts=1760000000000 cpu=38.5 cores=8 ram_used=9.9
 * ram_total=16.0 online=248 bps=12.4
 */
public final class MessageParser {
    private MessageParser() {
    }

    public static Message parse(String line) {
        if (line == null || line.isBlank()) {
            throw new ProtocolException("Gói rỗng");
        }

        String[] parts = line.trim().split("\\s+");
        String type = parts[0];

        Map<String, String> fields = new HashMap<>();
        for (int i = 1; i < parts.length; i++) {
            int eq = parts[i].indexOf('=');
            if (eq <= 0) {
                throw new ProtocolException("trường không hợp lệ: " + parts[i]);
            }
            fields.put(parts[i].substring(0, eq), parts[i].substring(eq + 1));
        }

        long seq = longField(fields, "seq");
        long ts = longField(fields, "ts");

        return switch (type) {
            case "METRICS" -> new Message.Metrics(seq, ts,
                    doubleField(fields, "cpu"),
                    intField(fields, "cores"),
                    doubleField(fields, "ram_used"),
                    doubleField(fields, "ram_total"),
                    intField(fields, "online"),
                    doubleField(fields, "bps"));
            case "PING" -> new Message.Ping(seq, ts);
            case "PONG" -> new Message.Pong(seq, ts);
            case "ALERT" -> new Message.Alert(seq, ts,
                    levelField(fields),
                    require(fields, "metric"),
                    doubleField(fields, "value"),
                    doubleField(fields, "threshold"));
            default -> throw new ProtocolException("loại gói không rõ: " + type);
        };
    }

    private static String require(Map<String, String> fields, String key) {
        String v = fields.get(key);
        if (v == null || v.isBlank()) {
            throw new ProtocolException("Thiếu trường: " + key);
        }

        return v;
    }

    private static long longField(Map<String, String> fields, String key) {
        try {
            return Long.parseLong(require(fields, key));
        } catch (NumberFormatException e) {
            throw new ProtocolException("trường " + key + " không phải số nguyên");
        }
    }

    private static int intField(Map<String, String> fields, String key) {
        try {
            return Integer.parseInt(require(fields, key));
        } catch (NumberFormatException e) {
            throw new ProtocolException("trường " + key + " không phải số nguyên");
        }
    }

    private static double doubleField(Map<String, String> fields, String key) {
        try {
            double d = Double.parseDouble(require(fields, key));
            if (Double.isNaN(d) || Double.isInfinite(d)) {
                throw new ProtocolException("trường " + key + " không hợp lệ");
            }
            return d;
        } catch (NumberFormatException e) {
            throw new ProtocolException("trường " + key + " không phải số");
        }
    }

    private static Message.Level levelField(Map<String, String> fields) {
        String v = require(fields, "level").toUpperCase();
        try {
            return Message.Level.valueOf(v);
        } catch (IllegalArgumentException e) {
            throw new ProtocolException("level không hợp lệ: " + v);
        }
    }
}