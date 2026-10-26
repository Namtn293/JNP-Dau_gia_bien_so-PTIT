package com.auction.mail;

import java.util.Locale;

/** Các mẫu email. Thêm mẫu mới bằng cách thêm một phương thức static ở đây. */
public final class MailTemplates {
    private MailTemplates() { }

    /** Thông báo trúng đấu giá. Số tiền cần thanh toán = giá trúng - tiền cọc. */
    public static MailMessage winnerNotice(String to, String roomId, String plate,
                                           long finalPrice, long deposit) {
        long due = finalPrice - deposit;
        String subject = "[Đấu giá] Thông báo trúng đấu giá biển số " + plate;
        String body = """
                Chào bạn,

                Chúc mừng bạn đã trúng đấu giá biển số %s trong phiên %s.

                Giá trúng: %s VNĐ
                Tiền cọc đã nộp: %s VNĐ (sẽ được trừ vào số tiền thanh toán)
                Số tiền cần thanh toán: %s VNĐ

                Đây là email mẫu phục vụ kiểm thử.
                """.formatted(plate, roomId, vnd(finalPrice), vnd(deposit), vnd(due));
        return new MailMessage(to, subject, body);
    }

    /** Định dạng tiền kiểu 380.000.000. */
    static String vnd(long amount) {
        return String.format(Locale.US, "%,d", amount).replace(',', '.');
    }
}