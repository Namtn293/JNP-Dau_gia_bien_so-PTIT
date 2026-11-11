package com.ptit.bigdata.coreservice.configuration;

import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.service.StepPriceCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * AuctionDemoDataInitializer:
 * Đảm bảo hệ thống luôn có dữ liệu phiên đấu giá thực tế (có cả phiên LIVE và SOON)
 * để kiểm thử tính năng đặt giá, auto-bid, outbid alert và hiển thị trên giao diện người dùng.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuctionDemoDataInitializer {

    private final AuctionSessionRepository auctionSessionRepository;
    private final StepPriceCalculator stepPriceCalculator;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void ensureDemoSessionsActive() {
        LocalDateTime now = LocalDateTime.now();
        List<AuctionSession> liveSessions = auctionSessionRepository.findByStatus(AuctionStatusEnum.LIVE);

        // Kiểm tra xem có phiên LIVE nào còn hiệu lực hay không
        boolean hasValidLiveSession = liveSessions.stream()
                .anyMatch(s -> s.getEndTime() != null && s.getEndTime().isAfter(now));

        if (!hasValidLiveSession) {
            log.info("[DATA-INIT] Không tìm thấy phiên LIVE hợp lệ (tất cả đã quá hạn). Tiến hành làm mới thời gian các phiên mẫu...");

            // 1. Cập nhật SES-HN-30K88888 sang LIVE (Biển ngũ quý Hà Nội)
            auctionSessionRepository.findBySessionCode("SES-HN-30K88888").ifPresent(s -> {
                s.setStatus(AuctionStatusEnum.LIVE);
                s.setStartTime(now.minusMinutes(20));
                s.setEndTime(now.plusHours(4));
                if (s.getCurrentPrice() == null || s.getCurrentPrice() < 750_000_000L) {
                    s.setCurrentPrice(750_000_000L);
                }
                long step = stepPriceCalculator.stepFor(s.getCurrentPrice());
                s.setStepPrice(step);
                auctionSessionRepository.saveAndFlush(s);
                log.info("[DATA-INIT] Đã kích hoạt phiên LIVE: SES-HN-30K88888 (Giá: {} VNĐ, Bước: {} VNĐ, Kết thúc: {})",
                        s.getCurrentPrice(), step, s.getEndTime());
            });

            // 2. Cập nhật SES-HN-30K56789 sang LIVE (Biển sảnh tiến < 100tr để test bậc bước giá 5tr)
            auctionSessionRepository.findBySessionCode("SES-HN-30K56789").ifPresent(s -> {
                s.setStatus(AuctionStatusEnum.LIVE);
                s.setStartTime(now.minusMinutes(10));
                s.setEndTime(now.plusHours(2));
                if (s.getCurrentPrice() == null || s.getCurrentPrice() <= 40_000_000L) {
                    s.setCurrentPrice(85_000_000L);
                }
                long step = stepPriceCalculator.stepFor(s.getCurrentPrice());
                s.setStepPrice(step);
                auctionSessionRepository.saveAndFlush(s);
                log.info("[DATA-INIT] Đã kích hoạt phiên LIVE: SES-HN-30K56789 (Giá: {} VNĐ, Bước: {} VNĐ, Kết thúc: {})",
                        s.getCurrentPrice(), step, s.getEndTime());
            });

            // 3. Cập nhật SES-HCM-51K99999 sang SOON (Sắp diễn ra sau 45 phút)
            auctionSessionRepository.findBySessionCode("SES-HCM-51K99999").ifPresent(s -> {
                s.setStatus(AuctionStatusEnum.SOON);
                s.setStartTime(now.plusMinutes(45));
                s.setEndTime(now.plusHours(3));
                auctionSessionRepository.saveAndFlush(s);
                log.info("[DATA-INIT] Đã cập nhật phiên SOON: SES-HCM-51K99999 (Bắt đầu: {})", s.getStartTime());
            });

            // 4. Cập nhật SES-BN-99A99999 sang SOON (Ngày mai)
            auctionSessionRepository.findBySessionCode("SES-BN-99A99999").ifPresent(s -> {
                s.setStatus(AuctionStatusEnum.SOON);
                s.setStartTime(now.plusDays(1));
                s.setEndTime(now.plusDays(2));
                auctionSessionRepository.saveAndFlush(s);
            });

            // 5. Cập nhật SES-QN-14A88888 sang SOON (Sau 2 ngày)
            auctionSessionRepository.findBySessionCode("SES-QN-14A88888").ifPresent(s -> {
                s.setStatus(AuctionStatusEnum.SOON);
                s.setStartTime(now.plusDays(2));
                s.setEndTime(now.plusDays(3));
                auctionSessionRepository.saveAndFlush(s);
            });
        }
    }
}

