package com.auction.mail;

import java.util.Objects;
import java.util.regex.Pattern;

/** Một email cần gửi. Kiểm tra địa chỉ người nhận ngay khi tạo, tránh chèn ký tự xuống dòng vào header. */
public record MailMessage(String to, String subject, String body) {

    private static final Pattern EMAIL = Pattern.compile("[^\\s@<>]+@[^\\s@<>]+\\.[^\\s@<>]+");

    public MailMessage {
        Objects.requireNonNull(to, "Thiếu email người nhận");
        Objects.requireNonNull(subject, "Thiếu tiêu đề");
        Objects.requireNonNull(body, "Thiếu nội dung");
        if (!EMAIL.matcher(to).matches()) {
            throw new IllegalArgumentException("Email không hợp lệ: " + to);
        }
    }
}