package com.ptit.bigdata.coreservice.controller;

import com.ptit.bigdata.coreservice.core.configuration.ThreadContext;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.core.util.ResponseUtil;
import com.ptit.bigdata.coreservice.core.util.SuccessResponse;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import com.ptit.bigdata.coreservice.model.vo.BidHistoryItemVO;
import com.ptit.bigdata.coreservice.model.vo.MyAuctionHistoryVO;
import com.ptit.bigdata.coreservice.service.AuctionHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/me/bids")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MyBidHistoryController {

    private final AuctionHistoryService auctionHistoryService;

    @GetMapping
    public SuccessResponse<Page<MyAuctionHistoryVO>> getMyBids(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "result", required = false) String result
    ) {
        Long userId = ThreadContext.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        Pageable pageable = PageRequest.of(page, size);
        return ResponseUtil.ok(auctionHistoryService.getMyAuctionHistory(userId, result, pageable));
    }

    @GetMapping("/{sessionCode}")
    public SuccessResponse<List<BidHistoryItemVO>> getMyBidsInSession(@PathVariable("sessionCode") String sessionCode) {
        Long userId = ThreadContext.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        return ResponseUtil.ok(auctionHistoryService.getMyBidsInSession(userId, sessionCode));
    }
}

