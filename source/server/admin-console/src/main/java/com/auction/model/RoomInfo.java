package com.auction.model;

public record RoomInfo(
        String id,
        String plate,
        String region,
        RoomStatus status,
        int participantCount,
        long currentPrice,
        String remainingLabel,
        int rttMs) {

    public RoomInfo withStatus(RoomStatus newStatus) {
        return new RoomInfo(id, plate, region, newStatus, participantCount, currentPrice, remainingLabel, rttMs);
    }

    public RoomInfo withRemaining(String newRemaining) {
        return new RoomInfo(id, plate, region, status, participantCount, currentPrice, newRemaining, rttMs);
    }
}