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
    public static final String OPERATOR_NAME = "Nguyễn Minh Anh";
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
}