package com.ptit.bigdata.coreservice.controller;

import com.ptit.bigdata.coreservice.core.util.ResponseUtil;
import com.ptit.bigdata.coreservice.core.util.SuccessResponse;
import com.ptit.bigdata.coreservice.model.vo.AuctionSessionVO;
import com.ptit.bigdata.coreservice.service.AuctionSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/auction", "/v1/auction"})
@RequiredArgsConstructor
public class AuctionSessionController {
    private final AuctionSessionService auctionSessionService;

    @GetMapping("/get")
    public SuccessResponse<Page<AuctionSessionVO>> get(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "status", defaultValue = "SOON") String auctionStatus
    ){
        Pageable pageable= PageRequest.of(page, size);
        return ResponseUtil.ok(auctionSessionService.getAuctionSessions(pageable, auctionStatus));
    }
}
