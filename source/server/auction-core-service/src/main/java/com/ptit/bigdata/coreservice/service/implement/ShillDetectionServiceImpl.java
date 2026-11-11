package com.ptit.bigdata.coreservice.service.implement;

import com.ptit.bigdata.coreservice.configuration.AuctionProperties;
import com.ptit.bigdata.coreservice.core.auth.entity.User;
import com.ptit.bigdata.coreservice.core.auth.repository.TokenRepository;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.BidHistory;
import com.ptit.bigdata.coreservice.entity.ShillAlert;
import com.ptit.bigdata.coreservice.entity.UserInfo;
import com.ptit.bigdata.coreservice.enumration.*;
import com.ptit.bigdata.coreservice.model.dto.ShillAlertReviewDTO;
import com.ptit.bigdata.coreservice.model.vo.BidHistoryItemVO;
import com.ptit.bigdata.coreservice.model.vo.ShillAlertVO;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.BidHistoryRepository;
import com.ptit.bigdata.coreservice.repository.ShillAlertRepository;
import com.ptit.bigdata.coreservice.repository.UserInfoRepository;
import com.ptit.bigdata.coreservice.service.AutoBidService;
import com.ptit.bigdata.coreservice.service.NotificationService;
import com.ptit.bigdata.coreservice.service.ShillDetectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShillDetectionServiceImpl implements ShillDetectionService {

    private final ShillAlertRepository shillAlertRepository;
    private final BidHistoryRepository bidHistoryRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final UserRepository userRepository;
    private final UserInfoRepository userInfoRepository;
    private final TokenRepository tokenRepository;
    private final AutoBidService autoBidService;
    private final NotificationService notificationService;
    private final AuctionProperties auctionProperties;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void processManualBid(Long sessionId) {
        AuctionSession session = auctionSessionRepository.findById(sessionId).orElse(null);
        if (session == null) return;

        int minChain = (auctionProperties.getShill() != null) ? auctionProperties.getShill().getMinAlternatingBids() : 6;
        int maxGapSeconds = (auctionProperties.getShill() != null) ? auctionProperties.getShill().getMaxGapSeconds() : 15;

        // Lấy 2N lượt MANUAL mới nhất của phiên
        List<BidHistory> manualBids = bidHistoryRepository.findTop20ByAuctionSessionIdAndSourceOrderByBidTimeDesc(sessionId, BidSourceEnum.MANUAL);
        if (manualBids.size() < minChain) {
            return;
        }

        // Bắt đầu tính chuỗi liên tục từ lượt mới nhất (index 0)
        BidHistory b0 = manualBids.get(0);
        BidHistory b1 = manualBids.get(1);

        Long u0 = b0.getUserID();
        Long u1 = b1.getUserID();
        if (u0 == null || u1 == null || u0.equals(u1)) {
            return; // 2 lượt liên tiếp không đổi người
        }

        long firstGap = Math.abs(Duration.between(b1.getBidTime(), b0.getBidTime()).getSeconds());
        if (firstGap > maxGapSeconds) {
            return; // Gap lượt đầu tiên đã vượt quá quy định
        }

        List<BidHistory> chain = new ArrayList<>();
        chain.add(b0);
        chain.add(b1);

        for (int i = 2; i < manualBids.size(); i++) {
            BidHistory prev = manualBids.get(i - 1);
            BidHistory curr = manualBids.get(i);

            if (curr.getUserID() == null) break;

            // Người đặt phải là u0 hoặc u1 và phải xen kẽ với prev
            if (!curr.getUserID().equals(u0) && !curr.getUserID().equals(u1)) {
                break; // Có người thứ 3 chen vào
            }
            if (curr.getUserID().equals(prev.getUserID())) {
                break; // Không xen kẽ
            }

            long gap = Math.abs(Duration.between(curr.getBidTime(), prev.getBidTime()).getSeconds());
            if (gap > maxGapSeconds) {
                break; // Khoảng cách > 15s
            }

            chain.add(curr);
        }

        int chainLen = chain.size();
        if (chainLen < minChain) {
            return;
        }

        // Tính gap min và gap avg
        long minGap = Long.MAX_VALUE;
        long totalGap = 0;
        int gapCount = chainLen - 1;

        for (int i = 0; i < gapCount; i++) {
            long g = Math.abs(Duration.between(chain.get(i + 1).getBidTime(), chain.get(i).getBidTime()).getSeconds());
            if (g < minGap) minGap = g;
            totalGap += g;
        }
        double avgGap = gapCount > 0 ? (double) totalGap / gapCount : 0.0;

        // Kiểm tra same IP
        boolean sameIp = checkSameIp(chain, u0, u1);

        // Mức độ severity
        ShillSeverityEnum severity = (sameIp || chainLen >= 2 * minChain)
                ? ShillSeverityEnum.HIGH
                : ShillSeverityEnum.MEDIUM;

        Long userA = Math.min(u0, u1);
        Long userB = Math.max(u0, u1);

        LocalDateTime firstBidAt = chain.get(chain.size() - 1).getBidTime();
        LocalDateTime lastBidAt = chain.get(0).getBidTime();

        Optional<ShillAlert> openOpt = shillAlertRepository.findBySessionIdAndUserAIdAndUserBIdAndStatus(
                sessionId, userA, userB, ShillAlertStatusEnum.OPEN);

        ShillAlert alert;
        if (openOpt.isPresent()) {
            alert = openOpt.get();
            alert.setBidCount(chainLen);
            alert.setMinGapSeconds(minGap);
            alert.setAvgGapSeconds(avgGap);
            alert.setSameIp(sameIp);
            alert.setSeverity(severity);
            alert.setLastBidAt(lastBidAt);
            alert = shillAlertRepository.save(alert);
            log.info("[SHILL-UPDATE] Cập nhật cảnh báo thổi giá phiên {}: User {} & {} ({} lượt, severity={})",
                    session.getSessionCode(), userA, userB, chainLen, severity);
        } else {
            // Kiểm tra xem đã từng bị DISMISSED chưa: tạo mới khi chuỗi dài thêm >= N lượt sau reviewedAt
            List<ShillAlert> previousAlerts = shillAlertRepository.findBySessionIdAndUserAIdAndUserBId(sessionId, userA, userB);
            Optional<ShillAlert> lastDismissed = previousAlerts.stream()
                    .filter(a -> a.getStatus() == ShillAlertStatusEnum.DISMISSED && a.getReviewedAt() != null)
                    .max(Comparator.comparing(ShillAlert::getReviewedAt));

            if (lastDismissed.isPresent()) {
                LocalDateTime revAt = lastDismissed.get().getReviewedAt();
                long bidsAfterReview = chain.stream()
                        .filter(b -> b.getBidTime() != null && b.getBidTime().isAfter(revAt))
                        .count();
                if (bidsAfterReview < minChain) {
                    return;
                }
            }

            alert = ShillAlert.builder()
                    .sessionId(sessionId)
                    .sessionCode(session.getSessionCode())
                    .userAId(userA)
                    .userBId(userB)
                    .bidCount(chainLen)
                    .minGapSeconds(minGap)
                    .avgGapSeconds(avgGap)
                    .sameIp(sameIp)
                    .severity(severity)
                    .status(ShillAlertStatusEnum.OPEN)
                    .firstBidAt(firstBidAt)
                    .lastBidAt(lastBidAt)
                    .build();
            alert = shillAlertRepository.save(alert);
            log.warn("[SHILL-DETECTED] Phát hiện dấu hiệu thổi giá tại phiên {}: User {} & {} ({} lượt, severity={})",
                    session.getSessionCode(), userA, userB, chainLen, severity);
        }

        // Bắn alert tới kênh WebSocket admin
        ShillAlertVO alertVO = mapToVO(alert, chain);
        messagingTemplate.convertAndSend("/topic/admin/alerts", alertVO);

        // Gửi Notification cho các Admin
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRoleEnum() == RoleEnum.ADMIN)
                .collect(Collectors.toList());

        String title = "Cảnh báo thổi giá (Shill Bidding)";
        String content = String.format("Phát hiện nghi vấn thổi giá tại phiên %s: 2 tài khoản xen kẽ %d lượt (Mức độ: %s).",
                session.getSessionCode(), chainLen, severity.name());

        for (User adm : admins) {
            notificationService.notifyUser(adm.getId(), NotificationTypeEnum.SHILL_ALERT, title, content, session.getSessionCode());
        }
    }

    private boolean checkSameIp(List<BidHistory> chain, Long u0, Long u1) {
        Set<String> ipU0 = new HashSet<>();
        Set<String> ipU1 = new HashSet<>();

        for (BidHistory b : chain) {
            if (b.getClientIp() != null && !b.getClientIp().isBlank() && !"127.0.0.1".equals(b.getClientIp())) {
                if (b.getUserID().equals(u0)) {
                    ipU0.add(b.getClientIp());
                } else if (b.getUserID().equals(u1)) {
                    ipU1.add(b.getClientIp());
                }
            }
        }
        for (String ip : ipU0) {
            if (ipU1.contains(ip)) return true;
        }
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ShillAlertVO> getAlerts(ShillAlertStatusEnum status, String sessionCode, Pageable pageable) {
        Page<ShillAlert> page;
        if (status != null && sessionCode != null && !sessionCode.isBlank()) {
            page = shillAlertRepository.findByStatusAndSessionCodeOrderByCreatedAtDesc(status, sessionCode, pageable);
        } else if (status != null) {
            page = shillAlertRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        } else if (sessionCode != null && !sessionCode.isBlank()) {
            page = shillAlertRepository.findBySessionCodeOrderByCreatedAtDesc(sessionCode, pageable);
        } else {
            page = shillAlertRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return page.map(a -> mapToVO(a, null));
    }

    @Override
    @Transactional(readOnly = true)
    public ShillAlertVO getAlertDetail(Long id) {
        ShillAlert alert = shillAlertRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SHILL_ALERT_NOT_FOUND));

        List<BidHistory> bidsA = bidHistoryRepository.findByAuctionSessionIdAndUserIDOrderByBidTimeDesc(alert.getSessionId(), alert.getUserAId());
        List<BidHistory> bidsB = bidHistoryRepository.findByAuctionSessionIdAndUserIDOrderByBidTimeDesc(alert.getSessionId(), alert.getUserBId());

        List<BidHistory> combined = new ArrayList<>();
        combined.addAll(bidsA);
        combined.addAll(bidsB);
        combined.sort((b1, b2) -> b2.getBidTime().compareTo(b1.getBidTime()));

        return mapToVO(alert, combined);
    }

    @Override
    @Transactional
    public ShillAlertVO reviewAlert(Long adminId, Long id, ShillAlertReviewDTO dto) {
        ShillAlert alert = shillAlertRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SHILL_ALERT_NOT_FOUND));

        alert.setStatus(dto.getStatus() != null ? dto.getStatus() : ShillAlertStatusEnum.CONFIRMED);
        alert.setReviewedBy(adminId);
        alert.setReviewedAt(LocalDateTime.now());
        alert.setNote(dto.getNote());
        alert = shillAlertRepository.save(alert);

        return mapToVO(alert, null);
    }

    @Override
    @Transactional
    public void banUser(Long adminId, Long userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 1. Cập nhật status BANNED
        userInfoRepository.findByUserName(user.getUsername()).ifPresent(ui -> {
            ui.setStatus(StatusEnum.BANNED);
            userInfoRepository.save(ui);
        });

        // 2. Thu hồi toàn bộ token đăng nhập
        tokenRepository.findByUserId(user.getId()).forEach(t -> {
            t.setRevoked(true);
            t.setExpired(true);
            tokenRepository.save(t);
        });

        // 3. Tắt auto-bid của user ở các phiên
        List<AuctionSession> liveSessions = auctionSessionRepository.findByStatus(AuctionStatusEnum.LIVE);
        for (AuctionSession session : liveSessions) {
            try {
                autoBidService.disable(userId, session.getSessionCode());
            } catch (Exception ignored) {}
        }

        log.warn("[ADMIN-BAN] Admin {} đã cấm tài khoản user {}: {}", adminId, userId, reason);
    }

    private String resolveDisplayName(Long userId) {
        if (userId == null) return "User #?";
        return userRepository.findById(userId)
                .flatMap(u -> userInfoRepository.findByUserName(u.getUsername())
                        .map(ui -> (ui.getFullName() != null && !ui.getFullName().isBlank()) ? ui.getFullName() : u.getUsername()))
                .orElseGet(() -> userInfoRepository.findById(userId)
                        .map(UserInfo::getFullName)
                        .orElse("User #" + userId));
    }

    private ShillAlertVO mapToVO(ShillAlert a, List<BidHistory> bids) {
        String nameA = resolveDisplayName(a.getUserAId());
        String nameB = resolveDisplayName(a.getUserBId());

        List<BidHistoryItemVO> bidItems = null;
        if (bids != null) {
            DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm:ss");
            bidItems = bids.stream().map(b -> {
                String uName = b.getUserID().equals(a.getUserAId()) ? nameA : nameB;
                long prev = b.getPreviousPrice() != null ? b.getPreviousPrice() : 0L;
                long inc = prev > 0 ? (b.getBidAmount() - prev) : 0L;
                return BidHistoryItemVO.builder()
                        .userId(b.getUserID())
                        .userName(uName)
                        .bidAmount(b.getBidAmount())
                        .increment(inc)
                        .source(b.getSource() != null ? b.getSource().name() : "MANUAL")
                        .time(b.getBidTime() != null ? b.getBidTime().format(timeFmt) : "")
                        .bidTime(b.getBidTime() != null ? b.getBidTime().toString() : "")
                        .isWinning(b.getIsWinningBid())
                        .build();
            }).collect(Collectors.toList());
        }

        return ShillAlertVO.builder()
                .id(a.getId())
                .sessionId(a.getSessionId())
                .sessionCode(a.getSessionCode())
                .userAId(a.getUserAId())
                .userAName(nameA)
                .userBId(a.getUserBId())
                .userBName(nameB)
                .bidCount(a.getBidCount())
                .minGapSeconds(a.getMinGapSeconds())
                .avgGapSeconds(a.getAvgGapSeconds())
                .sameIp(a.getSameIp())
                .severity(a.getSeverity())
                .status(a.getStatus())
                .firstBidAt(a.getFirstBidAt())
                .lastBidAt(a.getLastBidAt())
                .reviewedBy(a.getReviewedBy())
                .reviewedAt(a.getReviewedAt())
                .note(a.getNote())
                .recentBids(bidItems)
                .build();
    }
}
