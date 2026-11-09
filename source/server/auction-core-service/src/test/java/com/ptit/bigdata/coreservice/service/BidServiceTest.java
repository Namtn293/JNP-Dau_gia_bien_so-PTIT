package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.configuration.AuctionProperties;
import com.ptit.bigdata.coreservice.core.auth.entity.User;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.BidHistory;
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
import com.ptit.bigdata.coreservice.service.implement.BidServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BidServiceTest {

    @Mock
    private AuctionSessionRepository auctionSessionRepository;
    @Mock
    private BidHistoryRepository bidHistoryRepository;
    @Mock
    private AuctionRegistrationRepository auctionRegistrationRepository;
    @Mock
    private NumberPlateRepository numberPlateRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserInfoRepository userInfoRepository;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    private StepPriceCalculator stepPriceCalculator;
    private BidServiceImpl bidService;

    @BeforeEach
    void setUp() {
        stepPriceCalculator = new StepPriceCalculator(new AuctionProperties());
        bidService = new BidServiceImpl(
                auctionSessionRepository,
                bidHistoryRepository,
                auctionRegistrationRepository,
                numberPlateRepository,
                userRepository,
                userInfoRepository,
                stepPriceCalculator,
                eventPublisher
        );
    }

    @Test
    @DisplayName("Đặt giá không đăng nhập -> BID_UNAUTHORIZED")
    void testPlaceBidWithoutLogin() {
        BusinessException ex = assertThrows(BusinessException.class, () ->
                bidService.placeBid("SES_TEST", null, 45_000_000L, BidSourceEnum.MANUAL, "127.0.0.1"));
        assertEquals(ErrorCode.BID_UNAUTHORIZED, ex.getErrorCode());
    }

    @Test
    @DisplayName("Phiên không tồn tại -> AUCTION_NOT_FOUND")
    void testPlaceBidNotFound() {
        when(auctionSessionRepository.findBySessionCodeForUpdate("SES_NOT_FOUND")).thenReturn(Optional.empty());

        BusinessException ex = assertThrows(BusinessException.class, () ->
                bidService.placeBid("SES_NOT_FOUND", 1L, 45_000_000L, BidSourceEnum.MANUAL, "127.0.0.1"));
        assertEquals(ErrorCode.AUCTION_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    @DisplayName("Phiên chưa mở hoặc đã kết thúc -> AUCTION_NOT_LIVE")
    void testPlaceBidNotLive() {
        AuctionSession session = AuctionSession.builder()
                .sessionCode("SES_SOON")
                .status(AuctionStatusEnum.SOON)
                .build();
        when(auctionSessionRepository.findBySessionCodeForUpdate("SES_SOON")).thenReturn(Optional.of(session));

        BusinessException ex = assertThrows(BusinessException.class, () ->
                bidService.placeBid("SES_SOON", 1L, 45_000_000L, BidSourceEnum.MANUAL, "127.0.0.1"));
        assertEquals(ErrorCode.AUCTION_NOT_LIVE, ex.getErrorCode());
    }

    @Test
    @DisplayName("Khách xem chưa cọc -> AUCTION_NOT_REGISTERED")
    void testPlaceBidViewerOnly() {
        AuctionSession session = AuctionSession.builder()
                .sessionCode("SES_LIVE")
                .status(AuctionStatusEnum.LIVE)
                .startPrice(40_000_000L)
                .currentPrice(40_000_000L)
                .endTime(LocalDateTime.now().plusHours(1))
                .build();
        when(auctionSessionRepository.findBySessionCodeForUpdate("SES_LIVE")).thenReturn(Optional.of(session));
        when(auctionRegistrationRepository.existsByUserIdAndSessionIdAndStatus(eq(1L), any(), eq(RegistrationStatusEnum.ACTIVE)))
                .thenReturn(false);

        BusinessException ex = assertThrows(BusinessException.class, () ->
                bidService.placeBid("SES_LIVE", 1L, 45_000_000L, BidSourceEnum.MANUAL, "127.0.0.1"));
        assertEquals(ErrorCode.AUCTION_NOT_REGISTERED, ex.getErrorCode());
    }

    @Test
    @DisplayName("Người đang dẫn giá đặt đè chính mình -> ALREADY_LEADING")
    void testPlaceBidAlreadyLeading() {
        AuctionSession session = AuctionSession.builder()
                .sessionCode("SES_LIVE")
                .status(AuctionStatusEnum.LIVE)
                .startPrice(40_000_000L)
                .currentPrice(45_000_000L)
                .userInfoId(1L) // User 1 đang dẫn
                .endTime(LocalDateTime.now().plusHours(1))
                .build();
        when(auctionSessionRepository.findBySessionCodeForUpdate("SES_LIVE")).thenReturn(Optional.of(session));
        when(auctionRegistrationRepository.existsByUserIdAndSessionIdAndStatus(eq(1L), any(), eq(RegistrationStatusEnum.ACTIVE)))
                .thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class, () ->
                bidService.placeBid("SES_LIVE", 1L, 50_000_000L, BidSourceEnum.MANUAL, "127.0.0.1"));
        assertEquals(ErrorCode.ALREADY_LEADING, ex.getErrorCode());
    }

    @Test
    @DisplayName("Đặt giá nhỏ hơn giá tối thiểu -> BID_TOO_LOW")
    void testPlaceBidTooLow() {
        AuctionSession session = AuctionSession.builder()
                .sessionCode("SES_LIVE")
                .status(AuctionStatusEnum.LIVE)
                .startPrice(40_000_000L)
                .currentPrice(40_000_000L)
                .endTime(LocalDateTime.now().plusHours(1))
                .build();
        when(auctionSessionRepository.findBySessionCodeForUpdate("SES_LIVE")).thenReturn(Optional.of(session));
        when(auctionRegistrationRepository.existsByUserIdAndSessionIdAndStatus(eq(2L), any(), eq(RegistrationStatusEnum.ACTIVE)))
                .thenReturn(true);

        // Giá tối thiểu là 40tr + 5tr = 45tr; đặt 42tr bị từ chối
        BusinessException ex = assertThrows(BusinessException.class, () ->
                bidService.placeBid("SES_LIVE", 2L, 42_000_000L, BidSourceEnum.MANUAL, "127.0.0.1"));
        assertEquals(ErrorCode.BID_TOO_LOW, ex.getErrorCode());
    }

    @Test
    @DisplayName("Đặt sai bước giá -> BID_INVALID_STEP")
    void testPlaceBidInvalidStep() {
        AuctionSession session = AuctionSession.builder()
                .sessionCode("SES_LIVE")
                .status(AuctionStatusEnum.LIVE)
                .startPrice(40_000_000L)
                .currentPrice(40_000_000L)
                .endTime(LocalDateTime.now().plusHours(1))
                .build();
        when(auctionSessionRepository.findBySessionCodeForUpdate("SES_LIVE")).thenReturn(Optional.of(session));
        when(auctionRegistrationRepository.existsByUserIdAndSessionIdAndStatus(eq(2L), any(), eq(RegistrationStatusEnum.ACTIVE)))
                .thenReturn(true);

        // Giá hiện tại 40tr, bước 5tr. Đặt 47tr (lệch 2tr) bị từ chối
        BusinessException ex = assertThrows(BusinessException.class, () ->
                bidService.placeBid("SES_LIVE", 2L, 47_000_000L, BidSourceEnum.MANUAL, "127.0.0.1"));
        assertEquals(ErrorCode.BID_INVALID_STEP, ex.getErrorCode());
    }

    @Test
    @DisplayName("Đặt giá hợp lệ -> Thành công, cập nhật giá mới và bước giá kế tiếp")
    void testPlaceBidSuccess() {
        AuctionSession session = AuctionSession.builder()
                .sessionCode("SES_LIVE")
                .status(AuctionStatusEnum.LIVE)
                .startPrice(40_000_000L)
                .currentPrice(40_000_000L)
                .bidCount(0)
                .endTime(LocalDateTime.now().plusHours(1))
                .build();
        when(auctionSessionRepository.findBySessionCodeForUpdate("SES_LIVE")).thenReturn(Optional.of(session));
        when(auctionRegistrationRepository.existsByUserIdAndSessionIdAndStatus(eq(2L), any(), eq(RegistrationStatusEnum.ACTIVE)))
                .thenReturn(true);
        when(bidHistoryRepository.save(any(BidHistory.class))).thenAnswer(inv -> {
            BidHistory bh = inv.getArgument(0);
            bh.setId(100L);
            return bh;
        });

        User user = new User();
        user.setUserName("bidder2");
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));

        BidResultVO result = bidService.placeBid("SES_LIVE", 2L, 45_000_000L, BidSourceEnum.MANUAL, "127.0.0.1");

        assertNotNull(result);
        assertEquals(45_000_000L, result.getCurrentPrice());
        assertEquals(1, result.getBidCount());
        assertEquals(5_000_000L, result.getNextStep());
        assertEquals(50_000_000L, result.getNextMinBid());
        verify(bidHistoryRepository).clearWinning(any());
        verify(eventPublisher).publishEvent(any(BidPlacedEvent.class));
    }
}
