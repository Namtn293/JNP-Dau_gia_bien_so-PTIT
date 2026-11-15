package com.ptit.bigdata.coreservice.repository;

import com.ptit.bigdata.coreservice.entity.NotificationLog;
import com.ptit.bigdata.coreservice.enumration.NotificationTypeEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    boolean existsByUserIdAndSessionIdAndType(Long userId, Long sessionId, NotificationTypeEnum type);
}

