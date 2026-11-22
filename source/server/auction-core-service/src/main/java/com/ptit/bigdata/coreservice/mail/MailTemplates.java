package com.ptit.bigdata.coreservice.mail;

import java.util.Locale;

/**
 * Các mẫu email thông báo hệ thống.
 */
public final class MailTemplates {
    private MailTemplates() { }

    /**
     * Mẫu thông báo trúng đấu giá.
     * Số tiền cần thanh toán = giá trúng - tiền cọc.
     */
    public static MailMessage winnerNotice(String to, String winnerName, String roomCode, String plate,
                                           long finalPrice, long deposit) {
        long due = Math.max(0L, finalPrice - deposit);
        String name = (winnerName != null && !winnerName.isBlank()) ? winnerName : "Quý khách";
        String subject = "[Đấu giá] Thông báo trúng đấu giá biển số " + plate;
        String paymentNotice = due > 0
                ? "Quý khách vui lòng hoàn tất nghĩa vụ tài chính nộp số tiền trúng đấu giá còn lại (" + vnd(due) + " VNĐ) trong thời hạn 15 ngày kể từ ngày kết thúc phiên đấu giá theo đúng quy định."
                : "Số tiền đặt trước đã chi trả đủ toàn bộ giá trị trúng đấu giá. Quý khách vui lòng theo dõi thông báo và nhận biên bản kết quả đấu giá.";

        String body = """
                Chào %s,

                Chúc mừng bạn đã trúng đấu giá biển số %s trong phiên đấu giá %s.

                THÔNG TIN CHI TIẾT KẾT QUẢ ĐẤU GIÁ:
                - Biển số trúng đấu giá: %s
                - Mã phiên đấu giá: %s
                - Giá trúng đấu giá: %s VNĐ
                - Tiền đặt trước đã nộp: %s VNĐ (được trừ trực tiếp vào tiền thanh toán)
                - Số tiền cần thanh toán còn lại: %s VNĐ

                %s

                Trân trọng,
                Hệ thống Đấu giá Biển số xe PTIT
                """.formatted(name, plate, roomCode, plate, roomCode, vnd(finalPrice), vnd(deposit), vnd(due), paymentNotice);
        return new MailMessage(to, subject, body);
    }

    /**
     * Định dạng tiền kiểu 110.000.000.
     */
    public static String vnd(long amount) {
        return String.format(Locale.US, "%,d", amount).replace(',', '.');
    }
}
