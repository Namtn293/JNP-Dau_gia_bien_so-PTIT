package com.auction.model;

/** Trạng thái phòng đấu giá, khớp với sơ đồ trong tổng quan dự án. */
public enum RoomStatus {
    SCHEDULED("Đã lên lịch"),
    WAITING("Phòng chờ"),
    ACTIVE("Đang đấu giá"),
    EXTENDING("Đang gia hạn"),
    PAUSED("Tạm dừng"),
    CLOSED("Đã đóng"),
    SETTLED("Đã quyết toán");

    private final String label;

    RoomStatus(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    /** HALT chỉ áp dụng khi phiên đang chạy. */
    public boolean canHalt() {
        return this == ACTIVE || this == EXTENDING;
    }

    /** RESUME chỉ áp dụng khi phiên đang tạm dừng. */
    public boolean canResume() {
        return this == PAUSED;
    }

    /** Phiên đã kết thúc thì không thể hủy nữa. */
    public boolean isFinished() {
        return this == CLOSED || this == SETTLED;
    }

    /** Hiển thị nhãn tiếng Việt trong bảng và bộ lọc. */
    @Override
    public String toString() {
        return label;
    }
}
