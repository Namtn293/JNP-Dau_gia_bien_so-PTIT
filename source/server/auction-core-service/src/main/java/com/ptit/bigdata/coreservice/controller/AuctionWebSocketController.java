package com.ptit.bigdata.coreservice.controller;

import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.BidHistory;
import com.ptit.bigdata.coreservice.entity.NumberPlate;
import com.ptit.bigdata.coreservice.model.vo.BidMessageVO;
import com.ptit.bigdata.coreservice.model.vo.ChatMessageVO;
import com.ptit.bigdata.coreservice.model.vo.RoomEventVO;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.BidHistoryRepository;
import com.ptit.bigdata.coreservice.repository.NumberPlateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

/**
 * AuctionWebSocketController - Xử lý tin nhắn WebSocket STOMP
 * Hỗ trợ các kênh thời gian thực:
 * 1. Chat trong phòng đấu giá (/topic/chat/{roomId})
 * 2. Báo danh vào / rời phòng (/topic/room/{roomId})
 * 3. Đặt giá phòng đấu giá (/topic/auction/{roomId})
 * 4. Kênh cập nhật thời gian thực cho Trang Danh Sách Biển Số (/topic/auctions)
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class AuctionWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final AuctionSessionRepository auctionSessionRepository;
    private final NumberPlateRepository numberPlateRepository;
    private final BidHistoryRepository bidHistoryRepository;

    /**
     * Nhận tin nhắn chat từ Client gửi lên /app/chat/{roomId}
     * Broadcast tới tất cả người tham gia đang subscribe /topic/chat/{roomId}
     */
    @MessageMapping("/chat/{roomId}")
    @SendTo("/topic/chat/{roomId}")
    public ChatMessageVO handleChat(
            @DestinationVariable("roomId") String roomId,
            ChatMessageVO message) {
        if (message.getTimestamp() == null || message.getTimestamp().isBlank()) {
            message.setTimestamp(DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now()));
        }
        message.setRoomId(roomId);
        if (message.getType() == null) {
            message.setType("CHAT");
        }
        log.info("[CHAT] Phòng {}: [{}] -> {}", roomId, message.getSenderName(), message.getContent());
        return message;
    }

    /**
     * Nhận sự kiện vào phòng từ Client gửi lên /app/room/{roomId}/join
     * Broadcast tới /topic/room/{roomId}
     */
    @MessageMapping("/room/{roomId}/join")
    @SendTo("/topic/room/{roomId}")
    public RoomEventVO handleJoin(
            @DestinationVariable("roomId") String roomId,
            RoomEventVO event) {
        event.setRoomId(roomId);
        event.setEvent("JOIN");
        if (event.getTimestamp() == null || event.getTimestamp().isBlank()) {
            event.setTimestamp(DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now()));
        }
        log.info("[PHÒNG] Người dùng tham gia phòng: {}", roomId);
        return event;
    }

    /**
     * Nhận sự kiện rời phòng từ Client gửi lên /app/room/{roomId}/leave
     * Broadcast tới /topic/room/{roomId}
     */
    @MessageMapping("/room/{roomId}/leave")
    @SendTo("/topic/room/{roomId}")
    public RoomEventVO handleLeave(
            @DestinationVariable("roomId") String roomId,
            RoomEventVO event) {
        event.setRoomId(roomId);
        event.setEvent("LEAVE");
        if (event.getTimestamp() == null || event.getTimestamp().isBlank()) {
            event.setTimestamp(DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now()));
        }
        log.info("[PHÒNG] Người dùng rời khỏi phòng: {}", roomId);
        return event;
    }

    /**
     * Nhận lượt đặt giá mới từ Client trong phòng gửi lên /app/bid/{roomId}
     * Broadcast tới /topic/auction/{roomId} VÀ đồng thời broadcast tới /topic/auctions (cho trang danh sách biển số)
     */
    @MessageMapping("/bid/{roomId}")
    @SendTo("/topic/auction/{roomId}")
    public BidMessageVO handleBid(
            @DestinationVariable("roomId") String roomId,
            BidMessageVO bid) {
        bid.setRoomId(roomId);
        processBidPersistence(bid);

        log.info("[BID-ROOM] Phòng {}: [{}] đặt giá {} VNĐ (Giá hiện tại: {})",
                roomId, bid.getUserName(), bid.getBidAmount(), bid.getCurrentPrice());

        // Broadcast tới kênh danh sách biển số chung để trang Dashboard cập nhật real-time
        messagingTemplate.convertAndSend("/topic/auctions", bid);

        return bid;
    }

    /**
     * Nhận lượt đặt giá trực tiếp từ Trang Danh Sách Biển Số gửi lên /app/auction/bid (hoặc /app/bid)
     * Broadcast tới /topic/auctions cho tất cả client đang mở trang danh sách biển số
     */
    @MessageMapping({"/auction/bid", "/bid"})
    @SendTo("/topic/auctions")
    public BidMessageVO handleDashboardBid(BidMessageVO bid) {
        processBidPersistence(bid);

        log.info("[BID-DASHBOARD] Biển {}: [{}] đặt giá {} VNĐ (Giá mới: {})",
                bid.getPlateNumber(), bid.getUserName(), bid.getBidAmount(), bid.getCurrentPrice());

        // Nếu có roomId tương ứng, cũng broadcast tới phòng đấu giá cụ thể
        if (bid.getRoomId() != null && !bid.getRoomId().isBlank()) {
            messagingTemplate.convertAndSend("/topic/auction/" + bid.getRoomId(), bid);
        }

        return bid;
    }

    /**
     * Broadcast sự kiện cập nhật trạng thái phiên (ví dụ: SOON -> LIVE, LIVE -> END)
     */
    @MessageMapping("/auction/status")
    @SendTo("/topic/auctions")
    public BidMessageVO handleAuctionStatusUpdate(BidMessageVO statusMessage) {
        if (statusMessage.getTimestamp() == null || statusMessage.getTimestamp().isBlank()) {
            statusMessage.setTimestamp(DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now()));
        }
        if (statusMessage.getType() == null) {
            statusMessage.setType("STATUS_CHANGE");
        }
        log.info("[STATUS-UPDATE] Biển {}: Trạng thái -> {}", statusMessage.getPlateNumber(), statusMessage.getStatus());
        return statusMessage;
    }

    /**
     * Cập nhật dữ liệu vào Database nếu có bản ghi tương ứng
     */
    private void processBidPersistence(BidMessageVO bid) {
        if (bid.getTimestamp() == null || bid.getTimestamp().isBlank()) {
            bid.setTimestamp(DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now()));
        }
        if (bid.getType() == null) {
            bid.setType("BID");
        }

        try {
            AuctionSession session = null;
            // 1. Tìm theo plateNumber nếu có
            if (bid.getPlateNumber() != null && !bid.getPlateNumber().isBlank()) {
                Optional<NumberPlate> plateOpt = numberPlateRepository.findByPlateNumber(bid.getPlateNumber());
                if (plateOpt.isPresent()) {
                    session = auctionSessionRepository.findFirstByNumberPlateId(plateOpt.get().getId()).orElse(null);
                }
            }

            // 2. Nếu chưa thấy và có roomId, thử tìm theo sessionCode
            if (session == null && bid.getRoomId() != null && !bid.getRoomId().isBlank()) {
                session = auctionSessionRepository.findBySessionCode(bid.getRoomId()).orElse(null);
            }

            // 3. Nếu tìm thấy session trong CSDL, cập nhật giá và số lượt trả
            if (session != null) {
                long currentPrice = session.getCurrentPrice() != null ? session.getCurrentPrice() : session.getStartPrice();
                long step = session.getStepPrice() != null ? session.getStepPrice() : 5_000_000L;
                long newPrice = (bid.getBidAmount() != null && bid.getBidAmount() > 0)
                        ? bid.getBidAmount()
                        : (currentPrice + step);

                session.setCurrentPrice(newPrice);
                int count = (session.getBidCount() != null ? session.getBidCount() : 0) + 1;
                session.setBidCount(count);
                session.setWinningPrice(newPrice);
                auctionSessionRepository.save(session);

                // Lưu lịch sử đấu giá
                BidHistory history = BidHistory.builder()
                        .auctionSessionId(session.getId())
                        .bidAmount(newPrice)
                        .bidTime(LocalDateTime.now())
                        .isWinningBid(true)
                        .build();
                bidHistoryRepository.save(history);

                bid.setCurrentPrice(newPrice);
                bid.setBidCount(count);
                if (bid.getPlateNumber() == null || bid.getPlateNumber().isBlank()) {
                    numberPlateRepository.findById(session.getNumberPlateId())
                            .ifPresent(p -> bid.setPlateNumber(p.getPlateNumber()));
                }
                if (bid.getRoomId() == null || bid.getRoomId().isBlank()) {
                    bid.setRoomId(session.getSessionCode());
                }
            } else {
                // Mock data fallback: nếu không có trong DB thì tự tính toán giá và số lượt
                if (bid.getCurrentPrice() == null && bid.getBidAmount() != null) {
                    bid.setCurrentPrice(bid.getBidAmount());
                }
            }
        } catch (Exception e) {
            log.warn("Không thể lưu lượt đấu giá vào database: {}", e.getMessage());
            if (bid.getCurrentPrice() == null && bid.getBidAmount() != null) {
                bid.setCurrentPrice(bid.getBidAmount());
            }
        }
    }
}
