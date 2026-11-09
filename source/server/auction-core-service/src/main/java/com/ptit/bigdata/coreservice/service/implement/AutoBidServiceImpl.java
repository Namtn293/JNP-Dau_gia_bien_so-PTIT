package com.ptit.bigdata.coreservice.service.implement;

import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.AutoBidConfig;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.enumration.AutoBidStopReasonEnum;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import com.ptit.bigdata.coreservice.enumration.RoomRoleEnum;
import com.ptit.bigdata.coreservice.model.vo.AutoBidConfigVO;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.AutoBidConfigRepository;
import com.ptit.bigdata.coreservice.service.AutoBidScheduler;
import com.ptit.bigdata.coreservice.service.AutoBidService;
import com.ptit.bigdata.coreservice.service.RoomRoleResolver;
import com.ptit.bigdata.coreservice.service.StepPriceCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AutoBidServiceImpl implements AutoBidService {

    private final AutoBidConfigRepository autoBidConfigRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final RoomRoleResolver roomRoleResolver;
    private final StepPriceCalculator stepPriceCalculator;
    private final AutoBidScheduler autoBidScheduler;

    @Override
    @Transactional
    public AutoBidConfigVO configure(Long userId, String sessionCode, Long maxAmount) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }

        AuctionSession session = auctionSessionRepository.findBySessionCode(sessionCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        if (session.getStatus() != AuctionStatusEnum.LIVE && session.getStatus() != AuctionStatusEnum.SOON) {
            throw new BusinessException(ErrorCode.AUCTION_NOT_LIVE);
        }

        // Chỉ BIDDER mới được bật auto-bid
        RoomRoleEnum role = roomRoleResolver.resolve(userId, session.getId());
        if (role != RoomRoleEnum.BIDDER) {
            throw new BusinessException(ErrorCode.AUTOBID_NOT_ALLOWED);
        }

        long currentPrice = session.getCurrentPrice() != null ? session.getCurrentPrice() : session.getStartPrice();
        long step = stepPriceCalculator.stepFor(currentPrice);
        long nextMinBid = currentPrice + step;

        if (maxAmount == null || maxAmount < nextMinBid) {
            throw new BusinessException(ErrorCode.AUTOBID_MAX_TOO_LOW);
        }

        AutoBidConfig config = autoBidConfigRepository.findByUserIdAndSessionId(userId, session.getId())
                .orElse(AutoBidConfig.builder()
                        .userId(userId)
                        .sessionId(session.getId())
                        .autoBidCount(0)
                        .build());

        config.setMaxAmount(maxAmount);
        config.setActive(true);
        config.setStoppedReason(null);
        config.setUpdatedAt(LocalDateTime.now());
        config = autoBidConfigRepository.save(config);

        log.info("[AUTOBID-CONFIG] User {} kích hoạt auto-bid cho phiên {} với giá trần: {}",
                userId, sessionCode, maxAmount);

        // Nếu phiên đang LIVE, lên lịch xử lý auto-bid ngay
        if (session.getStatus() == AuctionStatusEnum.LIVE) {
            autoBidScheduler.scheduleNextAutoBid(session.getId());
        }

        return mapToVO(config, sessionCode, nextMinBid, currentPrice);
    }

    @Override
    @Transactional
    public void disable(Long userId, String sessionCode) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }

        AuctionSession session = auctionSessionRepository.findBySessionCode(sessionCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        autoBidConfigRepository.findByUserIdAndSessionId(userId, session.getId()).ifPresent(config -> {
            config.setActive(false);
            config.setStoppedReason(AutoBidStopReasonEnum.USER_DISABLED);
            config.setUpdatedAt(LocalDateTime.now());
            autoBidConfigRepository.save(config);
            log.info("[AUTOBID-DISABLED] User {} đã tắt auto-bid cho phiên {}", userId, sessionCode);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public AutoBidConfigVO getConfig(Long userId, String sessionCode) {
        if (userId == null) {
            return null;
        }

        AuctionSession session = auctionSessionRepository.findBySessionCode(sessionCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        long currentPrice = session.getCurrentPrice() != null ? session.getCurrentPrice() : session.getStartPrice();
        long step = stepPriceCalculator.stepFor(currentPrice);
        long nextMinBid = currentPrice + step;

        return autoBidConfigRepository.findByUserIdAndSessionId(userId, session.getId())
                .map(c -> mapToVO(c, sessionCode, nextMinBid, currentPrice))
                .orElse(null);
    }

    private AutoBidConfigVO mapToVO(AutoBidConfig c, String sessionCode, Long nextMinBid, Long currentPrice) {
        return AutoBidConfigVO.builder()
                .sessionCode(sessionCode)
                .maxAmount(c.getMaxAmount())
                .active(c.getActive())
                .stoppedReason(c.getStoppedReason())
                .autoBidCount(c.getAutoBidCount())
                .nextMinBid(nextMinBid)
                .currentPrice(currentPrice)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}

