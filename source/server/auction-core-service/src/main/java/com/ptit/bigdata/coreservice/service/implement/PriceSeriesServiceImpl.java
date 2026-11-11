package com.ptit.bigdata.coreservice.service.implement;

import com.ptit.bigdata.coreservice.configuration.AuctionProperties;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.BidHistory;
import com.ptit.bigdata.coreservice.entity.UserInfo;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import com.ptit.bigdata.coreservice.model.vo.PricePointVO;
import com.ptit.bigdata.coreservice.model.vo.PriceSeriesVO;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.BidHistoryRepository;
import com.ptit.bigdata.coreservice.repository.UserInfoRepository;
import com.ptit.bigdata.coreservice.service.PriceSeriesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PriceSeriesServiceImpl implements PriceSeriesService {

    private final AuctionSessionRepository auctionSessionRepository;
    private final BidHistoryRepository bidHistoryRepository;
    private final UserInfoRepository userInfoRepository;
    private final com.ptit.bigdata.coreservice.core.auth.repository.UserRepository userRepository;
    private final AuctionProperties auctionProperties;

    @Override
    @Transactional(readOnly = true)
    public PriceSeriesVO getPriceSeries(String sessionCode) {
        AuctionSession session = auctionSessionRepository.findBySessionCode(sessionCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        long startPrice = session.getStartPrice() != null ? session.getStartPrice() : 40_000_000L;

        List<PricePointVO> points = new ArrayList<>();
        // 1. Điểm đầu tiên luôn là startPrice tại startTime
        points.add(PricePointVO.builder()
                .time(session.getStartTime())
                .price(startPrice)
                .bidder(null)
                .source(null)
                .step(null)
                .build());

        // 2. Các điểm tiếp theo lấy từ BidHistory theo thứ tự thời gian tăng dần
        List<BidHistory> bids = bidHistoryRepository.findByAuctionSessionIdOrderByBidTimeAsc(session.getId());
        java.util.Set<Long> userIds = bids.stream()
                .map(BidHistory::getUserID)
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet());
        java.util.Map<Long, String> nameMap = batchResolveDisplayNames(userIds);
        for (BidHistory b : bids) {
            String name = b.getUserID() != null
                    ? nameMap.getOrDefault(b.getUserID(), "Người dùng #" + b.getUserID())
                    : "ẩn danh";

            points.add(PricePointVO.builder()
                    .time(b.getBidTime())
                    .price(b.getBidAmount())
                    .bidder(maskUserName(name))
                    .source(b.getSource() != null ? b.getSource().name() : "MANUAL")
                    .step(b.getStepApplied())
                    .build());
        }

        // 3. Giới hạn max-points
        int maxPoints = (auctionProperties.getChart() != null) ? auctionProperties.getChart().getMaxPoints() : 1000;
        if (points.size() > maxPoints) {
            List<PricePointVO> trimmed = new ArrayList<>();
            trimmed.add(points.get(0)); // Giữ điểm bắt đầu
            int fromIdx = points.size() - (maxPoints - 1);
            trimmed.addAll(points.subList(fromIdx, points.size()));
            points = trimmed;
        }

        return PriceSeriesVO.builder()
                .sessionCode(session.getSessionCode())
                .startPrice(startPrice)
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .points(points)
                .stepTiers(auctionProperties.getStepTiers())
                .build();
    }

    private java.util.Map<Long, String> batchResolveDisplayNames(java.util.Set<Long> userIds) {
        java.util.Map<Long, String> result = new java.util.HashMap<>();
        if (userIds == null || userIds.isEmpty()) return result;

        java.util.Map<String, String> infoByUsername = new java.util.HashMap<>();
        java.util.Map<Long, String> infoById = new java.util.HashMap<>();
        userInfoRepository.findAll().forEach(ui -> {
            String best = (ui.getFullName() != null && !ui.getFullName().isBlank()) ? ui.getFullName() : ui.getUserName();
            if (ui.getUserName() != null) infoByUsername.put(ui.getUserName(), best);
            if (ui.getId() != null) infoById.put(ui.getId(), best);
        });

        userRepository.findAllById(userIds).forEach(u -> {
            result.put(u.getId(), infoByUsername.getOrDefault(u.getUsername(), u.getUsername()));
        });
        for (Long id : userIds) {
            result.putIfAbsent(id, infoById.getOrDefault(id, "Người dùng #" + id));
        }
        return result;
    }

    private String maskUserName(String name) {
        if (name == null || name.isBlank()) return "u***";
        if (name.length() <= 3) return name.charAt(0) + "***";
        return name.charAt(0) + "***" + name.substring(name.length() - 2);
    }
}

