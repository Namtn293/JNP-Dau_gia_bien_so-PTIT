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
    private Long bidAmount;
    private String time;
    private Boolean isWinning;
}
