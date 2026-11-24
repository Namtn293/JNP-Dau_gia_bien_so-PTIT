package com.ptit.bigdata.coreservice.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuctionLotVO {
    private String roomId;
    private String plateNumber;
    private String provinceName;
    private String plateType;
    private Long currentPrice;
    private String status; // AuctionStatusEnum value, including END and COMPLETED
    private String timeLabel;
    private boolean isCurrent;
}
