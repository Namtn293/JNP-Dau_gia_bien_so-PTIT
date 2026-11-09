package com.ptit.bigdata.coreservice.service.implement;

import com.ptit.bigdata.coreservice.core.auth.entity.User;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.RoomAnnouncement;
import com.ptit.bigdata.coreservice.entity.UserInfo;
import com.ptit.bigdata.coreservice.enumration.AnnouncementLevelEnum;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import com.ptit.bigdata.coreservice.enumration.NotificationTypeEnum;
import com.ptit.bigdata.coreservice.enumration.RegistrationStatusEnum;
import com.ptit.bigdata.coreservice.model.dto.AnnouncementDTO;
import com.ptit.bigdata.coreservice.model.vo.RoomAnnouncementVO;
import com.ptit.bigdata.coreservice.model.vo.RoomEventVO;
import com.ptit.bigdata.coreservice.repository.*;
import com.ptit.bigdata.coreservice.service.NotificationService;
import com.ptit.bigdata.coreservice.service.RoomAnnouncementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomAnnouncementServiceImpl implements RoomAnnouncementService {

    private final RoomAnnouncementRepository roomAnnouncementRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final UserRepository userRepository;
    private final UserInfoRepository userInfoRepository;
    private final AuctionWatchRepository auctionWatchRepository;
    private final AuctionRegistrationRepository auctionRegistrationRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public RoomAnnouncementVO post(String sessionCode, Long adminUserId, AnnouncementDTO dto) {
        AuctionSession session = auctionSessionRepository.findBySessionCode(sessionCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        String adminName = "Quản trị viên";
        if (adminUserId != null) {
            Optional<User> uOpt = userRepository.findById(adminUserId);
            if (uOpt.isPresent()) {
                adminName = userInfoRepository.findByUserName(uOpt.get().getUsername())
                        .map(UserInfo::getFullName)
                        .orElse(uOpt.get().getUsername());
            }
        }

        String rawContent = dto.getContent() != null ? dto.getContent().trim() : "";
        if (rawContent.length() > 1000) {
            rawContent = rawContent.substring(0, 1000);
        }

        boolean isPinned = Boolean.TRUE.equals(dto.getPinned());
        if (isPinned) {
            roomAnnouncementRepository.clearPinned(session.getId());
        }

        RoomAnnouncement announcement = RoomAnnouncement.builder()
                .sessionId(session.getId())
                .sessionCode(sessionCode)
                .adminUserId(adminUserId)
                .adminName(adminName)
                .content(rawContent)
                .pinned(isPinned)
                .level(dto.getLevel() != null ? dto.getLevel() : AnnouncementLevelEnum.INFO)
                .createdAt(LocalDateTime.now())
                .build();
        announcement = roomAnnouncementRepository.save(announcement);

        // Phát realtime tới /topic/room/{code}
        String timeStr = DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now());
        RoomEventVO event = RoomEventVO.builder()
                .roomId(sessionCode)
                .event("ANNOUNCEMENT")
                .message(rawContent)
                .timestamp(timeStr)
                .build();
        messagingTemplate.convertAndSend("/topic/room/" + sessionCode, event);

        // Gửi thông báo tới watchers & registered participants nếu notifyWatchers = true
        if (dto.isNotifyWatchers()) {
            Set<Long> userIds = new HashSet<>();
            auctionWatchRepository.findBySessionId(session.getId()).forEach(w -> userIds.add(w.getUserId()));
            auctionRegistrationRepository.findBySessionIdAndStatus(session.getId(), RegistrationStatusEnum.ACTIVE)
                    .forEach(r -> userIds.add(r.getUserId()));

            if (!userIds.isEmpty()) {
                String title = "Thông báo từ quản trị viên phòng " + sessionCode;
                notificationService.notifyUsers(new ArrayList<>(userIds), NotificationTypeEnum.ROOM_ANNOUNCEMENT,
                        title, rawContent, sessionCode);
            }
        }

        log.info("[ANNOUNCEMENT-POST] Phiên {}: [{}] đã gửi thông điệp: {}", sessionCode, adminName, rawContent);

        return mapToVO(announcement);
    }

    @Override
    @Transactional
    public void delete(String sessionCode, Long announcementId) {
        RoomAnnouncement announcement = roomAnnouncementRepository.findById(announcementId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ANNOUNCEMENT_NOT_FOUND));

        roomAnnouncementRepository.delete(announcement);

        String timeStr = DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now());
        RoomEventVO event = RoomEventVO.builder()
                .roomId(sessionCode)
                .event("ANNOUNCEMENT_REMOVED")
                .message("Thông báo đã được gỡ bỏ.")
                .timestamp(timeStr)
                .build();
        messagingTemplate.convertAndSend("/topic/room/" + sessionCode, event);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoomAnnouncementVO> getAnnouncements(String sessionCode, Pageable pageable) {
        AuctionSession session = auctionSessionRepository.findBySessionCode(sessionCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        return roomAnnouncementRepository.findBySessionIdOrderByCreatedAtDesc(session.getId(), pageable)
                .map(this::mapToVO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomAnnouncementVO> getRecentAnnouncements(String sessionCode) {
        Optional<AuctionSession> sessionOpt = auctionSessionRepository.findBySessionCode(sessionCode);
        if (sessionOpt.isEmpty()) return Collections.emptyList();

        return roomAnnouncementRepository.findTop10BySessionIdOrderByCreatedAtDesc(sessionOpt.get().getId())
                .stream().map(this::mapToVO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoomAnnouncementVO getPinnedAnnouncement(String sessionCode) {
        Optional<AuctionSession> sessionOpt = auctionSessionRepository.findBySessionCode(sessionCode);
        if (sessionOpt.isEmpty()) return null;

        return roomAnnouncementRepository.findFirstBySessionIdAndPinnedTrueOrderByCreatedAtDesc(sessionOpt.get().getId())
                .map(this::mapToVO).orElse(null);
    }

    private RoomAnnouncementVO mapToVO(RoomAnnouncement r) {
        return RoomAnnouncementVO.builder()
                .id(r.getId())
                .sessionCode(r.getSessionCode())
                .content(r.getContent())
                .pinned(r.getPinned())
                .level(r.getLevel())
                .adminName(r.getAdminName())
                .createdAt(r.getCreatedAt())
                .build();
    }
}

