package com.ptit.bigdata.coreservice.service.implement;

import com.ptit.bigdata.coreservice.core.auth.entity.User;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.entity.Notification;
import com.ptit.bigdata.coreservice.enumration.NotificationTypeEnum;
import com.ptit.bigdata.coreservice.model.vo.NotificationVO;
import com.ptit.bigdata.coreservice.repository.NotificationRepository;
import com.ptit.bigdata.coreservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void notifyUsers(List<Long> userIds, NotificationTypeEnum type, String title, String content, String sessionCode) {
        if (userIds == null || userIds.isEmpty()) return;

        LocalDateTime now = LocalDateTime.now();
        List<Notification> notifications = new ArrayList<>();
        for (Long uid : userIds) {
            notifications.add(Notification.builder()
                    .userId(uid)
                    .type(type)
                    .title(title)
                    .content(content)
                    .sessionCode(sessionCode)
                    .isRead(false)
                    .createdAt(now)
                    .build());
        }
        notifications = notificationRepository.saveAll(notifications);

        // Lấy danh sách username để push WebSocket qua /user/queue/notifications
        List<User> users = userRepository.findAllById(userIds);
        Map<Long, String> userMap = users.stream().collect(Collectors.toMap(User::getId, User::getUsername));

        for (Notification notif : notifications) {
            String username = userMap.get(notif.getUserId());
            if (username != null) {
                NotificationVO vo = mapToVO(notif);
                try {
                    messagingTemplate.convertAndSendToUser(username, "/queue/notifications", vo);
                } catch (Exception e) {
                    log.debug("[NOTIF-WS-FAIL] Không gửi được thông báo tới {}: {}", username, e.getMessage());
                }
            }
        }
    }

    @Override
    @Transactional
    public void notifyUser(Long userId, NotificationTypeEnum type, String title, String content, String sessionCode) {
        if (userId == null) return;
        notifyUsers(List.of(userId), type, title, content, sessionCode);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationVO> getNotifications(Long userId, boolean unreadOnly, Pageable pageable) {
        if (userId == null) {
            return Page.empty(pageable);
        }
        Page<Notification> page = unreadOnly
                ? notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable)
                : notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return page.map(this::mapToVO);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        if (userId == null) return 0;
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        if (userId == null || notificationId == null) return;
        notificationRepository.findByIdAndUserId(notificationId, userId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        if (userId == null) return;
        notificationRepository.markAllAsRead(userId);
    }

    private NotificationVO mapToVO(Notification n) {
        return NotificationVO.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .content(n.getContent())
                .sessionCode(n.getSessionCode())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}

