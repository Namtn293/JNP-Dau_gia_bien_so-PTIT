package com.ptit.bigdata.coreservice.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidMessageVO {
    private String roomId;
    private String userId;
    private String userName;
    private Long bidAmount;
    private Long currentPrice;
    private String timestamp;
    private String plateNumber;
    private Long stepPrice;
    private Integer bidCount;
    private String status;
    private Long nextStep;
    private Long nextMinBid;
    private String source;
    private String bidTime;
    private Long remainingSeconds;
    private String endTime;
    private Long endTimeEpochMs;
    private Long serverTimeMs;
    private Boolean extended;
    @Builder.Default
    private String type = "BID"; // BID, EXTEND, NEW_HIGHEST
}
