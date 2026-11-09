package com.ptit.bigdata.coreservice.service.implement;

import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.entity.*;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.enumration.BidSourceEnum;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import com.ptit.bigdata.coreservice.model.vo.BidHistoryItemVO;
import com.ptit.bigdata.coreservice.model.vo.MyAuctionHistoryVO;
import com.ptit.bigdata.coreservice.repository.*;
import com.ptit.bigdata.coreservice.service.AuctionHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuctionHistoryServiceImpl implements AuctionHistoryService {

    private final BidHistoryRepository bidHistoryRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final NumberPlateRepository numberPlateRepository;
    private final ProvinceRepository provinceRepository;
    private final AuctionRegistrationRepository auctionRegistrationRepository;
    private final UserInfoRepository userInfoRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<MyAuctionHistoryVO> getMyAuctionHistory(Long userId, String resultFilter, Pageable pageable) {
        if (userId == null) {
            return Page.empty(pageable);
        }

        String normalizedFilter = (resultFilter != null && !resultFilter.isBlank())
                ? resultFilter.trim().toUpperCase()
                : null;

        Page<Long> sessionPage = bidHistoryRepository.findMyAuctionSessionIds(userId, normalizedFilter, pageable);
        if (sessionPage.isEmpty()) {
            return Page.empty(pageable);
        }

        List<MyAuctionHistoryVO> list = new ArrayList<>();

        for (Long sessionId : sessionPage.getContent()) {
            Optional<AuctionSession> sessionOpt = auctionSessionRepository.findById(sessionId);
            if (sessionOpt.isEmpty()) continue;
            AuctionSession session = sessionOpt.get();

            String plateNumber = "";
            String provName = "Toàn quốc";
            if (session.getNumberPlateId() != null) {
                NumberPlate np = numberPlateRepository.findById(session.getNumberPlateId()).orElse(null);
                if (np != null) {
                    plateNumber = np.getPlateNumber();
                    if (np.getProvinceId() != null) {
                        Province p = provinceRepository.findById(np.getProvinceId()).orElse(null);
                        if (p != null) provName = p.getName();
                    }
                }
            }

            List<BidHistory> myBids = bidHistoryRepository.findByAuctionSessionIdAndUserIDOrderByBidTimeDesc(sessionId, userId);
            int myBidCount = myBids.size();
            int myAutoBidCount = (int) myBids.stream().filter(b -> b.getSource() == BidSourceEnum.AUTO).count();
            long myHighestBid = myBids.stream().mapToLong(BidHistory::getBidAmount).max().orElse(0L);
            var myLastBidAt = myBids.isEmpty() ? null : myBids.get(0).getBidTime();
            boolean hasWinningBid = myBids.stream().anyMatch(b -> Boolean.TRUE.equals(b.getIsWinningBid()));

            // Xác định result: LEADING/WON khi lượt is_winning_bid là của tôi
            String result;
            boolean isLeader = hasWinningBid || (session.getUserInfoId() != null && session.getUserInfoId().equals(userId));
            if (session.getStatus() == AuctionStatusEnum.LIVE || session.getStatus() == AuctionStatusEnum.PAUSED) {
                result = isLeader ? "LEADING" : "OUTBID";
            } else if (session.getStatus() == AuctionStatusEnum.END) {
                result = isLeader ? "WON" : "LOST";
            } else {
                result = "OUTBID";
            }

            Optional<AuctionRegistration> regOpt = auctionRegistrationRepository.findByUserIdAndSessionId(userId, sessionId);

            list.add(MyAuctionHistoryVO.builder()
                    .sessionCode(session.getSessionCode())
                    .plateNumber(plateNumber)
                    .provinceName(provName)
                    .status(session.getStatus())
                    .startTime(session.getStartTime())
                    .endTime(session.getEndTime())
                    .myBidCount(myBidCount)
                    .myAutoBidCount(myAutoBidCount)
                    .myHighestBid(myHighestBid)
                    .myLastBidAt(myLastBidAt)
                    .finalPrice(session.getCurrentPrice() != null ? session.getCurrentPrice() : session.getStartPrice())
                    .depositStatus(regOpt.map(AuctionRegistration::getStatus).orElse(null))
                    .result(result)
                    .build());
        }

        return new PageImpl<>(list, pageable, sessionPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BidHistoryItemVO> getMyBidsInSession(Long userId, String sessionCode) {
        if (userId == null) {
            return Collections.emptyList();
        }

        AuctionSession session = auctionSessionRepository.findBySessionCode(sessionCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        List<BidHistory> bids = bidHistoryRepository.findByAuctionSessionIdAndUserIDOrderByBidTimeDesc(session.getId(), userId);
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm:ss");

        List<BidHistoryItemVO> items = new ArrayList<>();
        for (BidHistory b : bids) {
            long prevPrice = b.getPreviousPrice() != null ? b.getPreviousPrice() : 0L;
            long inc = prevPrice > 0 ? (b.getBidAmount() - prevPrice) : 0L;

            items.add(BidHistoryItemVO.builder()
                    .userId(b.getUserID())
                    .userName("Bạn")
                    .bidAmount(b.getBidAmount())
                    .increment(inc)
                    .source(b.getSource() != null ? b.getSource().name() : "MANUAL")
                    .time(b.getBidTime() != null ? b.getBidTime().format(timeFmt) : "")
                    .bidTime(b.getBidTime() != null ? b.getBidTime().toString() : "")
                    .isWinning(b.getIsWinningBid())
                    .build());
        }
        return items;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BidHistoryItemVO> getSessionBids(String sessionCode, Pageable pageable) {
        AuctionSession session = auctionSessionRepository.findBySessionCode(sessionCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        Page<BidHistory> page = bidHistoryRepository.findByAuctionSessionIdOrderByBidTimeDesc(session.getId(), pageable);
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm:ss");

        return page.map(b -> {
            String name = "Người dùng #" + (b.getUserID() != null ? b.getUserID() : "ẩn danh");
            if (b.getUserID() != null) {
                name = userInfoRepository.findById(b.getUserID())
                        .map(UserInfo::getFullName)
                        .orElse(name);
            }
            long prevPrice = b.getPreviousPrice() != null ? b.getPreviousPrice() : 0L;
            long inc = prevPrice > 0 ? (b.getBidAmount() - prevPrice) : 0L;

            return BidHistoryItemVO.builder()
                    .userId(b.getUserID())
                    .userName(maskUserName(name))
                    .bidAmount(b.getBidAmount())
                    .increment(inc)
                    .source(b.getSource() != null ? b.getSource().name() : "MANUAL")
                    .time(b.getBidTime() != null ? b.getBidTime().format(timeFmt) : "")
                    .bidTime(b.getBidTime() != null ? b.getBidTime().toString() : "")
                    .isWinning(b.getIsWinningBid())
                    .build();
        });
    }

    private String maskUserName(String name) {
        if (name == null || name.isBlank()) return "u***";
        if (name.length() <= 3) return name.charAt(0) + "***";
        return name.charAt(0) + "***" + name.substring(name.length() - 2);
    }
}

