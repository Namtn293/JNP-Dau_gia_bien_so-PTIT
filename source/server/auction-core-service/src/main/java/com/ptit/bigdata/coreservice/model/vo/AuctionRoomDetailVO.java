package com.ptit.bigdata.coreservice.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuctionRoomDetailVO {
    private String sessionCode;
    private String title;
    private String plateNumber;
    private String provinceName;
    private String plateType;
    private String vehicleType;
    private Long startPrice;
    private Long currentPrice;
    private Long endPrice;
    private Long stepPrice;
    private Long depositAmount;
    private String startTime;
    private String endTime;
    private Long remainingSeconds;
    private String status; // LIVE, SOON, END
    private Integer bidCount;
    private Long participantCount;
    private String leadingUser;
    private Boolean reserveMet;
    private String pinnedNotice;
    private List<AuctionLotVO> lots;
    private List<BidHistoryItemVO> initialBids;
}
