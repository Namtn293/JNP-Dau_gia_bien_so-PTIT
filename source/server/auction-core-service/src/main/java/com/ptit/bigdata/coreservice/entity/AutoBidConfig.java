package com.ptit.bigdata.coreservice.entity;

import com.ptit.bigdata.coreservice.core.util.EntityBase;
import com.ptit.bigdata.coreservice.enumration.AutoBidStopReasonEnum;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "AUTO_BID_CONFIG", indexes = {
        @Index(name = "idx_autobid_user_session", columnList = "USER_ID, SESSION_ID", unique = true),
        @Index(name = "idx_autobid_session_active", columnList = "SESSION_ID, ACTIVE")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AutoBidConfig extends EntityBase {

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "SESSION_ID", nullable = false)
    private Long sessionId;

    @Column(name = "MAX_AMOUNT", nullable = false)
    private Long maxAmount;

    @Column(name = "ACTIVE", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "STOPPED_REASON", length = 30)
    private AutoBidStopReasonEnum stoppedReason;

    @Column(name = "AUTO_BID_COUNT")
    @Builder.Default
    private Integer autoBidCount = 0;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.active == null) {
            this.active = true;
        }
        if (this.autoBidCount == null) {
            this.autoBidCount = 0;
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

