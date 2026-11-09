package com.ptit.bigdata.coreservice.model.vo;

import com.ptit.bigdata.coreservice.configuration.AuctionProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceSeriesVO {
    private String sessionCode;
    private Long startPrice;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<PricePointVO> points;
    private List<AuctionProperties.StepTier> stepTiers;
}

