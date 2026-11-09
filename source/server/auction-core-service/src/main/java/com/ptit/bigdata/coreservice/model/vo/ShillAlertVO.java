package com.ptit.bigdata.coreservice.model.vo;

import com.ptit.bigdata.coreservice.enumration.ShillAlertStatusEnum;
import com.ptit.bigdata.coreservice.enumration.ShillSeverityEnum;
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
public class ShillAlertVO {
    private Long id;
    private Long sessionId;
    private String sessionCode;
    private Long userAId;
    private String userAName;
    private Long userBId;
    private String userBName;
    private Integer bidCount;
    private Long minGapSeconds;
    private Double avgGapSeconds;
    private Boolean sameIp;
    private ShillSeverityEnum severity;
    private ShillAlertStatusEnum status;
    private LocalDateTime firstBidAt;
    private LocalDateTime lastBidAt;
    private Long reviewedBy;
    private LocalDateTime reviewedAt;
    private String note;
    private List<BidHistoryItemVO> recentBids;
}

