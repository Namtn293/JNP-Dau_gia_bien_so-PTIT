package com.ptit.bigdata.coreservice.controller;

import com.ptit.bigdata.coreservice.core.configuration.ThreadContext;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.core.util.ResponseUtil;
import com.ptit.bigdata.coreservice.core.util.SuccessResponse;
import com.ptit.bigdata.coreservice.enumration.BidSourceEnum;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import com.ptit.bigdata.coreservice.model.dto.PlaceBidDTO;
import com.ptit.bigdata.coreservice.model.vo.AuctionRoomDetailVO;
import com.ptit.bigdata.coreservice.model.vo.AuctionSessionVO;
import com.ptit.bigdata.coreservice.model.vo.BidHistoryItemVO;
import com.ptit.bigdata.coreservice.model.vo.BidResultVO;
import com.ptit.bigdata.coreservice.model.vo.PriceSeriesVO;
import com.ptit.bigdata.coreservice.model.vo.RegistrationDetailVO;
import com.ptit.bigdata.coreservice.model.vo.RoomAnnouncementVO;
import com.ptit.bigdata.coreservice.service.AuctionHistoryService;
import com.ptit.bigdata.coreservice.service.AuctionSessionService;
import com.ptit.bigdata.coreservice.service.BidService;
import com.ptit.bigdata.coreservice.service.PriceSeriesService;
import com.ptit.bigdata.coreservice.service.RoomAnnouncementService;
import com.ptit.bigdata.coreservice.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/auction", "/v1/auction"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuctionSessionController {
    private final AuctionSessionService auctionSessionService;
    private final WalletService walletService;
    private final PriceSeriesService priceSeriesService;
    private final AuctionHistoryService auctionHistoryService;
    private final RoomAnnouncementService roomAnnouncementService;
    private final BidService bidService;

    @GetMapping("/get")
    public SuccessResponse<Page<AuctionSessionVO>> get(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "status", defaultValue = "SOON") String auctionStatus
    ){
        Pageable pageable= PageRequest.of(page, size);
        return ResponseUtil.ok(auctionSessionService.getAuctionSessions(pageable, auctionStatus));
    }

    @GetMapping({"/room/{roomId}", "/detail/{roomId}"})
    public SuccessResponse<AuctionRoomDetailVO> getRoomDetail(@PathVariable("roomId") String roomId) {
        return ResponseUtil.ok(auctionSessionService.getAuctionRoomDetail(roomId));
    }

    @PostMapping("/{code}/register")
    public SuccessResponse<RegistrationDetailVO> registerAuction(@PathVariable("code") String code) {
        Long userId = ThreadContext.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        return ResponseUtil.ok(walletService.registerAuction(userId, code));
    }

    @DeleteMapping("/{code}/register")
    public SuccessResponse<RegistrationDetailVO> cancelRegistration(@PathVariable("code") String code) {
        Long userId = ThreadContext.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        return ResponseUtil.ok(walletService.cancelRegistration(userId, code));
    }

    @GetMapping("/{code}/registration")
    public SuccessResponse<RegistrationDetailVO> getRegistration(@PathVariable("code") String code) {
        Long userId = ThreadContext.getCurrentUserId();
        return ResponseUtil.ok(walletService.getRegistration(userId, code));
    }

    @GetMapping("/{code}/price-series")
    public SuccessResponse<PriceSeriesVO> getPriceSeries(@PathVariable("code") String code) {
        return ResponseUtil.ok(priceSeriesService.getPriceSeries(code));
    }

    @GetMapping("/{code}/bids")
    public SuccessResponse<Page<BidHistoryItemVO>> getSessionBids(
            @PathVariable("code") String code,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseUtil.ok(auctionHistoryService.getSessionBids(code, pageable));
    }

    @GetMapping("/{code}/announcements")
    public SuccessResponse<Page<RoomAnnouncementVO>> getAnnouncements(
            @PathVariable("code") String code,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseUtil.ok(roomAnnouncementService.getAnnouncements(code, pageable));
    }

    @PostMapping("/{code}/bid")
    public SuccessResponse<BidResultVO> placeBid(
            @PathVariable("code") String code,
            @RequestBody(required = false) PlaceBidDTO dto,
            HttpServletRequest request
    ) {
        Long userId = ThreadContext.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        String ip = request != null ? request.getRemoteAddr() : "127.0.0.1";
        Long amount = (dto != null) ? dto.getBidAmount() : null;
        return ResponseUtil.ok(bidService.placeBid(code, userId, amount, BidSourceEnum.MANUAL, ip));
    }
}

