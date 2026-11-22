package com.ptit.bigdata.coreservice.entity;

import com.ptit.bigdata.coreservice.core.util.EntityBase;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ROOM_CHAT_MESSAGE", indexes = {
        @Index(name = "idx_room_chat_code_created", columnList = "ROOM_CODE, CREATED_AT")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomChatMessage extends EntityBase {

    @Column(name = "MESSAGE_UUID", nullable = false, length = 80)
    private String messageUuid;

    @Column(name = "SESSION_ID")
    private Long sessionId;

    @Column(name = "ROOM_CODE", nullable = false, length = 80)
    private String roomCode;

    @Column(name = "SENDER_ID")
    private Long senderId;

    @Column(name = "SENDER_NAME", nullable = false, length = 120)
    private String senderName;

    @Column(name = "CONTENT", nullable = false, length = 500)
    private String content;

    @Column(name = "MESSAGE_TYPE", nullable = false, length = 20)
    @Builder.Default
    private String messageType = "CHAT";

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.messageType == null || this.messageType.isBlank()) {
            this.messageType = "CHAT";
        }
        if (this.messageUuid == null || this.messageUuid.isBlank()) {
            this.messageUuid = java.util.UUID.randomUUID().toString();
        }
    }
}

