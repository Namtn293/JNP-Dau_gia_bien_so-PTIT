package com.ptit.bigdata.coreservice.controller;

import com.ptit.bigdata.coreservice.configuration.AuctionProperties;
import com.ptit.bigdata.coreservice.configuration.ClientIpHandshakeInterceptor;
import com.ptit.bigdata.coreservice.configuration.security.AuctionUserPrincipal;
import com.ptit.bigdata.coreservice.configuration.security.WebSocketAuthChannelInterceptor;
import com.ptit.bigdata.coreservice.configuration.security.WebSocketSecurityException;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.NumberPlate;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.enumration.BidSourceEnum;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import com.ptit.bigdata.coreservice.enumration.RoleEnum;
import com.ptit.bigdata.coreservice.enumration.RoomRoleEnum;
import com.ptit.bigdata.coreservice.model.vo.BidMessageVO;
import com.ptit.bigdata.coreservice.model.vo.ChatMessageVO;
import com.ptit.bigdata.coreservice.model.vo.ErrorVO;
import com.ptit.bigdata.coreservice.model.vo.RoomEventVO;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.NumberPlateRepository;
import com.ptit.bigdata.coreservice.service.BidService;
import com.ptit.bigdata.coreservice.service.RoomRoleResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

/**
 * AuctionWebSocketController - Xử lý tin nhắn WebSocket STOMP
 * Hỗ trợ các kênh thời gian thực:
 * 1. Chat trong phòng đấu giá (/topic/chat/{roomId})
 * 2. Báo danh vào / rời phòng (/topic/room/{roomId})
 * 3. Đặt giá phòng đấu giá (/app/bid/{roomId} -> BidService -> Listener broadcast)
 * 4. Kênh cập nhật thời gian thực cho Trang Danh Sách Biển Số (/topic/auctions)
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class AuctionWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final AuctionSessionRepository auctionSessionRepository;
    private final NumberPlateRepository numberPlateRepository;
    private final BidService bidService;
    private final RoomRoleResolver roomRoleResolver;
    private final AuctionProperties auctionProperties;

    /**
     * Nhận tin nhắn chat từ Client gửi lên /app/chat/{roomId}
     * Broadcast tới tất cả người tham gia đang subscribe /topic/chat/{roomId}
     * Chỉ BIDDER hoặc ADMIN được gửi tin nhắn (nếu viewerCanChat = false).
     */
    @MessageMapping("/chat/{roomId}")
    public void handleChat(
            @DestinationVariable("roomId") String roomId,
            ChatMessageVO message,
            Principal principal) {
        AuctionUserPrincipal userPrincipal = WebSocketAuthChannelInterceptor.extractPrincipal(principal);
        if (userPrincipal == null || userPrincipal.isAnonymous()) {
            sendError(principal, ErrorCode.BID_UNAUTHORIZED);
            return;
        }

        Long userId = userPrincipal.getUserId();
        RoomRoleEnum role = roomRoleResolver.resolveBySessionCode(userId, roomId);

        if (role == RoomRoleEnum.VIEWER && !auctionProperties.getRoom().isViewerCanChat()) {
            sendError(principal, ErrorCode.CHAT_BIDDER_ONLY);
            return;
        }

        String senderName = userPrincipal.getFullName() != null && !userPrincipal.getFullName().isBlank()
                ? userPrincipal.getFullName()
                : userPrincipal.getUsername();

        if (message.getId() == null || message.getId().isBlank()) {
            message.setId(java.util.UUID.randomUUID().toString());
        }
        if (message.getTimestamp() == null || message.getTimestamp().isBlank()) {
            message.setTimestamp(DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now()));
        }
        message.setRoomId(roomId);
        message.setSenderName(senderName);
        if (message.getType() == null) {
            message.setType("CHAT");
        }

        log.info("[CHAT] Phòng {}: [{}] ({}) -> {}", roomId, senderName, role, message.getContent());
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
    }

    /**
     * Nhận sự kiện vào phòng từ Client gửi lên /app/room/{roomId}/join
     * Broadcast tới /topic/room/{roomId}
     */
    @MessageMapping("/room/{roomId}/join")
    @SendTo("/topic/room/{roomId}")
    public RoomEventVO handleJoin(
            @DestinationVariable("roomId") String roomId,
            RoomEventVO event,
            Principal principal) {
        AuctionUserPrincipal userPrincipal = WebSocketAuthChannelInterceptor.extractPrincipal(principal);
        String participantName = (userPrincipal != null && !userPrincipal.isAnonymous())
                ? userPrincipal.getFullName()
                : "Người tham gia";

        event.setRoomId(roomId);
        event.setEvent("JOIN");
        event.setMessage(participantName + " đã tham gia phòng");
        if (event.getTimestamp() == null || event.getTimestamp().isBlank()) {
            event.setTimestamp(DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now()));
        }
        log.info("[PHÒNG] {} tham gia phòng: {}", participantName, roomId);
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
            RoomEventVO event,
            Principal principal) {
        AuctionUserPrincipal userPrincipal = WebSocketAuthChannelInterceptor.extractPrincipal(principal);
        String participantName = (userPrincipal != null && !userPrincipal.isAnonymous())
                ? userPrincipal.getFullName()
                : "Người tham gia";

        event.setRoomId(roomId);
        event.setEvent("LEAVE");
        event.setMessage(participantName + " đã rời phòng");
        if (event.getTimestamp() == null || event.getTimestamp().isBlank()) {
            event.setTimestamp(DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now()));
        }
        log.info("[PHÒNG] {} rời khỏi phòng: {}", participantName, roomId);
        return event;
    }

    /**
     * Nhận lượt đặt giá mới từ Client trong phòng gửi lên /app/bid/{roomId}
     * Ủy quyền xử lý cho BidService.
     * Việc broadcast tới các kênh do BidBroadcastListener phụ trách sau khi commit transaction thành công.
     */
    @MessageMapping("/bid/{roomId}")
    public void handleBid(
            @DestinationVariable("roomId") String roomId,
            BidMessageVO bid,
            Principal principal,
            SimpMessageHeaderAccessor headerAccessor) {
        AuctionUserPrincipal userPrincipal = WebSocketAuthChannelInterceptor.extractPrincipal(principal);
        Long userId = (userPrincipal != null && !userPrincipal.isAnonymous()) ? userPrincipal.getUserId() : null;

        String clientIp = extractClientIp(headerAccessor);

        try {
            bidService.placeBid(roomId, userId, bid.getBidAmount(), BidSourceEnum.MANUAL, clientIp);
        } catch (BusinessException e) {
            log.warn("[BID-REJECTED] Phòng {}: User {} bị từ chối: {}",
                    roomId, principal != null ? principal.getName() : "null", e.getErrorCode().getMessage());
            sendError(principal, e.getErrorCode());
        } catch (Exception e) {
            log.error("[BID-EXCEPTION] Phòng {}: Lỗi hệ thống: ", roomId, e);
            sendCustomError(principal, "INTERNAL_ERROR", "Lỗi xử lý đặt giá: " + e.getMessage());
        }
    }

    /**
     * Nhận lượt đặt giá trực tiếp từ Trang Danh Sách Biển Số gửi lên /app/auction/bid (hoặc /app/bid)
     */
    @MessageMapping({"/auction/bid", "/bid"})
    public void handleDashboardBid(
            BidMessageVO bid,
            Principal principal,
            SimpMessageHeaderAccessor headerAccessor) {
        AuctionUserPrincipal userPrincipal = WebSocketAuthChannelInterceptor.extractPrincipal(principal);
        Long userId = (userPrincipal != null && !userPrincipal.isAnonymous()) ? userPrincipal.getUserId() : null;

        String clientIp = extractClientIp(headerAccessor);

        String sessionCode = bid.getRoomId();
        if ((sessionCode == null || sessionCode.isBlank()) && bid.getPlateNumber() != null && !bid.getPlateNumber().isBlank()) {
            Optional<NumberPlate> plateOpt = numberPlateRepository.findByPlateNumber(bid.getPlateNumber());
            if (plateOpt.isPresent()) {
                Optional<AuctionSession> sessionOpt = auctionSessionRepository.findFirstByNumberPlateIdAndStatus(plateOpt.get().getId(), AuctionStatusEnum.LIVE);
                if (sessionOpt.isEmpty()) {
                    sessionOpt = auctionSessionRepository.findFirstByNumberPlateIdOrderByStartTimeDesc(plateOpt.get().getId());
                }
                if (sessionOpt.isPresent()) {
                    sessionCode = sessionOpt.get().getSessionCode();
                }
            }
        }

        if (sessionCode == null || sessionCode.isBlank()) {
            sendError(principal, ErrorCode.AUCTION_NOT_FOUND);
            return;
        }

        try {
            bidService.placeBid(sessionCode, userId, bid.getBidAmount(), BidSourceEnum.MANUAL, clientIp);
        } catch (BusinessException e) {
            log.warn("[DASHBOARD-BID-REJECTED] Biển {}: User {} bị từ chối: {}",
                    bid.getPlateNumber(), principal != null ? principal.getName() : "null", e.getErrorCode().getMessage());
            sendError(principal, e.getErrorCode());
        } catch (Exception e) {
            log.error("[DASHBOARD-BID-EXCEPTION] Lỗi hệ thống: ", e);
            sendCustomError(principal, "INTERNAL_ERROR", "Lỗi xử lý đặt giá: " + e.getMessage());
        }
    }

    /**
     * Broadcast sự kiện cập nhật trạng thái phiên (ví dụ: SOON -> LIVE, LIVE -> END)
     * CHỈ CHO PHÉP ADMIN THỰC HIỆN
     */
    @MessageMapping("/auction/status")
    @SendTo("/topic/auctions")
    public BidMessageVO handleAuctionStatusUpdate(BidMessageVO statusMessage, Principal principal) {
        AuctionUserPrincipal userPrincipal = WebSocketAuthChannelInterceptor.extractPrincipal(principal);
        if (userPrincipal == null || userPrincipal.getRoleEnum() != RoleEnum.ADMIN) {
            log.warn("[STATUS-UPDATE] Từ chối: User {} không có quyền ADMIN",
                    principal != null ? principal.getName() : "Anonymous");
            throw new WebSocketSecurityException("ADMIN_REQUIRED",
                    "Chỉ quản trị viên mới có quyền cập nhật trạng thái phiên đấu giá");
        }

        if (statusMessage.getTimestamp() == null || statusMessage.getTimestamp().isBlank()) {
            statusMessage.setTimestamp(DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now()));
        }
        if (statusMessage.getType() == null) {
            statusMessage.setType("STATUS_CHANGE");
        }
        log.info("[STATUS-UPDATE] Biển {}: Trạng thái -> {}", statusMessage.getPlateNumber(), statusMessage.getStatus());
        return statusMessage;
    }

    private String extractClientIp(SimpMessageHeaderAccessor headerAccessor) {
        if (headerAccessor != null && headerAccessor.getSessionAttributes() != null) {
            Object ip = headerAccessor.getSessionAttributes().get(ClientIpHandshakeInterceptor.CLIENT_IP_ATTR);
            if (ip instanceof String s && !s.isBlank()) {
                return s;
            }
        }
        return "127.0.0.1";
    }

    private void sendError(Principal principal, ErrorCode errorCode) {
        if (principal != null && principal.getName() != null) {
            messagingTemplate.convertAndSendToUser(
                    principal.getName(),
                    "/queue/errors",
                    new ErrorVO(errorCode.getCode(), errorCode.getMessage())
            );
        }
    }

    private void sendCustomError(Principal principal, String code, String message) {
        if (principal != null && principal.getName() != null) {
            messagingTemplate.convertAndSendToUser(
                    principal.getName(),
                    "/queue/errors",
                    new ErrorVO(code, message)
            );
        }
    }
}
