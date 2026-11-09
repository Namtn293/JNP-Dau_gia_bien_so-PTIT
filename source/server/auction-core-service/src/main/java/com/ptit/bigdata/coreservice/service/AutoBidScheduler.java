package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.configuration.AuctionProperties;
import com.ptit.bigdata.coreservice.core.auth.entity.User;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.AutoBidConfig;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.enumration.AutoBidStopReasonEnum;
import com.ptit.bigdata.coreservice.enumration.BidSourceEnum;
import com.ptit.bigdata.coreservice.enumration.NotificationTypeEnum;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.AutoBidConfigRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Component
public class AutoBidScheduler {

    private final ThreadPoolTaskScheduler scheduler;
    private final AutoBidConfigRepository autoBidConfigRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final StepPriceCalculator stepPriceCalculator;
    private final BidService bidService;
    private final NotificationService notificationService;
    private final AuctionProperties auctionProperties;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Giữ future task đang chờ của mỗi phiên: mỗi phiên tối đa 1 task chờ
    private final Map<Long, ScheduledFuture<?>> pendingTasks = new ConcurrentHashMap<>();

    public AutoBidScheduler(
            @Qualifier("auctionTaskScheduler") ThreadPoolTaskScheduler scheduler,
            AutoBidConfigRepository autoBidConfigRepository,
            AuctionSessionRepository auctionSessionRepository,
            StepPriceCalculator stepPriceCalculator,
            BidService bidService,
            NotificationService notificationService,
            AuctionProperties auctionProperties,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.scheduler = scheduler;
        this.autoBidConfigRepository = autoBidConfigRepository;
        this.auctionSessionRepository = auctionSessionRepository;
        this.stepPriceCalculator = stepPriceCalculator;
        this.bidService = bidService;
        this.notificationService = notificationService;
        this.auctionProperties = auctionProperties;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Khởi động lại: quét các phiên LIVE có auto-bid để lên lịch lại
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        List<AuctionSession> liveSessions = auctionSessionRepository.findByStatus(AuctionStatusEnum.LIVE);
        for (AuctionSession session : liveSessions) {
            scheduleNextAutoBid(session.getId());
        }
    }

    /**
     * Lên lịch lượt auto-bid kế tiếp cho phiên
     */
    public synchronized void scheduleNextAutoBid(Long sessionId) {
        // 1. Hủy lịch đang chờ nếu có
        ScheduledFuture<?> existing = pendingTasks.remove(sessionId);
        if (existing != null && !existing.isDone()) {
            existing.cancel(false);
        }

        // 2. Kiểm tra phiên
        Optional<AuctionSession> sessionOpt = auctionSessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) return;
        AuctionSession session = sessionOpt.get();

        LocalDateTime now = LocalDateTime.now();
        if (session.getStatus() != AuctionStatusEnum.LIVE || (session.getEndTime() != null && now.isAfter(session.getEndTime()))) {
            return;
        }

        long currentPrice = session.getCurrentPrice() != null ? session.getCurrentPrice() : session.getStartPrice();
        long step = stepPriceCalculator.stepFor(currentPrice);
        long nextMinBid = currentPrice + step;
        Long leadingUserId = session.getUserInfoId();

        // 3. Tìm ứng viên: active = true, khác leading user, maxAmount >= nextMinBid
        List<AutoBidConfig> configs = autoBidConfigRepository.findBySessionIdAndActiveTrue(sessionId);
        List<AutoBidConfig> candidates = new ArrayList<>();

        for (AutoBidConfig config : configs) {
            if (leadingUserId != null && leadingUserId.equals(config.getUserId())) {
                continue; // Người đang dẫn giá không tự trả đè chính mình
            }
            if (config.getMaxAmount() < nextMinBid) {
                // Đã chạm trần giá
                stopConfig(config, AutoBidStopReasonEnum.MAX_REACHED, session.getSessionCode());
                continue;
            }
            candidates.add(config);
        }

        if (candidates.isEmpty()) {
            return;
        }

        // 4. Chọn 1 ứng viên tốt nhất:
        // Ưu tiên maxAmount cao nhất -> nếu bằng nhau lấy createdAt sớm nhất
        candidates.sort((c1, c2) -> {
            int cmp = Long.compare(c2.getMaxAmount(), c1.getMaxAmount());
            if (cmp != 0) return cmp;
            return c1.getCreatedAt().compareTo(c2.getCreatedAt());
        });

        AutoBidConfig chosenCandidate = candidates.get(0);

        // 5. Tính delay = base (5000ms) + jitter (ngẫu nhiên 0..1500ms)
        long baseDelay = (auctionProperties.getAutoBid() != null) ? auctionProperties.getAutoBid().getBaseDelayMs() : 5000L;
        long jitter = (auctionProperties.getAutoBid() != null) ? auctionProperties.getAutoBid().getJitterMs() : 1500L;
        long actualDelayMs = baseDelay + ThreadLocalRandom.current().nextLong(0, Math.max(1L, jitter));

        log.info("[AUTOBID-SCHEDULE] Phiên {}: Lên lịch auto-bid cho user {} sau {} ms (Trần: {})",
                session.getSessionCode(), chosenCandidate.getUserId(), actualDelayMs, chosenCandidate.getMaxAmount());

        ScheduledFuture<?> future = scheduler.schedule(
                () -> executeAutoBid(sessionId, chosenCandidate.getId()),
                Instant.now().plusMillis(actualDelayMs)
        );

        pendingTasks.put(sessionId, future);
    }

    /**
     * Hủy bỏ mọi lịch auto-bid của phiên (khi phiên kết thúc hoặc tạm dừng)
     */
    public synchronized void cancelSessionTasks(Long sessionId) {
        ScheduledFuture<?> existing = pendingTasks.remove(sessionId);
        if (existing != null && !existing.isDone()) {
            existing.cancel(false);
        }
        // Tắt tất cả auto-bid active của phiên
        List<AutoBidConfig> configs = autoBidConfigRepository.findBySessionIdAndActiveTrue(sessionId);
        for (AutoBidConfig cfg : configs) {
            stopConfig(cfg, AutoBidStopReasonEnum.SESSION_ENDED, null);
        }
    }

    private void executeAutoBid(Long sessionId, Long configId) {
        try {
            Optional<AuctionSession> sessionOpt = auctionSessionRepository.findById(sessionId);
            Optional<AutoBidConfig> configOpt = autoBidConfigRepository.findById(configId);

            if (sessionOpt.isEmpty() || configOpt.isEmpty()) return;

            AuctionSession session = sessionOpt.get();
            AutoBidConfig config = configOpt.get();

            // Kiểm tra lại toàn bộ điều kiện:
            LocalDateTime now = LocalDateTime.now();
            if (session.getStatus() != AuctionStatusEnum.LIVE || (session.getEndTime() != null && now.isAfter(session.getEndTime()))) {
                return;
            }

            if (!Boolean.TRUE.equals(config.getActive())) {
                scheduleNextAutoBid(sessionId);
                return;
            }

            if (session.getUserInfoId() != null && session.getUserInfoId().equals(config.getUserId())) {
                // Người này đã dẫn giá do sự kiện khác chen vào
                return;
            }

            long currentPrice = session.getCurrentPrice() != null ? session.getCurrentPrice() : session.getStartPrice();
            long step = stepPriceCalculator.stepFor(currentPrice);
            long nextMinBid = currentPrice + step;

            if (nextMinBid > config.getMaxAmount()) {
                stopConfig(config, AutoBidStopReasonEnum.MAX_REACHED, session.getSessionCode());
                scheduleNextAutoBid(sessionId);
                return;
            }

            // Thực hiện đặt giá tự động
            bidService.placeBid(session.getSessionCode(), config.getUserId(), null, BidSourceEnum.AUTO, "127.0.0.1");

            // Tăng số lượt đã tự trả
            config.setAutoBidCount((config.getAutoBidCount() != null ? config.getAutoBidCount() : 0) + 1);
            config.setUpdatedAt(LocalDateTime.now());
            autoBidConfigRepository.save(config);

            log.info("[AUTOBID-EXECUTED] Phiên {}: User {} auto-bid thành công mức giá {}",
                    session.getSessionCode(), config.getUserId(), nextMinBid);

        } catch (BusinessException e) {
            log.warn("[AUTOBID-REJECTED] Auto-bid thất bại: {}", e.getErrorCode().getMessage());
            autoBidConfigRepository.findById(configId).ifPresent(cfg -> {
                stopConfig(cfg, AutoBidStopReasonEnum.USER_DISABLED, null);
            });
            scheduleNextAutoBid(sessionId);
        } catch (Exception e) {
            log.error("[AUTOBID-ERROR] Lỗi khi thực thi auto-bid: ", e);
            scheduleNextAutoBid(sessionId);
        }
    }

    private void stopConfig(AutoBidConfig config, AutoBidStopReasonEnum reason, String sessionCode) {
        config.setActive(false);
        config.setStoppedReason(reason);
        config.setUpdatedAt(LocalDateTime.now());
        autoBidConfigRepository.save(config);

        userRepository.findById(config.getUserId()).ifPresent(user -> {
            Map<String, Object> payload = Map.of(
                    "sessionCode", sessionCode != null ? sessionCode : "",
                    "reason", reason.name(),
                    "message", "Chế độ đấu giá tự động đã dừng do " + (reason == AutoBidStopReasonEnum.MAX_REACHED ? "vượt giá trần" : reason.name())
            );
            try {
                messagingTemplate.convertAndSendToUser(user.getUsername(), "/queue/notifications", payload);
                messagingTemplate.convertAndSendToUser(user.getUsername(), "/queue/outbid", payload);
            } catch (Exception ignored) {}

            String title = "Đấu giá tự động đã dừng";
            String content = "Chế độ đấu giá tự động của bạn tại phiên " + (sessionCode != null ? sessionCode : "") + " đã dừng (" + reason.name() + ").";
            notificationService.notifyUser(config.getUserId(), NotificationTypeEnum.AUTO_BID_STOPPED, title, content, sessionCode);
        });
    }
}

