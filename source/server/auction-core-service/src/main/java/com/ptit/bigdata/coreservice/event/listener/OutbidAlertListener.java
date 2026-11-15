package com.ptit.bigdata.coreservice.event.listener;

import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.AutoBidConfig;
import com.ptit.bigdata.coreservice.enumration.NotificationTypeEnum;
import com.ptit.bigdata.coreservice.event.BidPlacedEvent;
import com.ptit.bigdata.coreservice.model.vo.OutbidAlertVO;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.AutoBidConfigRepository;
import com.ptit.bigdata.coreservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutbidAlertListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;
    private final AutoBidConfigRepository autoBidConfigRepository;
    private final AuctionSessionRepository auctionSessionRepository;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onBidPlaced(BidPlacedEvent event) {
        Long prevLeaderId = event.previousLeaderUserId();
        String prevLeaderUsername = event.previousLeaderUsername();

        // Chỉ gửi nếu có người dẫn giá trước và người đó khác người vừa bid
        if (prevLeaderId == null || prevLeaderId.equals(event.userId())) {
            return;
        }

        // Tính thời gian còn lại của phiên
        long remainingSeconds = 0;
        Optional<AuctionSession> sessionOpt = auctionSessionRepository.findById(event.sessionId());
        if (sessionOpt.isPresent() && sessionOpt.get().getEndTime() != null) {
            LocalDateTime now = LocalDateTime.now();
            if (sessionOpt.get().getEndTime().isAfter(now)) {
                remainingSeconds = Duration.between(now, sessionOpt.get().getEndTime()).getSeconds();
            }
        }

        // Kiểm tra người bị vượt có đang bật auto-bid không
        boolean autoBidActive = false;
        Optional<AutoBidConfig> autoBidOpt = autoBidConfigRepository.findByUserIdAndSessionId(prevLeaderId, event.sessionId());
        if (autoBidOpt.isPresent() && Boolean.TRUE.equals(autoBidOpt.get().getActive())) {
            autoBidActive = true;
        }

        OutbidAlertVO alert = OutbidAlertVO.builder()
                .sessionCode(event.sessionCode())
                .plateNumber(event.plateNumber())
                .newPrice(event.newPrice())
                .yourLastBid(event.previousPrice())
                .nextMinBid(event.nextMinBid())
                .nextStep(event.nextStep())
                .outbidBy(event.fullName())
                .remainingSeconds(remainingSeconds)
                .autoBidActive(autoBidActive)
                .bidTime(event.bidTime())
                .build();

        // 1. Gửi tức thì qua WebSocket tới kênh riêng của người bị vượt
        if (prevLeaderUsername != null && !prevLeaderUsername.isBlank()) {
            messagingTemplate.convertAndSendToUser(prevLeaderUsername, "/queue/outbid", alert);
            log.info("[OUTBID-ALERT] Đã gửi cảnh báo vượt giá tới user {} trong phiên {}", prevLeaderUsername, event.sessionCode());
        }

        // 2. Lưu Notification loại OUTBID để lưu vào lịch sử thông báo
        String title = "Bạn đã bị trả giá cao hơn!";
        String content = String.format("Tại phiên %s (%s), %s đã đặt mức giá mới %,d VNĐ.",
                event.sessionCode(), event.plateNumber(), event.fullName(), event.newPrice());
        notificationService.notifyUser(prevLeaderId, NotificationTypeEnum.OUTBID, title, content, event.sessionCode());
    }
}

