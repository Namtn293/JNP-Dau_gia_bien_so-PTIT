package com.auction.udp.protocol;

import java.util.Locale;

/**
 * Chuyển Message thành dòng text "LOAI key=value ...", ngược với MessageParser.
 */
public final class MessageFormatter {
    /** Ngăn khởi tạo lớp tiện ích chỉ chứa thành viên tĩnh. */
    private MessageFormatter() {
    }

    /** Đóng gói thông điệp thành chuỗi theo wire format UDP hiện có. */
    public static String format(Message message) {
        return switch (message) {
            case Message.Metrics m -> String.format(Locale.ROOT,
                    "METRICS seq=%d ts=%d cpu=%.2f cores=%d ram_used=%.2f ram_total=%.2f online=%d bps=%.2f",
                    m.seq(), m.ts(), m.cpu(), m.cores(), m.ramUsedGb(), m.ramTotalGb(), m.online(), m.bps());
            case Message.Ping p -> String.format(Locale.ROOT, "PING seq=%d ts=%d", p.seq(), p.ts());
            case Message.Pong p -> String.format(Locale.ROOT, "PONG seq=%d ts=%d", p.seq(), p.ts());
            case Message.Alert a -> String.format(Locale.ROOT,
                    "ALERT seq=%d ts=%d level=%s metric=%s value=%.2f threshold=%.2f",
                    a.seq(), a.ts(), a.level(), a.metric(), a.value(), a.threshold());
        };
    }
}
