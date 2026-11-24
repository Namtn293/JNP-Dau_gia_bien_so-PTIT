package com.auction.model;

public record RoomInfo(
        String id,
        String plate,
        String region,
        RoomStatus status,
        int participantCount,
        long currentPrice,
        String remainingLabel,
        Long depositAmount) {

    /** Khởi tạo đối tượng dữ liệu với các giá trị được cung cấp. */
    public RoomInfo(String id, String plate, String region, RoomStatus status,
            int participantCount, long currentPrice, String remainingLabel) {
        this(id, plate, region, status, participantCount, currentPrice, remainingLabel, null);
    }

    /** Tạo bản sao dữ liệu phòng với trạng thái mới. */
    public RoomInfo withStatus(RoomStatus newStatus) {
        return new RoomInfo(id, plate, region, newStatus, participantCount, currentPrice, remainingLabel,
                depositAmount);
    }

    /** Tạo bản sao dữ liệu phòng với nhãn thời gian mới. */
    public RoomInfo withRemaining(String newRemaining) {
        return new RoomInfo(id, plate, region, status, participantCount, currentPrice, newRemaining, depositAmount);
    }
}
