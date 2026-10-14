package com.auction.mail;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

/**
 * Cấu hình SMTP. Thứ tự ưu tiên: biến môi trường, system property (-DMAIL_USER=...),
 * rồi file mail.properties (tìm từ thư mục hiện tại đi lên vài cấp).
 */
public record MailConfig(String host, int port, String username, String password,
                         String from, String fromName) {

    private static final String FILE_NAME = "mail.properties";

    public static MailConfig fromEnv() {
        Properties file = loadFile();

        String user = value("MAIL_USER", file, null);
        String pass = value("MAIL_PASS", file, null);
        if (user == null || pass == null) {
            String missing = (user == null ? "MAIL_USER" : "") + (user == null && pass == null ? ", " : "")
                    + (pass == null ? "MAIL_PASS" : "");
            throw new IllegalStateException("Chưa có " + missing
                    + ". Đặt biến môi trường, hoặc ghi vào file " + FILE_NAME
                    + " trong source/server/admin-console");
        }

        return new MailConfig(
                value("MAIL_HOST", file, "sandbox.smtp.mailtrap.io"),
                Integer.parseInt(value("MAIL_PORT", file, "587")),
                user,
                pass,
                value("MAIL_FROM", file, "no-reply@auction.local"),
                value("MAIL_FROM_NAME", file, "Sàn đấu giá biển số"));
    }

    private static String value(String key, Properties file, String defaultValue) {
        String v = System.getenv(key);
        if (isBlank(v)) {
            v = System.getProperty(key);
        }
        if (isBlank(v)) {
            v = file.getProperty(key);
        }
        if (isBlank(v)) {
            return defaultValue;
        }
        return v.trim();
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    /** Tìm mail.properties trong thư mục hiện tại và tối đa 4 cấp thư mục cha. */
    private static Properties loadFile() {
        Properties props = new Properties();
        Path dir = Path.of("").toAbsolutePath();
        for (int level = 0; level < 5 && dir != null; level++) {
            Path candidate = dir.resolve(FILE_NAME);
            Path nested = dir.resolve("source/server/admin-console").resolve(FILE_NAME);
            Path found = Files.isRegularFile(candidate) ? candidate
                    : Files.isRegularFile(nested) ? nested
                    : null;
            if (found != null) {
                try (InputStream in = Files.newInputStream(found)) {
                    props.load(in);
                } catch (IOException e) {
                    throw new IllegalStateException("Không đọc được " + found + ": " + e.getMessage(), e);
                }
                return props;
            }
            dir = dir.getParent();
        }
        return props;
    }
}