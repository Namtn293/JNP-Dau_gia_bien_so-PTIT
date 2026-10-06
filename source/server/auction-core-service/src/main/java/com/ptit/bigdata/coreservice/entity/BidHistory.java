package com.ptit.bigdata.coreservice.entity;

import com.ptit.bigdata.coreservice.core.util.EntityBase;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "BID_HISTORY", indexes = {
        @Index(name = "idx_bid_history_session", columnList = "SESSION_ID"),
        @Index(name = "idx_bid_history_user", columnList = "USER_ID")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidHistory extends EntityBase {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SESSION_ID", nullable = false)
    private AuctionSession auctionSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private UserInfo user;

    @Column(name = "BID_AMOUNT", nullable = false)
    private Long bidAmount;

    @Column(name = "BID_TIME", nullable = false)
    private LocalDateTime bidTime;

    @Column(name = "IS_WINNING_BID")
    @Builder.Default
    private Boolean isWinningBid = false;

    @PrePersist
    public void prePersist() {
        if (this.bidTime == null) {
            this.bidTime = LocalDateTime.now();
        }
        if (this.isWinningBid == null) {
            this.isWinningBid = false;
        }
    }
}
