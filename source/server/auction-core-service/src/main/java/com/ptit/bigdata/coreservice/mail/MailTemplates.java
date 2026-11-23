package com.ptit.bigdata.coreservice.mail;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Các mẫu email của hệ thống đấu giá.
 */
public final class MailTemplates {
    private MailTemplates() { }

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy");

    /**
     * Mẫu thông báo & biên bản xác nhận trúng đấu giá + quyết toán ví.
     */
    public static MailMessage winnerNotice(String to, String recipientName, String sessionCode,
                                           String plateNumber, long finalPrice, long deposit,
                                           long remainingPaid, long walletBalanceAfter) {
        String name = (recipientName != null && !recipientName.isBlank()) ? recipientName : "Quý khách";
        String subject = String.format("[Đấu giá PTIT] Chúc mừng trúng đấu giá biển số %s - Phiên %s", plateNumber, sessionCode);

        String body = """
                Kính gửi %s,

                Chúc mừng Quý khách đã trúng đấu giá biển số xe: %s
                Mã phiên đấu giá: %s
                Thời gian kết thúc: %s

                ============================================================
                THÔNG TIN QUYẾT TOÁN TÀI CHÍNH
                ============================================================
                • Giá trúng đấu giá:          %s VNĐ
                • Tiền cọc đã nộp:            %s VNĐ (đã khấu trừ CAPTURE)
                • Số tiền quyết toán từ ví:   %s VNĐ (đã khấu trừ từ số dư)
                • Trạng thái thanh toán:      ĐÃ THANH TOÁN TOÀN BỘ (HOÀN TẤT)
                • Số dư ví còn lại:           %s VNĐ

                Biển số %s đã được gán quyền sở hữu thành công cho Quý khách.
                Hồ sơ và giấy chứng nhận đăng ký biển số sẽ được gửi về địa chỉ theo quy định.

                Trân trọng,
                Ban Quản Trị Sàn Đấu Giá Biển Số Xe Trực Tuyến PTIT
                """.formatted(
                name,
                plateNumber,
                sessionCode,
                LocalDateTime.now().format(TIME_FMT),
                vnd(finalPrice),
                vnd(deposit),
                vnd(remainingPaid),
                vnd(walletBalanceAfter),
                plateNumber
        );

        return new MailMessage(to, subject, body);
    }

    public static String vnd(long amount) {
        return String.format(Locale.US, "%,d", amount).replace(',', '.');
    }
}
