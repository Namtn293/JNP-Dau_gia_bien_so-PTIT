package com.auction.udp.config;

/** Cấu hình cổng UDP, địa chỉ admin, chu kỳ gửi và ngưỡng cảnh báo. */
public record UdpServerConfig(
        int metricsPort,
        int pingPort,
        String adminHost,
        int adminPort,
        long intervalMs,
        long staleMs,
        double cpuWarn,
        double cpuCrit,
        double ramWarn,
        double ramCrit) {

    /** Đọc biến môi trường và dùng giá trị mặc định như phiên bản gốc. */
    public static UdpServerConfig fromEnv() {
        return new UdpServerConfig(
                Integer.parseInt(env("UDP_METRICS_PORT", "9001")),
                Integer.parseInt(env("UDP_PING_PORT", "9002")),
                env("ADMIN_HOST", "127.0.0.1"),
                Integer.parseInt(env("ADMIN_PORT", "8888")),
                Long.parseLong(env("FORWARD_INTERVAL_MS", "1000")),
                Long.parseLong(env("CORE_STALE_MS", "3000")),
                Double.parseDouble(env("CPU_WARN", "85")),
                Double.parseDouble(env("CPU_CRIT", "95")),
                Double.parseDouble(env("RAM_WARN", "85")),
                Double.parseDouble(env("RAM_CRIT", "95")));
    }

    /** Bỏ khoảng trắng và sử dụng mặc định nếu biến môi trường chưa có. */
    private static String env(String name, String fallback) {
        String value = System.getenv(name);
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}
