package com.ptit.bigdata.coreservice.entity;

import com.ptit.bigdata.coreservice.core.util.EntityBase;
import com.ptit.bigdata.coreservice.enumration.AnnouncementLevelEnum;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ROOM_ANNOUNCEMENT", indexes = {
        @Index(name = "idx_announcement_session_created", columnList = "SESSION_ID, CREATED_AT")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomAnnouncement extends EntityBase {

    @Column(name = "SESSION_ID", nullable = false)
    private Long sessionId;

    @Column(name = "SESSION_CODE", nullable = false, length = 50)
    private String sessionCode;

    @Column(name = "ADMIN_USER_ID")
    private Long adminUserId;

    @Column(name = "ADMIN_NAME", length = 100)
    private String adminName;

    @Column(name = "CONTENT", nullable = false, length = 1000)
    private String content;

    @Column(name = "PINNED", nullable = false)
    @Builder.Default
    private Boolean pinned = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "LEVEL", nullable = false, length = 20)
    @Builder.Default
    private AnnouncementLevelEnum level = AnnouncementLevelEnum.INFO;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.pinned == null) {
            this.pinned = false;
        }
        if (this.level == null) {
            this.level = AnnouncementLevelEnum.INFO;
        }
    }
}

