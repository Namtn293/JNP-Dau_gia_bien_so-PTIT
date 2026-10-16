package com.ptit.bigdata.coreservice.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminRoomVO {
    private String id;
    private String plate;
    private String region;
    private String status;
    private int participantCount;
    private long currentPrice;
    private String remainingLabel;
    private int rttMs;
}
