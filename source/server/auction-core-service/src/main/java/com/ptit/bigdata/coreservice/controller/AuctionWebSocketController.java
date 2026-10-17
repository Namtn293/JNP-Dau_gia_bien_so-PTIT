package com.ptit.bigdata.coreservice.controller;

import com.ptit.bigdata.coreservice.model.vo.BidMessageVO;
import com.ptit.bigdata.coreservice.model.vo.ChatMessageVO;
import com.ptit.bigdata.coreservice.model.vo.RoomEventVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

/**
 * AuctionWebSocketController - Xử lý tin nhắn WebSocket STOMP
 * Hỗ trợ các kênh thời gian thực:
 * 1. Chat trong phòng đấu giá
 * 2. Báo danh vào / rời phòng (Presence)
 * 3. Đặt giá thời gian thực (Bidding)
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class AuctionWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

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
     * Nhận lượt đặt giá mới từ Client gửi lên /app/bid/{roomId}
     * Broadcast tới /topic/auction/{roomId}
     */
    @MessageMapping("/bid/{roomId}")
    @SendTo("/topic/auction/{roomId}")
    public BidMessageVO handleBid(
            @DestinationVariable("roomId") String roomId,
            BidMessageVO bid) {
        bid.setRoomId(roomId);
        if (bid.getTimestamp() == null || bid.getTimestamp().isBlank()) {
            bid.setTimestamp(DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now()));
        }
        if (bid.getType() == null) {
            bid.setType("BID");
        }
        log.info("[BID] Phòng {}: [{}] đặt giá {} VNĐ (Giá hiện tại: {})",
                roomId, bid.getUserName(), bid.getBidAmount(), bid.getCurrentPrice());
        return bid;
    }
}
