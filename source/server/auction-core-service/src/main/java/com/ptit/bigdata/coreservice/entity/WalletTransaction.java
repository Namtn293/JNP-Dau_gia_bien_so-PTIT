package com.ptit.bigdata.coreservice.entity;

import com.ptit.bigdata.coreservice.core.util.EntityBase;
import com.ptit.bigdata.coreservice.enumration.WalletTxTypeEnum;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "WALLET_TRANSACTION", indexes = {
        @Index(name = "idx_wallet_tx_wallet_created", columnList = "WALLET_ID, CREATED_AT")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTransaction extends EntityBase {

    @Column(name = "WALLET_ID", nullable = false)
    private Long walletId;

    @Enumerated(EnumType.STRING)
    @Column(name = "TYPE", nullable = false, length = 20)
    private WalletTxTypeEnum type;

    @Column(name = "AMOUNT", nullable = false)
    private Long amount;

    @Column(name = "BALANCE_AFTER", nullable = false)
    private Long balanceAfter;

    @Column(name = "HELD_AFTER", nullable = false)
    private Long heldAfter;

    @Column(name = "SESSION_CODE", length = 50)
    private String sessionCode;

    @Column(name = "NOTE", length = 255)
    private String note;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}

