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
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
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
    private final StepPriceCalculator stepPriceCalculator;
    private final TransactionTemplate transactionTemplate;

    /**
     * Chạy định kỳ mỗi 2 giây một lần để quét và xử lý trạng thái các phiên đấu giá
     * (Không bọc toàn hàm trong @Transactional để mỗi phiên commit DB xong mới broadcast WS,
     * tránh race condition client nhận event START/END rồi refetch phải trạng thái SOON/LIVE cũ)
     */
    @Scheduled(initialDelay = 5000, fixedDelay = 2000)
    public void checkAndProcessAuctionStatus() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Tự động chốt các phiên LIVE đã quá endTime sang END
        List<AuctionSession> expiredSessions = auctionSessionRepository
                .findByStatusAndEndTimeBefore(AuctionStatusEnum.LIVE, now);

        for (AuctionSession session : expiredSessions) {
            try {
                handleEndSession(session.getId(), now);
            } catch (Exception e) {
                log.error("[BACKGROUND-SERVICE] Lỗi chốt phiên LIVE {}: ", session.getSessionCode(), e);
            }
        }

        // 1b. Tự động chốt các phiên SOON đã quá endTime sang END
        List<AuctionSession> expiredSoonSessions = auctionSessionRepository
                .findByStatusAndEndTimeBefore(AuctionStatusEnum.SOON, now);

        for (AuctionSession session : expiredSoonSessions) {
            try {
                handleEndSession(session.getId(), now);
            } catch (Exception e) {
                log.error("[BACKGROUND-SERVICE] Lỗi chốt phiên SOON {}: ", session.getSessionCode(), e);
            }
        }

        // 2. Tự động chuyển các phiên SOON đã đến startTime sang LIVE
        List<AuctionSession> startingSessions = auctionSessionRepository
                .findByStatusAndStartTimeBeforeAndEndTimeAfter(AuctionStatusEnum.SOON, now, now);

        for (AuctionSession session : startingSessions) {
            try {
                handleStartSession(session.getId(), now);
            } catch (Exception e) {
                log.error("[BACKGROUND-SERVICE] Lỗi mở phiên {}: ", session.getSessionCode(), e);
            }
        }

        // 3. Quét thông báo phiên sắp bắt đầu (STARTING_SOON)
        try {
            transactionTemplate.executeWithoutResult(status -> checkStartingSoonSessions(now));
        } catch (Exception e) {
            log.error("[BACKGROUND-SERVICE] Lỗi quét STARTING_SOON: ", e);
        }

        // 4. Quét thông báo phiên sắp kết thúc (ENDING_SOON)
        try {
            transactionTemplate.executeWithoutResult(status -> checkEndingSoonSessions(now));
        } catch (Exception e) {
            log.error("[BACKGROUND-SERVICE] Lỗi quét ENDING_SOON: ", e);
        }
    }

    private record EndSessionPayload(
            Long sessionId,
            String sessionCode,
            String plateNumber,
            long finalPrice,
            int bidCount,
            String time
    ) {}

    private record StartSessionPayload(
            Long sessionId,
            String sessionCode,
            String plateNumber,
            long currentPrice,
            long nextStep,
            int bidCount,
            long remainingSeconds,
            String endTimeStr,
            Long endTimeEpochMs,
            String time
    ) {}

    /**
     * Xử lý kết thúc phiên đấu giá:
     * - Commit status = END, endPrice, hoàn/thu cọc trong transaction trước
     * - Sau khi transaction commit mới broadcast sự kiện END tới Dashboard và Auction Room
     */
    private void handleEndSession(Long sessionId, LocalDateTime now) {
        EndSessionPayload payload = transactionTemplate.execute(txStatus -> {
            AuctionSession session = auctionSessionRepository.findById(sessionId).orElse(null);
            if (session == null || session.getStatus() == AuctionStatusEnum.END) {
                return null;
            }

            log.info("[BACKGROUND-SERVICE] Phiên {} ({}) đã hết giờ. Bắt đầu tự động chốt kết quả...",
                    session.getSessionCode(), session.getTitle());

            session.setStatus(AuctionStatusEnum.END);

            long finalPrice = session.getCurrentPrice() != null ? session.getCurrentPrice() : session.getStartPrice();
            session.setEndPrice(finalPrice);
            session.setWinningPrice(finalPrice);

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

            try {
                walletService.handleSessionEnded(session.getId());
            } catch (Exception e) {
                log.error("[BACKGROUND-SERVICE] Lỗi xử lý cọc ví phiên {}: ", session.getSessionCode(), e);
            }

            String plateNumber = "";
            if (session.getNumberPlateId() != null) {
                plateNumber = numberPlateRepository.findById(session.getNumberPlateId())
                        .map(NumberPlate::getPlateNumber)
                        .orElse("");
            }

            String time = DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now());

            Long winnerUserId = session.getUserInfoId();
            Set<Long> bidderUserIds = bids.stream()
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

            int bidCount = session.getBidCount() != null ? session.getBidCount() : bids.size();
            log.info("[BACKGROUND-SERVICE] Đã hoàn tất chốt phiên {} với giá: {} VNĐ",
                    session.getSessionCode(), finalPrice);
            return new EndSessionPayload(session.getId(), session.getSessionCode(), plateNumber, finalPrice, bidCount, time);
        });

        if (payload == null) {
            return;
        }

        // Hủy lịch và tắt toàn bộ auto-bid sau khi đã chốt
        try {
            autoBidScheduler.cancelSessionTasks(payload.sessionId());
        } catch (Exception e) {
            log.error("[BACKGROUND-SERVICE] Lỗi tắt auto-bid phiên {}: ", payload.sessionCode(), e);
        }

        // Broadcast sau khi DB đã commit
        BidMessageVO statusMessage = BidMessageVO.builder()
                .roomId(payload.sessionCode())
                .plateNumber(payload.plateNumber())
                .currentPrice(payload.finalPrice())
                .bidCount(payload.bidCount())
                .remainingSeconds(0L)
                .status("END")
                .type("STATUS_CHANGE")
                .timestamp(payload.time())
                .build();
        messagingTemplate.convertAndSend("/topic/auctions", statusMessage);
        messagingTemplate.convertAndSend("/topic/auction/" + payload.sessionCode(), statusMessage);

        RoomEventVO endEvent = RoomEventVO.builder()
                .roomId(payload.sessionCode())
                .event("END")
                .message("Phiên đấu giá đã kết thúc! Mức giá chốt: " + payload.finalPrice() + " VNĐ")
                .remainingSeconds(0L)
                .timestamp(payload.time())
                .build();
        messagingTemplate.convertAndSend("/topic/room/" + payload.sessionCode(), endEvent);
    }

    /**
     * Xử lý chuyển phiên từ SOON sang LIVE khi đến giờ bắt đầu:
     * - Commit status = LIVE trong DB trước
     * - Sau khi commit mới kích hoạt auto-bid và broadcast sự kiện START/STATUS_CHANGE kèm remainingSeconds
     */
    private void handleStartSession(Long sessionId, LocalDateTime now) {
        StartSessionPayload payload = transactionTemplate.execute(txStatus -> {
            AuctionSession session = auctionSessionRepository.findById(sessionId).orElse(null);
            if (session == null || session.getStatus() != AuctionStatusEnum.SOON) {
                return null;
            }

            log.info("[BACKGROUND-SERVICE] Phiên {} ({}) đã đến giờ bắt đầu. Tự động chuyển status = LIVE...",
                    session.getSessionCode(), session.getTitle());

            session.setStatus(AuctionStatusEnum.LIVE);
            auctionSessionRepository.save(session);

            String plateNumber = "";
            if (session.getNumberPlateId() != null) {
                plateNumber = numberPlateRepository.findById(session.getNumberPlateId())
                        .map(NumberPlate::getPlateNumber)
                        .orElse("");
            }

            long currentPrice = session.getCurrentPrice() != null
                    ? session.getCurrentPrice()
                    : (session.getStartPrice() != null ? session.getStartPrice() : 40_000_000L);
            long nextStep = stepPriceCalculator.stepFor(currentPrice);
            long remainingSeconds = 180L;
            String endTimeStr = null;
            Long endTimeEpochMs = null;
            if (session.getEndTime() != null) {
                endTimeEpochMs = session.getEndTime().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
                remainingSeconds = Math.max(1L, Duration.between(now, session.getEndTime()).getSeconds());
                endTimeStr = session.getEndTime().toString();
            }
            int bidCount = session.getBidCount() != null ? session.getBidCount() : 0;
            String time = DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now());

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

            return new StartSessionPayload(
                    session.getId(),
                    session.getSessionCode(),
                    plateNumber,
                    currentPrice,
                    nextStep,
                    bidCount,
                    remainingSeconds,
                    endTimeStr,
                    endTimeEpochMs,
                    time
            );
        });

        if (payload == null) {
            return;
        }

        // Kích hoạt auto-bid sau khi status = LIVE đã commit xuống DB
        try {
            autoBidScheduler.scheduleNextAutoBid(payload.sessionId());
        } catch (Exception e) {
            log.error("[BACKGROUND-SERVICE] Lỗi kích hoạt auto-bid phiên {}: ", payload.sessionCode(), e);
        }

        long serverNowMs = System.currentTimeMillis();
        long exactRemaining = payload.endTimeEpochMs() != null
                ? Math.max(1L, (long) Math.ceil((payload.endTimeEpochMs() - serverNowMs) / 1000.0))
                : payload.remainingSeconds();

        BidMessageVO startMessage = BidMessageVO.builder()
                .roomId(payload.sessionCode())
                .plateNumber(payload.plateNumber())
                .currentPrice(payload.currentPrice())
                .stepPrice(payload.nextStep())
                .nextStep(payload.nextStep())
                .nextMinBid(payload.currentPrice() + payload.nextStep())
                .bidCount(payload.bidCount())
                .remainingSeconds(exactRemaining)
                .endTime(payload.endTimeStr())
                .endTimeEpochMs(payload.endTimeEpochMs())
                .serverTimeMs(serverNowMs)
                .status("LIVE")
                .type("STATUS_CHANGE")
                .timestamp(payload.time())
                .build();
        messagingTemplate.convertAndSend("/topic/auctions", startMessage);
        messagingTemplate.convertAndSend("/topic/auction/" + payload.sessionCode(), startMessage);

        RoomEventVO startEvent = RoomEventVO.builder()
                .roomId(payload.sessionCode())
                .event("START")
                .message("Phiên đấu giá đã chính thức bắt đầu!")
                .remainingSeconds(exactRemaining)
                .endTime(payload.endTimeStr())
                .endTimeEpochMs(payload.endTimeEpochMs())
                .serverTimeMs(serverNowMs)
                .timestamp(payload.time())
                .build();
        messagingTemplate.convertAndSend("/topic/room/" + payload.sessionCode(), startEvent);
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
