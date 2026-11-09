package com.ptit.bigdata.coreservice.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidHistoryItemVO {
    private String userName;
    private Long userId;
    private Long bidAmount;
    private Long increment;
    private String source;
    private String time;
    private String bidTime; // ISO-8601
    private Boolean isWinning;
}
