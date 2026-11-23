package com.auction.model;

public record RoomInfo(
        String id,
        String plate,
        String region,
        RoomStatus status,
        int participantCount,
        long currentPrice,
        String remainingLabel) {

    public RoomInfo withStatus(RoomStatus newStatus) {
        return new RoomInfo(id, plate, region, newStatus, participantCount, currentPrice, remainingLabel);
    }

    public RoomInfo withRemaining(String newRemaining) {
        return new RoomInfo(id, plate, region, status, participantCount, currentPrice, newRemaining);
    }
}
