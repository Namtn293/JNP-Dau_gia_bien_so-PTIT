package com.auction.mail;

import java.util.Locale;

/** Các mẫu email. Thêm mẫu mới bằng cách thêm một phương thức static ở đây. */
public final class MailTemplates {
    private MailTemplates() { }

    /** Biên bản kết quả phiên đã kết thúc. Số tiền cần thanh toán = giá trúng - tiền cọc. */
    public static MailMessage winnerNotice(String to, String winnerName, String winnerUserId, String roomId, String plate,
                                           long finalPrice, long deposit, String endTime) {
        long due = Math.max(0, finalPrice - deposit);
        String subject = "[Đấu giá] Thông báo trúng đấu giá biển số " + plate;
        String body = """
                Biên bản kết quả đấu giá
                Người trúng: %s
                Mã người dùng: %s
                Phiên: %s
                Biển số: %s
                Trạng thái: Đã kết thúc
                Thời điểm kết thúc: %s

                Giá trúng: %s VNĐ
                Tiền cọc đã nộp: %s VNĐ (sẽ được trừ vào số tiền thanh toán)
                Số tiền cần thanh toán: %s VNĐ
                """.formatted(winnerName, winnerUserId, roomId, plate, endTime, vnd(finalPrice), vnd(deposit), vnd(due));
        return new MailMessage(to, subject, body);
    }

    /** Định dạng tiền kiểu 380.000.000. */
    static String vnd(long amount) {
        return String.format(Locale.US, "%,d", amount).replace(',', '.');
    }
}
