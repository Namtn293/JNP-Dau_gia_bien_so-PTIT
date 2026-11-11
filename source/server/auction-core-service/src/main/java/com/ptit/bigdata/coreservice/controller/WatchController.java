package com.ptit.bigdata.coreservice.controller;

import com.ptit.bigdata.coreservice.core.configuration.ThreadContext;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.core.util.ResponseUtil;
import com.ptit.bigdata.coreservice.core.util.SuccessResponse;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import com.ptit.bigdata.coreservice.model.vo.WatchVO;
import com.ptit.bigdata.coreservice.service.WatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/watch")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WatchController {

    private final WatchService watchService;

    @PostMapping("/{sessionCode}")
    public SuccessResponse<String> watch(@PathVariable("sessionCode") String sessionCode) {
        Long userId = ThreadContext.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        watchService.watch(userId, sessionCode);
        return ResponseUtil.ok("Đã theo dõi phiên đấu giá " + sessionCode, sessionCode);
    }

    @DeleteMapping("/{sessionCode}")
    public SuccessResponse<String> unwatch(@PathVariable("sessionCode") String sessionCode) {
        Long userId = ThreadContext.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        watchService.unwatch(userId, sessionCode);
        return ResponseUtil.ok("Đã bỏ theo dõi phiên đấu giá " + sessionCode, sessionCode);
    }

    @GetMapping("/{sessionCode}/status")
    public SuccessResponse<Boolean> checkWatchStatus(@PathVariable("sessionCode") String sessionCode) {
        Long userId = ThreadContext.getCurrentUserId();
        if (userId == null) {
            return ResponseUtil.ok(false);
        }
        return ResponseUtil.ok(watchService.isWatched(userId, sessionCode));
    }

    @GetMapping
    public SuccessResponse<Page<WatchVO>> getWatched(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        Long userId = ThreadContext.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        Pageable pageable = PageRequest.of(page, size);
        return ResponseUtil.ok(watchService.getWatchedSessions(userId, pageable));
    }
}

