package com.ptit.bigdata.coreservice.model.vo;

import com.ptit.bigdata.coreservice.enumration.BidSourceEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidResultVO {
    private Long sessionId;
    private String sessionCode;
    private String plateNumber;
    private Long currentPrice;
    private Integer bidCount;
    private Long nextStep;
    private Long nextMinBid;
    private Long userId;
    private String userName;
    private BidSourceEnum source;
    private LocalDateTime bidTime;
    private String timestamp;
}

