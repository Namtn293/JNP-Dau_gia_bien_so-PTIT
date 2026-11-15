package com.ptit.bigdata.coreservice.entity;

import com.ptit.bigdata.coreservice.core.util.EntityBase;
import com.ptit.bigdata.coreservice.enumration.RegistrationStatusEnum;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "AUCTION_REGISTRATION", indexes = {
        @Index(name = "idx_reg_user_session", columnList = "USER_ID, SESSION_ID", unique = true),
        @Index(name = "idx_reg_session_status", columnList = "SESSION_ID, STATUS")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionRegistration extends EntityBase {

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "SESSION_ID", nullable = false)
    private Long sessionId;

    @Column(name = "DEPOSIT_AMOUNT", nullable = false)
    private Long depositAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 20)
    @Builder.Default
    private RegistrationStatusEnum status = RegistrationStatusEnum.ACTIVE;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = RegistrationStatusEnum.ACTIVE;
        }
    }
}

