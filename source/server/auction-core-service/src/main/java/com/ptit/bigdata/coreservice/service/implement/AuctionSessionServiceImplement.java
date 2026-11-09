package com.ptit.bigdata.coreservice.service.implement;

import com.ptit.bigdata.coreservice.core.configuration.ThreadContext;
import com.ptit.bigdata.coreservice.entity.AuctionRegistration;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.BidHistory;
import com.ptit.bigdata.coreservice.entity.NumberPlate;
import com.ptit.bigdata.coreservice.entity.Province;
import com.ptit.bigdata.coreservice.entity.UserInfo;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.enumration.PlateTypeEnum;
import com.ptit.bigdata.coreservice.enumration.RegistrationStatusEnum;
import com.ptit.bigdata.coreservice.enumration.RoomRoleEnum;
import com.ptit.bigdata.coreservice.model.vo.AuctionLotVO;
import com.ptit.bigdata.coreservice.model.vo.AuctionRoomDetailVO;
import com.ptit.bigdata.coreservice.model.vo.AuctionSessionVO;
import com.ptit.bigdata.coreservice.model.vo.BidHistoryItemVO;
import com.ptit.bigdata.coreservice.repository.AuctionRegistrationRepository;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.BidHistoryRepository;
import com.ptit.bigdata.coreservice.repository.NumberPlateRepository;
import com.ptit.bigdata.coreservice.repository.ProvinceRepository;
import com.ptit.bigdata.coreservice.repository.UserInfoRepository;
import com.ptit.bigdata.coreservice.service.AuctionSessionService;
import com.ptit.bigdata.coreservice.service.RoomRoleResolver;
import com.ptit.bigdata.coreservice.service.StepPriceCalculator;
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
    private final StepPriceCalculator stepPriceCalculator;
    private final RoomRoleResolver roomRoleResolver;
    private final AuctionRegistrationRepository auctionRegistrationRepository;
    private final com.ptit.bigdata.coreservice.service.WatchService watchService;
    private final com.ptit.bigdata.coreservice.service.RoomAnnouncementService roomAnnouncementService;

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
        Page<AuctionSessionVO> page = auctionSessionRepository.getAuctionSession(pageable, statusEnum);
        Long currentUserId = ThreadContext.getCurrentUserId();
        // Bổ sung nextStep, nextMinBid và isWatched
        page.forEach(vo -> {
            long curPrice = vo.getCurrentPrice() != null ? vo.getCurrentPrice() : (vo.getPrice() != null ? vo.getPrice() : 40_000_000L);
            long step = stepPriceCalculator.stepFor(curPrice);
            vo.setNextStep(step);
            vo.setNextMinBid(curPrice + step);
            vo.setStepPrice(step);
            if (currentUserId != null && vo.getSessionCode() != null) {
                auctionSessionRepository.findBySessionCode(vo.getSessionCode()).ifPresent(s -> {
                    vo.setIsWatched(watchService.isWatched(currentUserId, s.getId()));
                });
            } else {
                vo.setIsWatched(false);
            }
        });
        return page;
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

        if (sessionOpt.isEmpty() && roomId != null && !roomId.isBlank()) {
            // Thay vì fallback lấy phòng ngẫu nhiên khác dẫn tới lệch biển số (ví dụ vào 30K-555.55 lại hiện 30K-888.88),
            // khởi tạo hoặc liên kết phiên đấu giá cho chính biển số/phòng mà client yêu cầu:
            Optional<NumberPlate> plateOpt = numberPlateRepository.findByPlateNumber(roomId);
            NumberPlate plate;
            if (plateOpt.isPresent()) {
                plate = plateOpt.get();
            } else {
                Province prov = provinceRepository.findAll().stream()
                        .filter(p -> p.getCode() != null && roomId.length() >= 2 && p.getCode().contains(roomId.substring(0, 2)))
                        .findFirst()
                        .orElse(null);
                plate = NumberPlate.builder()
                        .plateNumber(roomId)
                        .provinceId(prov != null ? prov.getId() : null)
                        .plateType(PlateTypeEnum.NGU_QUY)
                        .vehicleType("Ô tô con")
                        .build();
                plate = numberPlateRepository.save(plate);
            }

            AuctionSession newSession = AuctionSession.builder()
                    .sessionCode(roomId)
                    .title("Đấu giá biển số xe ô tô " + roomId)
                    .numberPlateId(plate.getId())
                    .startPrice(40_000_000L)
                    .currentPrice(40_000_000L)
                    .stepPrice(5_000_000L)
                    .depositAmount(40_000_000L)
                    .startTime(LocalDateTime.now())
                    .endTime(LocalDateTime.now().plusSeconds(1240))
                    .status(AuctionStatusEnum.LIVE)
                    .bidCount(0)
                    .participantCount(1L)
                    .build();
            sessionOpt = Optional.of(auctionSessionRepository.save(newSession));
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
        long nextStep = stepPriceCalculator.stepFor(currentPrice);
        long nextMinBid = currentPrice + nextStep;
        long stepPrice = nextStep;
        long deposit = session.getDepositAmount() != null ? session.getDepositAmount() : 40_000_000L;

        Long currentUserId = ThreadContext.getCurrentUserId();
        RoomRoleEnum myRole = roomRoleResolver.resolve(currentUserId, session.getId());
        boolean isRegistered = false;
        if (currentUserId != null) {
            isRegistered = auctionRegistrationRepository.existsByUserIdAndSessionIdAndStatus(
                    currentUserId, session.getId(), RegistrationStatusEnum.ACTIVE);
        }

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
                long prevPrice = b.getPreviousPrice() != null ? b.getPreviousPrice() : startPrice;
                long inc = Math.max(0L, b.getBidAmount() - prevPrice);
                bidItems.add(BidHistoryItemVO.builder()
                        .userId(b.getUserID())
                        .userName(masked)
                        .bidAmount(b.getBidAmount())
                        .increment(inc)
                        .source(b.getSource() != null ? b.getSource().name() : "MANUAL")
                        .time(b.getBidTime() != null ? b.getBidTime().format(timeFmt) : timeFmt.format(now))
                        .bidTime(b.getBidTime() != null ? b.getBidTime().toString() : now.toString())
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

        String pinnedNotice = "Host Đấu Giá: Người trúng đấu giá có nghĩa vụ nộp đủ tiền trúng đấu giá trong thời hạn 15 ngày kể từ ngày có văn bản phê duyệt kết quả.";
        var pinnedAnnounce = roomAnnouncementService.getPinnedAnnouncement(session.getSessionCode());
        if (pinnedAnnounce != null && pinnedAnnounce.getContent() != null && !pinnedAnnounce.getContent().isBlank()) {
            pinnedNotice = pinnedAnnounce.getContent();
        }
        var announcements = roomAnnouncementService.getRecentAnnouncements(session.getSessionCode());

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
                .nextStep(nextStep)
                .nextMinBid(nextMinBid)
                .depositAmount(deposit)
                .myRole(myRole.name())
                .isRegistered(isRegistered)
                .startTime(session.getStartTime() != null ? session.getStartTime().toString() : null)
                .endTime(session.getEndTime() != null ? session.getEndTime().toString() : null)
                .remainingSeconds(remaining)
                .status(session.getStatus() != null ? session.getStatus().name() : "LIVE")
                .bidCount(session.getBidCount() != null ? session.getBidCount() : bidItems.size())
                .participantCount(session.getParticipantCount() != null ? session.getParticipantCount() : 0L)
                .leadingUser(leader)
                .reserveMet(true)
                .pinnedNotice(pinnedNotice)
                .announcements(announcements)
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

