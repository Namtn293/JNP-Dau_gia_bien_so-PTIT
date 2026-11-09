package com.ptit.bigdata.coreservice.model.vo;

import com.ptit.bigdata.coreservice.enumration.AnnouncementLevelEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomAnnouncementVO {
    private Long id;
    private String sessionCode;
    private String content;
    private Boolean pinned;
    private AnnouncementLevelEnum level;
    private String adminName;
    private LocalDateTime createdAt;
}

