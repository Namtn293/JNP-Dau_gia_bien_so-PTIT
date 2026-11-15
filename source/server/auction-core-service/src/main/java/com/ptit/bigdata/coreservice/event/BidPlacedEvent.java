package com.ptit.bigdata.coreservice.event;

import com.ptit.bigdata.coreservice.enumration.BidSourceEnum;

import java.time.LocalDateTime;

public record BidPlacedEvent(
        Long sessionId,
        String sessionCode,
        String plateNumber,
        Long bidHistoryId,
        Long userId,
        String username,
        String fullName,
        Long previousLeaderUserId,
        String previousLeaderUsername,
        Long previousPrice,
        Long newPrice,
        Long nextStep,
        Long nextMinBid,
        int bidCount,
        LocalDateTime bidTime,
        BidSourceEnum source,
        String clientIp
) {}

