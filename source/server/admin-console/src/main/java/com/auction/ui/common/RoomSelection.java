package com.auction.ui.common;

/**
 * Mã phòng đang được chọn, dùng chung giữa tab Giám sát và tab Điều khiển phiên.
 * Chỉ đọc và ghi trên EDT.
 */
public final class RoomSelection {
    private String roomId;

    public String roomId() {
        return roomId;
    }

    public void select(String roomId) {
        this.roomId = roomId;
    }
}