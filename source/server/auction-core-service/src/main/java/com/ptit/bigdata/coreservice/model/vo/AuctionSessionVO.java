package com.ptit.bigdata.coreservice.model.vo;

import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.enumration.PlateTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuctionSessionVO {
    private String plateNumber;
    private String provinceName;
    private String plateType;
    private Long price;
    private String sessionStatus;
    private String startTime;
    private String endTime;
    private Long stepPrice;
    private Long participantCount;
    private Long endPrice;

    public AuctionSessionVO(
            String plateNumber,
            String provinceName,
            PlateTypeEnum plateType,
            Long price,
            AuctionStatusEnum sessionStatus,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Long stepPrice,
            Long participantCount,
            Long endPrice
    ) {
        this.plateNumber = plateNumber;
        this.provinceName = provinceName;
        this.plateType = plateType != null ? plateType.getDescription() : null;
        this.price = price;
        this.sessionStatus = sessionStatus != null ? sessionStatus.getDescription() : null;
        this.startTime = startTime != null ? startTime.toString() : null;
        this.endTime = endTime != null ? endTime.toString() : null;
        this.stepPrice = stepPrice;
        this.participantCount = participantCount;
        this.endPrice = endPrice;
    }
}
