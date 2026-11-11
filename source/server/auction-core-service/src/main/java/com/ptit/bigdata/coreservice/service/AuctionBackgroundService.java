package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.configuration.AuctionProperties;
import com.ptit.bigdata.coreservice.entity.AuctionRegistration;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.AuctionWatch;
import com.ptit.bigdata.coreservice.entity.BidHistory;
import com.ptit.bigdata.coreservice.entity.NotificationLog;
import com.ptit.bigdata.coreservice.entity.NumberPlate;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.enumration.NotificationTypeEnum;
import com.ptit.bigdata.coreservice.enumration.RegistrationStatusEnum;
import com.ptit.bigdata.coreservice.model.vo.BidMessageVO;
import com.ptit.bigdata.coreservice.model.vo.RoomEventVO;
import com.ptit.bigdata.coreservice.repository.AuctionRegistrationRepository;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.AuctionWatchRepository;
import com.ptit.bigdata.coreservice.repository.BidHistoryRepository;
import com.ptit.bigdata.coreservice.repository.NotificationLogRepository;
import com.ptit.bigdata.coreservice.repository.NumberPlateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AuctionBackgroundService - Dịch vụ chạy ngầm định kỳ (Background Service / Scheduler)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuctionBackgroundService {

    private final AuctionSessionRepository auctionSessionRepository;
    private final BidHistoryRepository bidHistoryRepository;
    private final NumberPlateRepository numberPlateRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final WalletService walletService;
    private final NotificationService notificationService;
    private final NotificationLogRepository notificationLogRepository;
    private final AuctionWatchRepository auctionWatchRepository;
    private final AuctionRegistrationRepository auctionRegistrationRepository;
    private final AuctionProperties auctionProperties;
    private final AutoBidScheduler autoBidScheduler;

    /**
     * Chạy định kỳ mỗi 2 giây một lần để quét và xử lý trạng thái các phiên đấu giá
     * (Đặt initialDelay = 5000 để các tác vụ khởi tạo ApplicationReadyEvent hoàn tất trước khi quét)
     */
    @Scheduled(initialDelay = 5000, fixedDelay = 2000)
    @Transactional
    public void checkAndProcessAuctionStatus() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Tự động chốt các phiên LIVE đã quá endTime sang END
        List<AuctionSession> expiredSessions = auctionSessionRepository
                .findByStatusAndEndTimeBefore(AuctionStatusEnum.LIVE, now);

        for (AuctionSession session : expiredSessions) {
            handleEndSession(session, now);
        }

        // 1b. Tự động chốt các phiên SOON đã quá endTime sang END
        List<AuctionSession> expiredSoonSessions = auctionSessionRepository
                .findByStatusAndEndTimeBefore(AuctionStatusEnum.SOON, now);

        for (AuctionSession session : expiredSoonSessions) {
            handleEndSession(session, now);
        }

        // 2. Tự động chuyển các phiên SOON đã đến startTime sang LIVE
        List<AuctionSession> startingSessions = auctionSessionRepository
                .findByStatusAndStartTimeBeforeAndEndTimeAfter(AuctionStatusEnum.SOON, now, now);

        for (AuctionSession session : startingSessions) {
            handleStartSession(session, now);
        }

        // 3. Quét thông báo phiên sắp bắt đầu (STARTING_SOON)
        checkStartingSoonSessions(now);

        // 4. Quét thông báo phiên sắp kết thúc (ENDING_SOON)
        checkEndingSoonSessions(now);
    }

    /**
     * Xử lý kết thúc phiên đấu giá:
     * - Cập nhật status = END
     * - Chốt endPrice & winningPrice
     * - Ghi nhận người trúng đấu giá vào session (userInfoId)
     * - Broadcast sự kiện END tới Dashboard và Auction Room
     */
    private void handleEndSession(AuctionSession session, LocalDateTime now) {
        log.info("[BACKGROUND-SERVICE] Phiên {} ({}) đã hết giờ. Bắt đầu tự động chốt kết quả...",
                session.getSessionCode(), session.getTitle());

        session.setStatus(AuctionStatusEnum.END);

        long finalPrice = session.getCurrentPrice() != null ? session.getCurrentPrice() : session.getStartPrice();
        session.setEndPrice(finalPrice);
        session.setWinningPrice(finalPrice);

        // Tìm lượt trả giá cao nhất / mới nhất để xác định người trúng
        List<BidHistory> bids = bidHistoryRepository.findByAuctionSessionIdOrderByBidTimeDesc(session.getId());
        if (!bids.isEmpty()) {
            BidHistory winningBid = bids.get(0);
            winningBid.setIsWinningBid(true);
            bidHistoryRepository.save(winningBid);

            if (winningBid.getUserID() != null) {
                session.setUserInfoId(winningBid.getUserID());
                log.info("[BACKGROUND-SERVICE] Người trúng đấu giá phiên {}: User ID {}",
                        session.getSessionCode(), winningBid.getUserID());
            }
        }

        auctionSessionRepository.save(session);

        // Hủy lịch và tắt toàn bộ auto-bid của phiên này
        try {
            autoBidScheduler.cancelSessionTasks(session.getId());
        } catch (Exception e) {
            log.error("[BACKGROUND-SERVICE] Lỗi tắt auto-bid phiên {}: ", session.getSessionCode(), e);
        }

        // Xử lý ví tiền ảo: Khấu trừ cọc người thắng, hoàn cọc người thua
        try {
            walletService.handleSessionEnded(session.getId());
        } catch (Exception e) {
            log.error("[BACKGROUND-SERVICE] Lỗi xử lý cọc ví phiên {}: ", session.getSessionCode(), e);
        }

        // Lấy thông tin biển số để broadcast
        String plateNumber = "";
        if (session.getNumberPlateId() != null) {
            plateNumber = numberPlateRepository.findById(session.getNumberPlateId())
                    .map(NumberPlate::getPlateNumber)
                    .orElse("");
        }

        String time = DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now());

        // 1. Gửi thông điệp cập nhật trạng thái tới trang danh sách biển số (/topic/auctions)
        BidMessageVO statusMessage = BidMessageVO.builder()
                .roomId(session.getSessionCode())
                .plateNumber(plateNumber)
                .currentPrice(finalPrice)
                .status("END")
                .type("STATUS_CHANGE")
                .timestamp(time)
                .build();
        messagingTemplate.convertAndSend("/topic/auctions", statusMessage);

        // 2. Gửi thông báo kết thúc tới phòng đấu giá (/topic/auction/{roomId})
        messagingTemplate.convertAndSend("/topic/auction/" + session.getSessionCode(), statusMessage);

        // 3. Gửi sự kiện END vào kênh thông báo phòng (/topic/room/{roomId})
        RoomEventVO endEvent = RoomEventVO.builder()
                .roomId(session.getSessionCode())
                .event("END")
                .message("Phiên đấu giá đã kết thúc! Mức giá chốt: " + finalPrice + " VNĐ")
                .timestamp(time)
                .build();
        messagingTemplate.convertAndSend("/topic/room/" + session.getSessionCode(), endEvent);

        // Gửi thông báo kết quả:
        Long winnerUserId = session.getUserInfoId();
        List<BidHistory> sessionBids = bidHistoryRepository.findByAuctionSessionIdOrderByBidTimeDesc(session.getId());
        Set<Long> bidderUserIds = sessionBids.stream()
                .map(BidHistory::getUserID)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (winnerUserId != null) {
            notificationService.notifyUser(winnerUserId, NotificationTypeEnum.ENDED_WON,
                    "Chúc mừng! Bạn đã trúng đấu giá",
                    String.format("Bạn đã trúng đấu giá biển số %s trong phiên %s với giá %,d VNĐ.", plateNumber, session.getSessionCode(), finalPrice),
                    session.getSessionCode());
        }

        for (Long bId : bidderUserIds) {
            if (!bId.equals(winnerUserId)) {
                notificationService.notifyUser(bId, NotificationTypeEnum.ENDED_LOST,
                        "Phiên đấu giá đã kết thúc",
                        String.format("Phiên đấu giá biển số %s đã kết thúc với mức giá %,d VNĐ.", plateNumber, finalPrice),
                        session.getSessionCode());
            }
        }

        List<AuctionWatch> watchers = auctionWatchRepository.findBySessionId(session.getId());
        for (AuctionWatch w : watchers) {
            if (!bidderUserIds.contains(w.getUserId())) {
                notificationService.notifyUser(w.getUserId(), NotificationTypeEnum.ENDED,
                        "Phiên bạn theo dõi đã kết thúc",
                        String.format("Phiên đấu giá biển số %s đã kết thúc với mức giá %,d VNĐ.", plateNumber, finalPrice),
                        session.getSessionCode());
            }
        }

        log.info("[BACKGROUND-SERVICE] Đã hoàn tất chốt phiên {} với giá: {} VNĐ",
                session.getSessionCode(), finalPrice);
    }

    /**
     * Xử lý chuyển phiên từ SOON sang LIVE khi đến giờ bắt đầu
     */
    private void handleStartSession(AuctionSession session, LocalDateTime now) {
        log.info("[BACKGROUND-SERVICE] Phiên {} ({}) đã đến giờ bắt đầu. Tự động chuyển status = LIVE...",
                session.getSessionCode(), session.getTitle());

        session.setStatus(AuctionStatusEnum.LIVE);
        auctionSessionRepository.save(session);

        // Kích hoạt auto-bid nếu có cấu hình trước đó
        try {
            autoBidScheduler.scheduleNextAutoBid(session.getId());
        } catch (Exception e) {
            log.error("[BACKGROUND-SERVICE] Lỗi kích hoạt auto-bid phiên {}: ", session.getSessionCode(), e);
        }

        String plateNumber = "";
        if (session.getNumberPlateId() != null) {
            plateNumber = numberPlateRepository.findById(session.getNumberPlateId())
                    .map(NumberPlate::getPlateNumber)
                    .orElse("");
        }

        String time = DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now());

        BidMessageVO startMessage = BidMessageVO.builder()
                .roomId(session.getSessionCode())
                .plateNumber(plateNumber)
                .currentPrice(session.getCurrentPrice() != null ? session.getCurrentPrice() : session.getStartPrice())
                .status("LIVE")
                .type("STATUS_CHANGE")
                .timestamp(time)
                .build();
        messagingTemplate.convertAndSend("/topic/auctions", startMessage);
        messagingTemplate.convertAndSend("/topic/auction/" + session.getSessionCode(), startMessage);

        RoomEventVO startEvent = RoomEventVO.builder()
                .roomId(session.getSessionCode())
                .event("START")
                .message("Phiên đấu giá đã chính thức bắt đầu!")
                .timestamp(time)
                .build();
        messagingTemplate.convertAndSend("/topic/room/" + session.getSessionCode(), startEvent);

        // Gửi thông báo STARTED tới watchers và người đã đăng ký
        Set<Long> interestedUserIds = new HashSet<>();
        auctionWatchRepository.findBySessionId(session.getId()).forEach(w -> interestedUserIds.add(w.getUserId()));
        auctionRegistrationRepository.findBySessionIdAndStatus(session.getId(), RegistrationStatusEnum.ACTIVE)
                .forEach(r -> interestedUserIds.add(r.getUserId()));

        if (!interestedUserIds.isEmpty()) {
            notificationService.notifyUsers(new ArrayList<>(interestedUserIds), NotificationTypeEnum.STARTED,
                    "Phiên đấu giá đã bắt đầu!",
                    String.format("Phiên đấu giá biển số %s (%s) đã chính thức mở sàn.", plateNumber, session.getSessionCode()),
                    session.getSessionCode());
        }
    }

    private void checkStartingSoonSessions(LocalDateTime now) {
        int minutes = auctionProperties.getNotify() != null ? auctionProperties.getNotify().getStartingSoonMinutes() : 15;
        List<AuctionSession> soonSessions = auctionSessionRepository.findByStatus(AuctionStatusEnum.SOON);
        for (AuctionSession session : soonSessions) {
            if (session.getStartTime() != null && session.getStartTime().isAfter(now)) {
                long diffMinutes = Duration.between(now, session.getStartTime()).toMinutes();
                if (diffMinutes <= minutes) {
                    List<AuctionWatch> watchers = auctionWatchRepository.findBySessionId(session.getId());
                    for (AuctionWatch w : watchers) {
                        if (!notificationLogRepository.existsByUserIdAndSessionIdAndType(w.getUserId(), session.getId(), NotificationTypeEnum.STARTING_SOON)) {
                            notificationLogRepository.save(NotificationLog.builder()
                                    .userId(w.getUserId())
                                    .sessionId(session.getId())
                                    .type(NotificationTypeEnum.STARTING_SOON)
                                    .createdAt(now)
                                    .build());
                            notificationService.notifyUser(w.getUserId(), NotificationTypeEnum.STARTING_SOON,
                                    "Phiên đấu giá sắp bắt đầu!",
                                    String.format("Phiên %s sẽ bắt đầu trong khoảng %d phút nữa.", session.getSessionCode(), diffMinutes),
                                    session.getSessionCode());
                        }
                    }
                }
            }
        }
    }

    private void checkEndingSoonSessions(LocalDateTime now) {
        int minutes = auctionProperties.getNotify() != null ? auctionProperties.getNotify().getEndingSoonMinutes() : 5;
        List<AuctionSession> liveSessions = auctionSessionRepository.findByStatus(AuctionStatusEnum.LIVE);
        for (AuctionSession session : liveSessions) {
            if (session.getEndTime() != null && session.getEndTime().isAfter(now)) {
                long diffMinutes = Duration.between(now, session.getEndTime()).toMinutes();
                if (diffMinutes <= minutes) {
                    Set<Long> userIds = new HashSet<>();
                    auctionWatchRepository.findBySessionId(session.getId()).forEach(w -> userIds.add(w.getUserId()));
                    auctionRegistrationRepository.findBySessionIdAndStatus(session.getId(), RegistrationStatusEnum.ACTIVE)
                            .forEach(r -> userIds.add(r.getUserId()));

                    for (Long uid : userIds) {
                        if (!notificationLogRepository.existsByUserIdAndSessionIdAndType(uid, session.getId(), NotificationTypeEnum.ENDING_SOON)) {
                            notificationLogRepository.save(NotificationLog.builder()
                                    .userId(uid)
                                    .sessionId(session.getId())
                                    .type(NotificationTypeEnum.ENDING_SOON)
                                    .createdAt(now)
                                    .build());
                            notificationService.notifyUser(uid, NotificationTypeEnum.ENDING_SOON,
                                    "Phiên đấu giá sắp kết thúc!",
                                    String.format("Phiên %s chỉ còn khoảng %d phút nữa là chốt giá.", session.getSessionCode(), diffMinutes),
                                    session.getSessionCode());
                        }
                    }
                }
            }
        }
    }
}
