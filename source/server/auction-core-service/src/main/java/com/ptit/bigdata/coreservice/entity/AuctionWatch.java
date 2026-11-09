package com.ptit.bigdata.coreservice.entity;

import com.ptit.bigdata.coreservice.core.util.EntityBase;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "AUCTION_WATCH", indexes = {
        @Index(name = "idx_watch_user_session", columnList = "USER_ID, SESSION_ID", unique = true),
        @Index(name = "idx_watch_session", columnList = "SESSION_ID")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionWatch extends EntityBase {

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "SESSION_ID", nullable = false)
    private Long sessionId;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}

