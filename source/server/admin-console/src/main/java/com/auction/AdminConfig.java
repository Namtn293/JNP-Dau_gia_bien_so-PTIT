package com.auction;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/**
 * Cấu hình chung cho Admin Console.
 * Khi đổi IP, tên vận hành hoặc mặc định khác, chỉ cần sửa ở đây.
 */
public final class AdminConfig {
    private AdminConfig() {
    }

    // Máy chủ
    public static final String SERVER_ADDRESS = envString("CORE_SERVER_ADDRESS", "127.0.0.1");
    public static final String CLUSTER_NAME = "Cụm Hà Nội";
    public static final String REGION = "Hà Nội";

    // Người vận hành
    // Trạng thái phòng dùng để bật tắt nút điều khiển
    public static final String STATUS_PAUSED = "Tạm dừng";

    // Thời gian cộng thêm khi RESUME
    public static final int EXTENSION_SECONDS = 30;

    // Cổng mạng
    public static final int UDP_PORT = 8888;
    public static final int RAW_TCP_PORT = 9090;

    // Tài chính (theo tổng quan dự án)
    public static final long DEPOSIT_VND = 40_000_000L;
    public static final long START_PRICE_VND = 40_000_000L;
    public static final long BID_STEP_VND = 5_000_000L;

    // Khoảng thời gian cuối phiên: có lượt đặt giá thì phiên được gia hạn (theo
    // tổng quan dự án)
    public static final int LATE_BID_WINDOW_SECONDS = 10;

    // Số lượt đặt giá trong 5 giây được coi là bất thường (dùng để tô đỏ)
    public static final int BID_WARNING_THRESHOLD = 10;

    // Kết nối UDP tới UDP server
    public static final String UDP_SERVER_HOST = "127.0.0.1";
    public static final int UDP_PING_PORT = 9002;
    public static final long PING_INTERVAL_MS = 1000;
    public static final long DATA_STALE_MS = 3000;

    // Ngưỡng cảnh báo RTT (ms), có thể đổi bằng biến môi trường RTT_WARN_MS,
    // RTT_CRIT_MS
    public static final int RTT_WARN_MS = envInt("RTT_WARN_MS", 150);
    public static final int RTT_CRIT_MS = envInt("RTT_CRIT_MS", 300);

    private static int envInt(String name, int defaultValue) {
        String v = System.getenv(name);
        return (v == null || v.isBlank()) ? defaultValue : Integer.parseInt(v.trim());
    }

    // ===== Kết nối tới auction-core-service (dữ liệu thật) =====
    /** core (mặc định): lấy từ core. mock: dùng dữ liệu giả để demo. */
    public static final String DATA_SOURCE = envString("ADMIN_DATA_SOURCE", "core");
    public static final String CORE_BASE_URL = envString("CORE_BASE_URL", "http://localhost:8080");
    public static final String CORE_TCP_HOST = envString("CORE_TCP_HOST", "localhost");
    public static final int CORE_TCP_PORT = Integer.parseInt(envString("CORE_TCP_PORT", "9090"));
    public static final String CORE_ADMIN_USER = configuredString("CORE_ADMIN_USER", "admin-console", "core-admin-user", "");
    public static final String CORE_ADMIN_PASSWORD = configuredString("CORE_ADMIN_PASSWORD", "admin-console", "core-admin-password", "");
    public static final String TCP_CONTROL_SECRET = configuredString("TCP_CONTROL_SECRET", "tcp", "control", "secret", "");

    private static String envString(String name, String defaultValue) {
        String v = System.getenv(name);
        return (v == null || v.isBlank()) ? defaultValue : v.trim();
    }

    private static String configuredString(String envName, String section, String key, String defaultValue) {
        String envValue = System.getenv(envName);
        if (envValue != null && !envValue.isBlank()) return envValue.trim();
        return yamlValue(List.of(section, key)).orElse(defaultValue);
    }

    private static String configuredString(String envName, String section, String subsection, String key,
                                           String defaultValue) {
        String envValue = System.getenv(envName);
        if (envValue != null && !envValue.isBlank()) return envValue.trim();
        return yamlValue(List.of(section, subsection, key)).orElse(defaultValue);
    }

    private static java.util.Optional<String> yamlValue(List<String> keyPath) {
        String configuredPath = System.getenv("CORE_APPLICATION_CONFIG");
        List<Path> candidates = configuredPath == null || configuredPath.isBlank()
                ? List.of(Path.of("source/server/auction-core-service/src/main/resources/application.yml"),
                        Path.of("../auction-core-service/src/main/resources/application.yml"))
                : List.of(Path.of(configuredPath));

        for (Path candidate : candidates) {
            if (!Files.isRegularFile(candidate)) continue;
            try {
                List<String> lines = Files.readAllLines(candidate);
                int[] sectionIndents = new int[keyPath.size()];
                java.util.Arrays.fill(sectionIndents, -1);
                for (String line : lines) {
                    String trimmed = line.trim();
                    if (trimmed.isEmpty() || trimmed.startsWith("#") || !trimmed.contains(":")) continue;
                    int indent = line.length() - line.stripLeading().length();
                    String name = trimmed.substring(0, trimmed.indexOf(':')).trim();
                    for (int depth = keyPath.size() - 1; depth >= 0; depth--) {
                        if (name.equals(keyPath.get(depth)) && (depth == 0 || sectionIndents[depth - 1] >= 0
                                && indent > sectionIndents[depth - 1])) {
                            if (depth == keyPath.size() - 1) {
                                String value = trimmed.substring(trimmed.indexOf(':') + 1).trim();
                                if (!value.isEmpty()) return java.util.Optional.of(unquote(value));
                            }
                            sectionIndents[depth] = indent;
                            for (int reset = depth + 1; reset < sectionIndents.length; reset++) {
                                sectionIndents[reset] = -1;
                            }
                            break;
                        }
                    }
                }
            } catch (IOException ignored) {
                // Keep environment/default values if the optional local config cannot be read.
            }
        }
        return java.util.Optional.empty();
    }

    private static String unquote(String value) {
        if (value.length() >= 2 && ((value.startsWith("\"") && value.endsWith("\""))
                || (value.startsWith("'") && value.endsWith("'")))) {
            return value.substring(1, value.length() - 1);
        }
        return value;
    }
}
