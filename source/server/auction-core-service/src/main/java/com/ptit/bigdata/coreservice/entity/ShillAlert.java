package com.ptit.bigdata.coreservice.entity;

import com.ptit.bigdata.coreservice.core.util.EntityBase;
import com.ptit.bigdata.coreservice.enumration.ShillAlertStatusEnum;
import com.ptit.bigdata.coreservice.enumration.ShillSeverityEnum;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "SHILL_ALERT", indexes = {
        @Index(name = "idx_shill_session_status", columnList = "SESSION_ID, STATUS"),
        @Index(name = "idx_shill_users", columnList = "USER_A_ID, USER_B_ID")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShillAlert extends EntityBase {

    @Column(name = "SESSION_ID", nullable = false)
    private Long sessionId;

    @Column(name = "SESSION_CODE", nullable = false, length = 50)
    private String sessionCode;

    @Column(name = "USER_A_ID", nullable = false)
    private Long userAId;

    @Column(name = "USER_B_ID", nullable = false)
    private Long userBId;

    @Column(name = "BID_COUNT", nullable = false)
    private Integer bidCount;

    @Column(name = "MIN_GAP_SECONDS")
    private Long minGapSeconds;

    @Column(name = "AVG_GAP_SECONDS")
    private Double avgGapSeconds;

    @Column(name = "SAME_IP")
    @Builder.Default
    private Boolean sameIp = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "SEVERITY", nullable = false, length = 20)
    private ShillSeverityEnum severity;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 20)
    @Builder.Default
    private ShillAlertStatusEnum status = ShillAlertStatusEnum.OPEN;

    @Column(name = "FIRST_BID_AT")
    private LocalDateTime firstBidAt;

    @Column(name = "LAST_BID_AT")
    private LocalDateTime lastBidAt;

    @Column(name = "REVIEWED_BY")
    private Long reviewedBy;

    @Column(name = "REVIEWED_AT")
    private LocalDateTime reviewedAt;

    @Column(name = "NOTE", length = 255)
    private String note;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = ShillAlertStatusEnum.OPEN;
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

