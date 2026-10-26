package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.BidHistory;
import com.ptit.bigdata.coreservice.entity.NumberPlate;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.model.vo.BidMessageVO;
import com.ptit.bigdata.coreservice.model.vo.RoomEventVO;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.BidHistoryRepository;
import com.ptit.bigdata.coreservice.repository.NumberPlateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * AuctionBackgroundService - Dịch vụ chạy ngầm định kỳ (Background Service / Scheduler)
 * 
 * Nhiệm vụ chính:
 * 1. Tự động kiểm tra các phiên đấu giá đang diễn ra (LIVE) khi hết giờ (endTime <= NOW)
 *    -> Tự động cập nhật STATUS = END, chốt endPrice, lưu người trúng vào DB (winningPrice & userInfoId)
 *    -> Bắn sự kiện thời gian thực qua WebSocket để thông báo tới tất cả client.
 * 2. Tự động chuyển các phiên sắp diễn ra (SOON) sang LIVE khi đến giờ bắt đầu (startTime <= NOW).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuctionBackgroundService {

    private final AuctionSessionRepository auctionSessionRepository;
    private final BidHistoryRepository bidHistoryRepository;
    private final NumberPlateRepository numberPlateRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Chạy định kỳ mỗi 2 giây một lần để quét và xử lý trạng thái các phiên đấu giá
     */
    @Scheduled(fixedDelay = 2000)
    @Transactional
    public void checkAndProcessAuctionStatus() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Tự động chốt các phiên LIVE đã quá endTime sang END
        List<AuctionSession> expiredSessions = auctionSessionRepository
                .findByStatusAndEndTimeBefore(AuctionStatusEnum.LIVE, now);

        for (AuctionSession session : expiredSessions) {
            handleEndSession(session, now);
        }

        // 2. Tự động chuyển các phiên SOON đã đến startTime sang LIVE
        List<AuctionSession> startingSessions = auctionSessionRepository
                .findByStatusAndStartTimeBeforeAndEndTimeAfter(AuctionStatusEnum.SOON, now, now);

        for (AuctionSession session : startingSessions) {
            handleStartSession(session, now);
        }
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
    }
}
