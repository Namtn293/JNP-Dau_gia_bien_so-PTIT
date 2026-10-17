package com.ptit.bigdata.coreservice.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidMessageVO {
    private String roomId;
    private String userId;
    private String userName;
    private Long bidAmount;
    private Long currentPrice;
    private String timestamp;
    @Builder.Default
    private String type = "BID"; // BID, EXTEND, NEW_HIGHEST
}
