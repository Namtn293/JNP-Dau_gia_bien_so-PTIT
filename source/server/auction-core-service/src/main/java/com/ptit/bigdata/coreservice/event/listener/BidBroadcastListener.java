package com.ptit.bigdata.coreservice.event.listener;

import com.ptit.bigdata.coreservice.event.BidPlacedEvent;
import com.ptit.bigdata.coreservice.model.vo.BidMessageVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.format.DateTimeFormatter;

@Slf4j
@Component
@RequiredArgsConstructor
public class BidBroadcastListener {

    private final SimpMessagingTemplate messagingTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onBidPlaced(BidPlacedEvent event) {
        String timestamp = DateTimeFormatter.ofPattern("HH:mm:ss").format(event.bidTime());
        String isoBidTime = event.bidTime().toString();

        BidMessageVO message = BidMessageVO.builder()
                .roomId(event.sessionCode())
                .userId(String.valueOf(event.userId()))
                .userName(event.fullName())
                .bidAmount(event.newPrice())
                .currentPrice(event.newPrice())
                .stepPrice(event.nextStep())
                .nextStep(event.nextStep())
                .nextMinBid(event.nextMinBid())
                .bidCount(event.bidCount())
                .plateNumber(event.plateNumber())
                .source(event.source().name())
                .bidTime(isoBidTime)
                .timestamp(timestamp)
                .type("BID")
                .status("LIVE")
                .build();

        // 1. Broadcast tới phòng đấu giá cụ thể
        messagingTemplate.convertAndSend("/topic/auction/" + event.sessionCode(), message);

        // 2. Broadcast tới trang danh sách biển số chung
        messagingTemplate.convertAndSend("/topic/auctions", message);

        log.debug("[BROADCAST] Phiên {}: Giá mới {} đã gửi tới /topic/auction/{} và /topic/auctions",
                event.sessionCode(), event.newPrice(), event.sessionCode());
    }
}

