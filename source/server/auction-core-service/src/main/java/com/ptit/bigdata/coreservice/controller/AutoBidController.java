package com.ptit.bigdata.coreservice.controller;

import com.ptit.bigdata.coreservice.core.configuration.ThreadContext;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.core.util.ResponseUtil;
import com.ptit.bigdata.coreservice.core.util.SuccessResponse;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import com.ptit.bigdata.coreservice.model.dto.AutoBidDTO;
import com.ptit.bigdata.coreservice.model.vo.AutoBidConfigVO;
import com.ptit.bigdata.coreservice.service.AutoBidService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/auction/{code}/auto-bid", "/v1/auction/{code}/auto-bid"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AutoBidController {

    private final AutoBidService autoBidService;

    @PutMapping
    public SuccessResponse<AutoBidConfigVO> configureAutoBid(
            @PathVariable("code") String code,
            @RequestBody AutoBidDTO dto
    ) {
        Long userId = ThreadContext.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        return ResponseUtil.ok(autoBidService.configure(userId, code, dto != null ? dto.getMaxAmount() : null));
    }

    @DeleteMapping
    public SuccessResponse<String> disableAutoBid(@PathVariable("code") String code) {
        Long userId = ThreadContext.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        autoBidService.disable(userId, code);
        return ResponseUtil.ok("Đã tắt tự động đấu giá cho phiên " + code);
    }

    @GetMapping
    public SuccessResponse<AutoBidConfigVO> getAutoBidConfig(@PathVariable("code") String code) {
        Long userId = ThreadContext.getCurrentUserId();
        return ResponseUtil.ok(autoBidService.getConfig(userId, code));
    }
}

