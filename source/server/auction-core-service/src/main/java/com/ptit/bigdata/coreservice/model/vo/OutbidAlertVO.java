package com.ptit.bigdata.coreservice.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutbidAlertVO {
    private String sessionCode;
    private String plateNumber;
    private Long newPrice;
    private Long yourLastBid;
    private Long nextMinBid;
    private Long nextStep;
    private String outbidBy;
    private Long remainingSeconds;
    private Boolean autoBidActive;
    private LocalDateTime bidTime;
}

