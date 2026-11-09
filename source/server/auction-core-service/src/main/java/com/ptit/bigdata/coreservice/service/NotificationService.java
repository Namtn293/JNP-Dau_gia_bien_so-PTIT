package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.enumration.NotificationTypeEnum;
import com.ptit.bigdata.coreservice.model.vo.NotificationVO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {
    void notifyUsers(List<Long> userIds, NotificationTypeEnum type, String title, String content, String sessionCode);

    void notifyUser(Long userId, NotificationTypeEnum type, String title, String content, String sessionCode);

    Page<NotificationVO> getNotifications(Long userId, boolean unreadOnly, Pageable pageable);

    long getUnreadCount(Long userId);

    void markAsRead(Long userId, Long notificationId);

    void markAllAsRead(Long userId);
}

