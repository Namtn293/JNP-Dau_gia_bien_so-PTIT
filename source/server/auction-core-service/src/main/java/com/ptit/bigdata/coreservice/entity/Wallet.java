package com.ptit.bigdata.coreservice.entity;

import com.ptit.bigdata.coreservice.core.util.EntityBase;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "WALLET", indexes = {
        @Index(name = "idx_wallet_user_id", columnList = "USER_ID", unique = true)
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet extends EntityBase {

    @Column(name = "USER_ID", nullable = false, unique = true)
    private Long userId;

    @Column(name = "BALANCE", nullable = false)
    @Builder.Default
    private Long balance = 0L;

    @Column(name = "HELD_AMOUNT", nullable = false)
    @Builder.Default
    private Long heldAmount = 0L;

    @Version
    @Column(name = "VERSION")
    private Long version;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.balance == null) this.balance = 0L;
        if (this.heldAmount == null) this.heldAmount = 0L;
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getAvailable() {
        long bal = this.balance != null ? this.balance : 0L;
        long held = this.heldAmount != null ? this.heldAmount : 0L;
        return Math.max(0L, bal - held);
    }
}

