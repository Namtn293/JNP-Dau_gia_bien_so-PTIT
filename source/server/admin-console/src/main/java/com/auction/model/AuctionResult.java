package com.auction.model;

public record AuctionResult(
        String sessionCode,
        String plate,
        String status,
        long finalPrice,
        long depositAmount,
        String winnerUserId,
        String winnerName,
        String winnerEmail,
        String endTime) {
}
