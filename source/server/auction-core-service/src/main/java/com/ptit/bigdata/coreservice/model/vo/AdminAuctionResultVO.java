package com.ptit.bigdata.coreservice.model.vo;

import java.time.LocalDateTime;

public record AdminAuctionResultVO(
        String sessionCode,
        String plate,
        String status,
        long finalPrice,
        long depositAmount,
        Long winnerUserId,
        String winnerName,
        String winnerEmail,
        LocalDateTime endTime) {
}
