package com.ptit.bigdata.coreservice.service.implement;

import com.ptit.bigdata.coreservice.core.auth.entity.User;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.BidHistory;
import com.ptit.bigdata.coreservice.entity.UserInfo;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.enumration.BidSourceEnum;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import com.ptit.bigdata.coreservice.enumration.RegistrationStatusEnum;
import com.ptit.bigdata.coreservice.event.BidPlacedEvent;
import com.ptit.bigdata.coreservice.model.vo.BidResultVO;
import com.ptit.bigdata.coreservice.repository.AuctionRegistrationRepository;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.BidHistoryRepository;
import com.ptit.bigdata.coreservice.repository.NumberPlateRepository;
import com.ptit.bigdata.coreservice.repository.UserInfoRepository;
import com.ptit.bigdata.coreservice.service.BidService;
import com.ptit.bigdata.coreservice.service.StepPriceCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class BidServiceImpl implements BidService {

    private final AuctionSessionRepository auctionSessionRepository;
    private final BidHistoryRepository bidHistoryRepository;
    private final AuctionRegistrationRepository auctionRegistrationRepository;
    private final NumberPlateRepository numberPlateRepository;
    private final UserRepository userRepository;
    private final UserInfoRepository userInfoRepository;
    private final StepPriceCalculator stepPriceCalculator;
    private final ApplicationEventPublisher eventPublisher;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.ptit.bigdata.coreservice.service.NotificationService notificationService;

    @Override
    @Transactional
    public BidResultVO placeBid(String sessionCode, Long userId, Long bidAmount, BidSourceEnum source, String clientIp) {
        // 1. Kiểm tra đăng nhập
        if (userId == null) {
            throw new BusinessException(ErrorCode.BID_UNAUTHORIZED);
        }

        // Quản trị viên không được phép trực tiếp tham gia đặt giá
        User currentUser = userRepository.findById(userId).orElse(null);
        if (currentUser != null && currentUser.getRoleEnum() == com.ptit.bigdata.coreservice.enumration.RoleEnum.ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        // 2. Khóa dòng phiên đấu giá để chống race condition
        AuctionSession session = auctionSessionRepository.findBySessionCodeForUpdate(sessionCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        // 3. Trạng thái phiên phải là LIVE và chưa hết giờ
        LocalDateTime now = LocalDateTime.now();
        if (session.getStatus() != AuctionStatusEnum.LIVE || (session.getEndTime() != null && now.isAfter(session.getEndTime()))) {
            throw new BusinessException(ErrorCode.AUCTION_NOT_LIVE);
        }

        // 4. Kiểm tra quyền đấu giá (đã đăng ký và cọc)
        boolean isRegistered = auctionRegistrationRepository.existsByUserIdAndSessionIdAndStatus(
                userId, session.getId(), RegistrationStatusEnum.ACTIVE);
        if (!isRegistered) {
            throw new BusinessException(ErrorCode.AUCTION_NOT_REGISTERED);
        }

        // 5. Kiểm tra người đặt có đang dẫn giá không
        Long previousLeaderUserId = session.getUserInfoId();
        if (previousLeaderUserId != null && previousLeaderUserId.equals(userId)) {
            throw new BusinessException(ErrorCode.ALREADY_LEADING);
        }

        // 6. Tính toán bước giá theo bậc giá hiện tại
        long currentPrice = session.getCurrentPrice() != null ? session.getCurrentPrice() : session.getStartPrice();
        long step = stepPriceCalculator.stepFor(currentPrice);

        if (bidAmount == null || bidAmount <= 0) {
            bidAmount = currentPrice + step;
        }

        if (bidAmount < currentPrice + step) {
            throw new BusinessException(ErrorCode.BID_TOO_LOW);
        }

        if ((bidAmount - currentPrice) % step != 0) {
            throw new BusinessException(ErrorCode.BID_INVALID_STEP);
        }

        // 7. Bỏ cờ winning của các lượt bid trước đó trong phiên
        bidHistoryRepository.clearWinning(session.getId());

        // 8. Lưu lịch sử đặt giá mới
        BidHistory history = BidHistory.builder()
                .auctionSessionId(session.getId())
                .userID(userId)
                .bidAmount(bidAmount)
                .bidTime(now)
                .isWinningBid(true)
                .previousPrice(currentPrice)
                .stepApplied(step)
                .clientIp(clientIp)
                .source(source != null ? source : BidSourceEnum.MANUAL)
                .build();
        history = bidHistoryRepository.save(history);

        // 9. Cập nhật phiên đấu giá
        long nextStep = stepPriceCalculator.stepFor(bidAmount);
        long nextMinBid = bidAmount + nextStep;
        int newBidCount = (session.getBidCount() != null ? session.getBidCount() : 0) + 1;

        session.setCurrentPrice(bidAmount);
        session.setWinningPrice(bidAmount);
        session.setBidCount(newBidCount);
        session.setUserInfoId(userId);
        session.setStepPrice(nextStep);
        auctionSessionRepository.save(session);

        // Lấy thông tin người đặt & người dẫn giá trước
        String username = currentUser != null ? currentUser.getUsername() : String.valueOf(userId);
        UserInfo currentUserInfo = (currentUser != null)
                ? userInfoRepository.findByUserName(currentUser.getUsername()).orElse(null)
                : null;
        String fullName = (currentUserInfo != null && currentUserInfo.getFullName() != null && !currentUserInfo.getFullName().isBlank())
                ? currentUserInfo.getFullName()
                : username;

        String prevLeaderUsername = null;
        if (previousLeaderUserId != null) {
            prevLeaderUsername = userRepository.findById(previousLeaderUserId)
                    .map(User::getUsername)
                    .orElse(null);
        }

        String plateNumber = "";
        if (session.getNumberPlateId() != null) {
            plateNumber = numberPlateRepository.findById(session.getNumberPlateId())
                    .map(p -> p.getPlateNumber())
                    .orElse("");
        }

        // 10. Phát sự kiện BidPlacedEvent cho các listeners
        BidPlacedEvent event = new BidPlacedEvent(
                session.getId(),
                session.getSessionCode(),
                plateNumber,
                history.getId(),
                userId,
                username,
                fullName,
                previousLeaderUserId,
                prevLeaderUsername,
                currentPrice,
                bidAmount,
                nextStep,
                nextMinBid,
                newBidCount,
                history.getBidTime(),
                source != null ? source : BidSourceEnum.MANUAL,
                clientIp
        );
        eventPublisher.publishEvent(event);

        if (notificationService != null) {
            notificationService.notifyUser(
                    userId,
                    com.ptit.bigdata.coreservice.enumration.NotificationTypeEnum.BID_SUCCESS,
                    "Đặt giá thành công",
                    String.format("Bạn đã đặt giá thành công %,d VNĐ cho biển số %s trong phiên %s.",
                            bidAmount, plateNumber, session.getSessionCode()),
                    session.getSessionCode()
            );
        }

        log.info("[BID-SUCCESS] Phiên {}: [{}] đặt {} VNĐ thành công (Cũ: {}, Bước: {})",
                sessionCode, fullName, bidAmount, currentPrice, step);

        // 11. Trả về kết quả
        return BidResultVO.builder()
                .sessionId(session.getId())
                .sessionCode(session.getSessionCode())
                .plateNumber(plateNumber)
                .currentPrice(bidAmount)
                .bidCount(newBidCount)
                .nextStep(nextStep)
                .nextMinBid(nextMinBid)
                .userId(userId)
                .userName(fullName)
                .source(source != null ? source : BidSourceEnum.MANUAL)
                .bidTime(history.getBidTime())
                .timestamp(DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now()))
                .build();
    }
}

