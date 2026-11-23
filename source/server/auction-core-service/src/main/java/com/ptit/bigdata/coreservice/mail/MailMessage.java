package com.ptit.bigdata.coreservice.mail;

import java.util.Objects;
import java.util.regex.Pattern;

/**
 * Đối tượng dữ liệu một email cần gửi.
 */
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
