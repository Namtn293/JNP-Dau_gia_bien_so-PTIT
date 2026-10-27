package com.auction;

/**
 * Cấu hình chung cho Admin Console.
 * Khi đổi IP, tên vận hành hoặc mặc định khác, chỉ cần sửa ở đây.
 */
public final class AdminConfig {
    private AdminConfig() {
    }

    // Máy chủ
    public static final String SERVER_ADDRESS = "10.20.0.15"; // Lấy bằng ifconfig khi chạy thật
    public static final String CLUSTER_NAME = "Cụm Hà Nội";
    public static final String REGION = "Hà Nội";

    // Người vận hành
    public static final String OPERATOR_NAME = "Nguyễn Gia Bảo";
    public static final String OPERATOR_ROLE = "Quản trị viên • Ca trực 14:00–22:00";

    // Mặc định khi mở màn hình
    public static final String DEFAULT_ROOM_ID = "AUC-1023";
    public static final String DEFAULT_KICK_ACCOUNT = "U-0842";

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
    public static final String CORE_ADMIN_USER = envString("CORE_ADMIN_USER", "");
    public static final String CORE_ADMIN_PASSWORD = envString("CORE_ADMIN_PASSWORD", "");

    private static String envString(String name, String defaultValue) {
        String v = System.getenv(name);
        return (v == null || v.isBlank()) ? defaultValue : v.trim();
    }
}