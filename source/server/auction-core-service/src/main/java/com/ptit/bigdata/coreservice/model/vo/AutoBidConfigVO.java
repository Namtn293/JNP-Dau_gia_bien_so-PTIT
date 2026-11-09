package com.ptit.bigdata.coreservice.model.vo;

import com.ptit.bigdata.coreservice.enumration.AutoBidStopReasonEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutoBidConfigVO {
    private String sessionCode;
    private Long maxAmount;
    private Boolean active;
    private AutoBidStopReasonEnum stoppedReason;
    private Integer autoBidCount;
    private Long nextMinBid;
    private Long currentPrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

