package com.ptit.bigdata.coreservice.event.listener;

import com.ptit.bigdata.coreservice.enumration.BidSourceEnum;
import com.ptit.bigdata.coreservice.event.BidPlacedEvent;
import com.ptit.bigdata.coreservice.service.ShillDetectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class ShillDetectionListener {

    private final ShillDetectionService shillDetectionService;

    @Async("auctionAsyncExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onBidPlaced(BidPlacedEvent event) {
        // Chỉ phân tích thuật toán khi lượt đặt giá là MANUAL
        if (event.source() == BidSourceEnum.MANUAL) {
            shillDetectionService.processManualBid(event.sessionId());
        }
    }
}

