package com.ptit.bigdata.coreservice.entity;

import com.ptit.bigdata.coreservice.core.util.EntityBase;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "AUCTION_SESSION", indexes = {
        @Index(name = "idx_auction_session_code", columnList = "SESSION_CODE", unique = true),
        @Index(name = "idx_auction_session_status", columnList = "STATUS")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionSession extends EntityBase {

    @Column(name = "SESSION_CODE", nullable = false, unique = true, length = 50)
    private String sessionCode;

    @Column(name = "TITLE", nullable = false, length = 255)
    private String title;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "PLATE_ID", nullable = false)
    private NumberPlate numberPlate;

    @Column(name = "START_PRICE", nullable = false)
    private Long startPrice;

    @Column(name = "CURRENT_PRICE", nullable = false)
    private Long currentPrice;

    @Column(name = "STEP_PRICE", nullable = false)
    private Long stepPrice;

    @Column(name = "DEPOSIT_AMOUNT")
    @Builder.Default
    private Long depositAmount = 40_000_000L;

    @Column(name = "START_TIME", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "END_TIME", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 20)
    @Builder.Default
    private AuctionStatusEnum status = AuctionStatusEnum.SOON;

    @Column(name = "BID_COUNT")
    @Builder.Default
    private Integer bidCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WINNER_USER_ID")
    private UserInfo winner;

    @Column(name = "WINNING_PRICE")
    private Long winningPrice;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.currentPrice == null) {
            this.currentPrice = this.startPrice;
        }
        if (this.depositAmount == null) {
            this.depositAmount = 40_000_000L;
        }
        if (this.bidCount == null) {
            this.bidCount = 0;
        }
        if (this.status == null) {
            this.status = AuctionStatusEnum.SOON;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
