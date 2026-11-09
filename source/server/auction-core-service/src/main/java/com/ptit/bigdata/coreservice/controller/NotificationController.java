package com.ptit.bigdata.coreservice.controller;

import com.ptit.bigdata.coreservice.core.configuration.ThreadContext;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.core.util.ResponseUtil;
import com.ptit.bigdata.coreservice.core.util.SuccessResponse;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import com.ptit.bigdata.coreservice.model.vo.NotificationVO;
import com.ptit.bigdata.coreservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public SuccessResponse<Page<NotificationVO>> getNotifications(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "unreadOnly", defaultValue = "false") boolean unreadOnly
    ) {
        Long userId = ThreadContext.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        Pageable pageable = PageRequest.of(page, size);
        return ResponseUtil.ok(notificationService.getNotifications(userId, unreadOnly, pageable));
    }

    @GetMapping("/unread-count")
    public SuccessResponse<Long> getUnreadCount() {
        Long userId = ThreadContext.getCurrentUserId();
        if (userId == null) {
            return ResponseUtil.ok(0L);
        }
        return ResponseUtil.ok(notificationService.getUnreadCount(userId));
    }

    @PutMapping("/{id}/read")
    public SuccessResponse<String> markAsRead(@PathVariable("id") Long id) {
        Long userId = ThreadContext.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        notificationService.markAsRead(userId, id);
        return ResponseUtil.ok("Đã đánh dấu đã đọc");
    }

    @PutMapping("/read-all")
    public SuccessResponse<String> markAllAsRead() {
        Long userId = ThreadContext.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        notificationService.markAllAsRead(userId);
        return ResponseUtil.ok("Đã đánh dấu tất cả là đã đọc");
    }
}

