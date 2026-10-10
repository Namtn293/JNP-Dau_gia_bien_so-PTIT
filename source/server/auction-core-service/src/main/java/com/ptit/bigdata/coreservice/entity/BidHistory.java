package com.ptit.bigdata.coreservice.entity;

import com.ptit.bigdata.coreservice.core.util.EntityBase;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
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
