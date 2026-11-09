package com.ptit.bigdata.coreservice.model.dto;

import com.ptit.bigdata.coreservice.enumration.AnnouncementLevelEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementDTO {
    private String content;
    @Builder.Default
    private Boolean pinned = false;
    @Builder.Default
    private AnnouncementLevelEnum level = AnnouncementLevelEnum.INFO;
    @Builder.Default
    private boolean notifyWatchers = false;
}

