package com.ptit.bigdata.coreservice.entity;

import com.ptit.bigdata.coreservice.core.util.EntityBase;
import com.ptit.bigdata.coreservice.enumration.BidSourceEnum;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "bid_history", indexes = {
        @Index(name = "idx_bid_history_session_time", columnList = "auctionSessionId, BID_TIME"),
        @Index(name = "idx_bid_history_user_time", columnList = "userID, BID_TIME")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidHistory extends EntityBase {

    private Long auctionSessionId;

    private Long userID;

    @Column(name = "BID_AMOUNT", nullable = false)
    private Long bidAmount;

    @Column(name = "BID_TIME", nullable = false)
    private LocalDateTime bidTime;

    @Column(name = "IS_WINNING_BID")
    @Builder.Default
    private Boolean isWinningBid = false;

    @Column(name = "PREVIOUS_PRICE")
    private Long previousPrice;

    @Column(name = "STEP_APPLIED")
    private Long stepApplied;

    @Column(name = "CLIENT_IP", length = 64)
    private String clientIp;

    @Enumerated(EnumType.STRING)
    @Column(name = "SOURCE", length = 20)
    @Builder.Default
    private BidSourceEnum source = BidSourceEnum.MANUAL;

    @PrePersist
    public void prePersist() {
        if (this.bidTime == null) {
            this.bidTime = LocalDateTime.now();
        }
        if (this.isWinningBid == null) {
            this.isWinningBid = false;
        }
        if (this.source == null) {
            this.source = BidSourceEnum.MANUAL;
        }
    }
}
