package com.ptit.bigdata.coreservice.controller;

import com.ptit.bigdata.coreservice.core.configuration.ThreadContext;
import com.ptit.bigdata.coreservice.core.util.ResponseUtil;
import com.ptit.bigdata.coreservice.core.util.SuccessResponse;
import com.ptit.bigdata.coreservice.enumration.ShillAlertStatusEnum;
import com.ptit.bigdata.coreservice.model.dto.ShillAlertReviewDTO;
import com.ptit.bigdata.coreservice.model.vo.ShillAlertVO;
import com.ptit.bigdata.coreservice.service.ShillDetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/v1/admin", "/api/admin"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminShillAlertController {

    private final ShillDetectionService shillDetectionService;

    @GetMapping("/shill-alerts")
    public SuccessResponse<Page<ShillAlertVO>> getAlerts(
            @RequestParam(value = "status", required = false) ShillAlertStatusEnum status,
            @RequestParam(value = "sessionCode", required = false) String sessionCode,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseUtil.ok(shillDetectionService.getAlerts(status, sessionCode, pageable));
    }

    @GetMapping("/shill-alerts/{id}")
    public SuccessResponse<ShillAlertVO> getAlertDetail(@PathVariable("id") Long id) {
        return ResponseUtil.ok(shillDetectionService.getAlertDetail(id));
    }

    @PutMapping("/shill-alerts/{id}")
    public SuccessResponse<ShillAlertVO> reviewAlert(
            @PathVariable("id") Long id,
            @RequestBody ShillAlertReviewDTO dto
    ) {
        Long adminId = ThreadContext.getCurrentUserId();
        return ResponseUtil.ok(shillDetectionService.reviewAlert(adminId, id, dto));
    }

    @PostMapping("/users/{userId}/ban")
    public SuccessResponse<String> banUser(
            @PathVariable("userId") Long userId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        Long adminId = ThreadContext.getCurrentUserId();
        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "Vi phạm quy chế đấu giá (thổi giá)";
        shillDetectionService.banUser(adminId, userId, reason);
        return ResponseUtil.ok("Đã khóa tài khoản và hủy toàn bộ quyền truy cập của user " + userId);
    }
}

