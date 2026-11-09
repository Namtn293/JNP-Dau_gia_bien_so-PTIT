package com.ptit.bigdata.coreservice.event.listener;

import com.ptit.bigdata.coreservice.configuration.AuctionProperties;
import com.ptit.bigdata.coreservice.entity.AuctionWatch;
import com.ptit.bigdata.coreservice.enumration.NotificationTypeEnum;
import com.ptit.bigdata.coreservice.event.BidPlacedEvent;
import com.ptit.bigdata.coreservice.repository.AuctionWatchRepository;
import com.ptit.bigdata.coreservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class WatchNotificationListener {

    private final AuctionWatchRepository auctionWatchRepository;
    private final NotificationService notificationService;
    private final AuctionProperties auctionProperties;

    // Throttle: key = userId + ":" + sessionId, value = epoch millis of last sent notification
    private final Map<String, Long> throttleMap = new ConcurrentHashMap<>();

    @Async("auctionAsyncExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onBidPlaced(BidPlacedEvent event) {
        List<AuctionWatch> watchers = auctionWatchRepository.findBySessionId(event.sessionId());
        if (watchers.isEmpty()) return;

        long now = System.currentTimeMillis();
        int throttleSeconds = (auctionProperties.getNotify() != null)
                ? auctionProperties.getNotify().getNewBidThrottleSeconds()
                : 60;
        long throttleMs = throttleSeconds * 1000L;

        List<Long> targetUserIds = new ArrayList<>();
        for (AuctionWatch watch : watchers) {
            Long uid = watch.getUserId();
            // Bỏ qua người vừa đặt giá và người vừa bị outbid (họ đã nhận outbid alert)
            if (uid.equals(event.userId()) || (event.previousLeaderUserId() != null && uid.equals(event.previousLeaderUserId()))) {
                continue;
            }

            String key = uid + ":" + event.sessionId();
            Long lastSent = throttleMap.get(key);
            if (lastSent == null || (now - lastSent) >= throttleMs) {
                targetUserIds.add(uid);
                throttleMap.put(key, now);
            }
        }

        if (!targetUserIds.isEmpty()) {
            String title = "Giá mới tại phiên bạn theo dõi";
            String content = String.format("Biển số %s vừa được trả mức giá mới %,d VNĐ.",
                    event.plateNumber(), event.newPrice());
            notificationService.notifyUsers(targetUserIds, NotificationTypeEnum.NEW_BID, title, content, event.sessionCode());
            log.info("[WATCH-NOTIF] Gửi thông báo giá mới phiên {} tới {} người theo dõi", event.sessionCode(), targetUserIds.size());
        }
    }
}

