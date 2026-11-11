package com.ptit.bigdata.coreservice.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomEventVO {
    private String roomId;
    private String event; // JOIN, LEAVE, HALT, RESUME, CANCEL, END, ANNOUNCEMENT, ANNOUNCEMENT_REMOVED
    private String message;
    private Integer participantCount;
    private String timestamp;
    private Boolean pinned;
    private String level;
    private Long announcementId;
    private String adminName;
    private Long remainingSeconds;
    private String endTime;
    private Long endTimeEpochMs;
    private Long serverTimeMs;

    public RoomEventVO(String roomId, String event, String message, Integer participantCount, String timestamp) {
        this.roomId = roomId;
        this.event = event;
        this.message = message;
        this.participantCount = participantCount;
        this.timestamp = timestamp;
    }
}
