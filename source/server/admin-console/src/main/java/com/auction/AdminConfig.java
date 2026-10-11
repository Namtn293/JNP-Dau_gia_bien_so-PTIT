package com.auction;

/**
 * Cấu hình chung cho Admin Console.
 * Khi đổi IP, tên vận hành hoặc mặc định khác, chỉ cần sửa ở đây.
 */
public final class AdminConfig {
    private AdminConfig() { }

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

    // Khoảng thời gian cuối phiên: có lượt đặt giá thì phiên được gia hạn (theo tổng quan dự án)
    public static final int LATE_BID_WINDOW_SECONDS = 10;

    // Số lượt đặt giá trong 5 giây được coi là bất thường (dùng để tô đỏ)
    public static final int BID_WARNING_THRESHOLD = 10;
}