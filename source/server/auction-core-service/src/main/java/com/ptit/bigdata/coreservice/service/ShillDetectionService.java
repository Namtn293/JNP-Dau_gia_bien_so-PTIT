package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.enumration.ShillAlertStatusEnum;
import com.ptit.bigdata.coreservice.model.dto.ShillAlertReviewDTO;
import com.ptit.bigdata.coreservice.model.vo.ShillAlertVO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ShillDetectionService {
    void processManualBid(Long sessionId);

    Page<ShillAlertVO> getAlerts(ShillAlertStatusEnum status, String sessionCode, Pageable pageable);

    ShillAlertVO getAlertDetail(Long id);

    ShillAlertVO reviewAlert(Long adminId, Long id, ShillAlertReviewDTO dto);

    void banUser(Long adminId, Long userId, String reason);
}

