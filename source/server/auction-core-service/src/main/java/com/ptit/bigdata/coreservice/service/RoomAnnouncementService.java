package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.model.dto.AnnouncementDTO;
import com.ptit.bigdata.coreservice.model.vo.RoomAnnouncementVO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RoomAnnouncementService {
    RoomAnnouncementVO post(String sessionCode, Long adminUserId, AnnouncementDTO dto);

    void delete(String sessionCode, Long announcementId);

    Page<RoomAnnouncementVO> getAnnouncements(String sessionCode, Pageable pageable);

    List<RoomAnnouncementVO> getRecentAnnouncements(String sessionCode);

    RoomAnnouncementVO getPinnedAnnouncement(String sessionCode);
}

