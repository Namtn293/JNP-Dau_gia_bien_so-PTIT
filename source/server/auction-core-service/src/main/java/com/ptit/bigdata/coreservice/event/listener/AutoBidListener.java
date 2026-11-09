package com.ptit.bigdata.coreservice.event.listener;

import com.ptit.bigdata.coreservice.event.BidPlacedEvent;
import com.ptit.bigdata.coreservice.service.AutoBidScheduler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class AutoBidListener {

    private final AutoBidScheduler autoBidScheduler;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onBidPlaced(BidPlacedEvent event) {
        // Đồng bộ lên lịch xử lý auto-bid tiếp theo cho phiên này
        autoBidScheduler.scheduleNextAutoBid(event.sessionId());
    }
}

