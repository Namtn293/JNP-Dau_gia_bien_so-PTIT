package com.ptit.bigdata.coreservice.model.vo;

import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.enumration.RegistrationStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyAuctionHistoryVO {
    private String sessionCode;
    private String plateNumber;
    private String provinceName;
    private AuctionStatusEnum status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer myBidCount;
    private Integer myAutoBidCount;
    private Long myHighestBid;
    private LocalDateTime myLastBidAt;
    private Long finalPrice;
    private RegistrationStatusEnum depositStatus;
    private String result; // LEADING | OUTBID | WON | LOST
}

