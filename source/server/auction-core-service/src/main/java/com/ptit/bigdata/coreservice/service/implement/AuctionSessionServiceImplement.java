package com.ptit.bigdata.coreservice.service.implement;

import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.BidHistory;
import com.ptit.bigdata.coreservice.entity.NumberPlate;
import com.ptit.bigdata.coreservice.entity.Province;
import com.ptit.bigdata.coreservice.entity.UserInfo;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.model.vo.AuctionLotVO;
import com.ptit.bigdata.coreservice.model.vo.AuctionRoomDetailVO;
import com.ptit.bigdata.coreservice.model.vo.AuctionSessionVO;
import com.ptit.bigdata.coreservice.model.vo.BidHistoryItemVO;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.BidHistoryRepository;
import com.ptit.bigdata.coreservice.repository.NumberPlateRepository;
import com.ptit.bigdata.coreservice.repository.ProvinceRepository;
import com.ptit.bigdata.coreservice.repository.UserInfoRepository;
import com.ptit.bigdata.coreservice.service.AuctionSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuctionSessionServiceImplement implements AuctionSessionService {

    private final AuctionSessionRepository auctionSessionRepository;
    private final NumberPlateRepository numberPlateRepository;
    private final ProvinceRepository provinceRepository;
    private final BidHistoryRepository bidHistoryRepository;
    private final UserInfoRepository userInfoRepository;

    @Override
    public Page<AuctionSessionVO> getAuctionSessions(Pageable pageable, String auctionStatus) {
        AuctionStatusEnum statusEnum = AuctionStatusEnum.SOON;
        if (auctionStatus != null && !auctionStatus.isBlank()) {
            try {
                statusEnum = AuctionStatusEnum.valueOf(auctionStatus.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // Keep default SOON
            }
        }
        return auctionSessionRepository.getAuctionSession(pageable, statusEnum);
    }

    @Override
    public AuctionRoomDetailVO getAuctionRoomDetail(String roomId) {
        Optional<AuctionSession> sessionOpt = Optional.empty();
        if (roomId != null && !roomId.isBlank()) {
            // 1. Try finding by sessionCode
            sessionOpt = auctionSessionRepository.findBySessionCode(roomId);
            if (sessionOpt.isEmpty()) {
                // Try finding by plateNumber
                Optional<NumberPlate> plateOpt = numberPlateRepository.findByPlateNumber(roomId);
                if (plateOpt.isPresent()) {
                    sessionOpt = auctionSessionRepository.findFirstByNumberPlateId(plateOpt.get().getId());
                }
            }
        }

        if (sessionOpt.isEmpty()) {
            // Find first available session from real database
            sessionOpt = auctionSessionRepository.findAll().stream().findFirst();
        }

        if (sessionOpt.isEmpty()) {
            return null;
        }

        AuctionSession session = sessionOpt.get();
        NumberPlate plate = null;
        Province province = null;
        if (session.getNumberPlateId() != null) {
            plate = numberPlateRepository.findById(session.getNumberPlateId()).orElse(null);
            if (plate != null && plate.getProvinceId() != null) {
                province = provinceRepository.findById(plate.getProvinceId()).orElse(null);
            }
        }

        String plateNumber = plate != null ? plate.getPlateNumber() : roomId;
        String provinceName = province != null ? province.getName() : "Toàn quốc";
        String plateType = plate != null && plate.getPlateType() != null ? plate.getPlateType().name() : "NGU_QUY";
        String vehicleType = plate != null && plate.getVehicleType() != null ? plate.getVehicleType() : "Ô tô con";

        LocalDateTime now = LocalDateTime.now();
        long remaining = 0;
        if (session.getEndTime() != null && session.getEndTime().isAfter(now)) {
            remaining = Math.max(0, Duration.between(now, session.getEndTime()).getSeconds());
        } else if (session.getStatus() == AuctionStatusEnum.LIVE) {
            remaining = 180;
        }

        long currentPrice = session.getCurrentPrice() != null ? session.getCurrentPrice() : session.getStartPrice();
        long startPrice = session.getStartPrice() != null ? session.getStartPrice() : 40_000_000L;
        long stepPrice = session.getStepPrice() != null ? session.getStepPrice() : 5_000_000L;
        long deposit = session.getDepositAmount() != null ? session.getDepositAmount() : 40_000_000L;

        // Bids history
        List<BidHistoryItemVO> bidItems = new ArrayList<>();
        String leader = null;
        List<BidHistory> bids = bidHistoryRepository.findByAuctionSessionIdOrderByBidTimeDesc(session.getId());
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm:ss");

        if (!bids.isEmpty()) {
            for (BidHistory b : bids) {
                String userName = "Người dùng #" + (b.getUserID() != null ? b.getUserID() : "ẩn danh");
                if (b.getUserID() != null) {
                    userName = userInfoRepository.findById(b.getUserID())
                            .map(UserInfo::getFullName)
                            .orElse(userName);
                }
                String masked = maskUserName(userName);
                if (leader == null) {
                    leader = masked;
                }
                bidItems.add(BidHistoryItemVO.builder()
                        .userName(masked)
                        .bidAmount(b.getBidAmount())
                        .time(b.getBidTime() != null ? b.getBidTime().format(timeFmt) : timeFmt.format(now))
                        .isWinning(b.getIsWinningBid())
                        .build());
            }
        }

        // Lots list in session
        List<AuctionLotVO> lots = new ArrayList<>();
        List<AuctionSession> allSessions = auctionSessionRepository.findAll();
        for (AuctionSession s : allSessions) {
            String lotPlate = "Biển số";
            String lotProv = "Toàn quốc";
            String lotType = "OTHER";
            if (s.getNumberPlateId() != null) {
                NumberPlate np = numberPlateRepository.findById(s.getNumberPlateId()).orElse(null);
                if (np != null) {
                    lotPlate = np.getPlateNumber();
                    if (np.getPlateType() != null) lotType = np.getPlateType().name();
                    if (np.getProvinceId() != null) {
                        Province pr = provinceRepository.findById(np.getProvinceId()).orElse(null);
                        if (pr != null) lotProv = pr.getName();
                    }
                }
            }
            boolean isCur = s.getSessionCode().equalsIgnoreCase(session.getSessionCode());
            String timeLabel = s.getStatus() == AuctionStatusEnum.LIVE ? "Đang đấu" :
                    (s.getStartTime() != null ? s.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm")) : "Sắp đấu");

            lots.add(AuctionLotVO.builder()
                    .roomId(s.getSessionCode())
                    .plateNumber(lotPlate)
                    .provinceName(lotProv)
                    .plateType(lotType)
                    .currentPrice(s.getCurrentPrice() != null ? s.getCurrentPrice() : s.getStartPrice())
                    .status(s.getStatus() != null ? s.getStatus().name() : "SOON")
                    .timeLabel(timeLabel)
                    .isCurrent(isCur)
                    .build());
        }

        return AuctionRoomDetailVO.builder()
                .sessionCode(session.getSessionCode())
                .title(session.getTitle())
                .plateNumber(plateNumber)
                .provinceName(provinceName)
                .plateType(plateType)
                .vehicleType(vehicleType)
                .startPrice(startPrice)
                .currentPrice(currentPrice)
                .endPrice(session.getEndPrice())
                .stepPrice(stepPrice)
                .depositAmount(deposit)
                .startTime(session.getStartTime() != null ? session.getStartTime().toString() : null)
                .endTime(session.getEndTime() != null ? session.getEndTime().toString() : null)
                .remainingSeconds(remaining)
                .status(session.getStatus() != null ? session.getStatus().name() : "LIVE")
                .bidCount(session.getBidCount() != null ? session.getBidCount() : bidItems.size())
                .participantCount(session.getParticipantCount() != null ? session.getParticipantCount() : 0L)
                .leadingUser(leader)
                .reserveMet(true)
                .pinnedNotice("Host Đấu Giá: Người trúng đấu giá có nghĩa vụ nộp đủ tiền trúng đấu giá trong thời hạn 15 ngày kể từ ngày có văn bản phê duyệt kết quả.")
                .lots(lots)
                .initialBids(bidItems)
                .build();
    }

    private String maskUserName(String name) {
        if (name == null || name.isBlank()) return "u***";
        if (name.length() <= 3) return name.charAt(0) + "***";
        return name.charAt(0) + "***" + name.substring(name.length() - 2);
    }
}

