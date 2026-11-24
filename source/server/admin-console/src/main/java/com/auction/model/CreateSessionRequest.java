
package com.auction.model;

import java.time.LocalDateTime;

public record CreateSessionRequest(
                String plateNumber,
                long startPrice,
                long depositAmount,
                LocalDateTime startTime,
                LocalDateTime endTime) {
}
