package com.ptit.bigdata.coreservice.entity;

import com.ptit.bigdata.coreservice.core.util.EntityBase;
import com.ptit.bigdata.coreservice.enumration.NotificationTypeEnum;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "NOTIFICATION_LOG", indexes = {
        @Index(name = "idx_notif_log_user_session_type", columnList = "USER_ID, SESSION_ID, TYPE", unique = true)
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationLog extends EntityBase {

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "SESSION_ID", nullable = false)
    private Long sessionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "TYPE", nullable = false, length = 30)
    private NotificationTypeEnum type;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}

