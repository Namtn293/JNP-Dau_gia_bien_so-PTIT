package com.ptit.bigdata.coreservice.service.implement;

import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.AuctionWatch;
import com.ptit.bigdata.coreservice.entity.NumberPlate;
import com.ptit.bigdata.coreservice.entity.Province;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import com.ptit.bigdata.coreservice.model.vo.WatchVO;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.AuctionWatchRepository;
import com.ptit.bigdata.coreservice.repository.NumberPlateRepository;
import com.ptit.bigdata.coreservice.repository.ProvinceRepository;
import com.ptit.bigdata.coreservice.service.WatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class WatchServiceImpl implements WatchService {

    private final AuctionWatchRepository auctionWatchRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final NumberPlateRepository numberPlateRepository;
    private final ProvinceRepository provinceRepository;

    @Override
    @Transactional
    public void watch(Long userId, String sessionCode) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        AuctionSession session = auctionSessionRepository.findBySessionCode(sessionCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        if (!auctionWatchRepository.existsByUserIdAndSessionId(userId, session.getId())) {
            AuctionWatch watch = AuctionWatch.builder()
                    .userId(userId)
                    .sessionId(session.getId())
                    .createdAt(LocalDateTime.now())
                    .build();
            auctionWatchRepository.save(watch);
            log.info("[WATCH] User {} theo dõi phiên {}", userId, sessionCode);
        }
    }

    @Override
    @Transactional
    public void unwatch(Long userId, String sessionCode) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }
        AuctionSession session = auctionSessionRepository.findBySessionCode(sessionCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        auctionWatchRepository.deleteByUserIdAndSessionId(userId, session.getId());
        log.info("[UNWATCH] User {} bỏ theo dõi phiên {}", userId, sessionCode);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WatchVO> getWatchedSessions(Long userId, Pageable pageable) {
        if (userId == null) {
            return Page.empty(pageable);
        }
        Page<AuctionWatch> watches = auctionWatchRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        List<WatchVO> items = new ArrayList<>();

        for (AuctionWatch w : watches) {
            Optional<AuctionSession> sessionOpt = auctionSessionRepository.findById(w.getSessionId());
            if (sessionOpt.isPresent()) {
                AuctionSession s = sessionOpt.get();
                String plateNumber = "";
                String provName = "Toàn quốc";
                if (s.getNumberPlateId() != null) {
                    NumberPlate np = numberPlateRepository.findById(s.getNumberPlateId()).orElse(null);
                    if (np != null) {
                        plateNumber = np.getPlateNumber();
                        if (np.getProvinceId() != null) {
                            Province p = provinceRepository.findById(np.getProvinceId()).orElse(null);
                            if (p != null) provName = p.getName();
                        }
                    }
                }

                items.add(WatchVO.builder()
                        .sessionCode(s.getSessionCode())
                        .plateNumber(plateNumber)
                        .provinceName(provName)
                        .startPrice(s.getStartPrice())
                        .currentPrice(s.getCurrentPrice() != null ? s.getCurrentPrice() : s.getStartPrice())
                        .status(s.getStatus() != null ? s.getStatus().name() : "SOON")
                        .startTime(s.getStartTime())
                        .endTime(s.getEndTime())
                        .watchedAt(w.getCreatedAt())
                        .build());
            }
        }

        return new PageImpl<>(items, pageable, watches.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isWatched(Long userId, Long sessionId) {
        if (userId == null || sessionId == null) return false;
        return auctionWatchRepository.existsByUserIdAndSessionId(userId, sessionId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isWatched(Long userId, String sessionCode) {
        if (userId == null || sessionCode == null) return false;
        return auctionSessionRepository.findBySessionCode(sessionCode)
                .map(session -> auctionWatchRepository.existsByUserIdAndSessionId(userId, session.getId()))
                .orElse(false);
    }
}

