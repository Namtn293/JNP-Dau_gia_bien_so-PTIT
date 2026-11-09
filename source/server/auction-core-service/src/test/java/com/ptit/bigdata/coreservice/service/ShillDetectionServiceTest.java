package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.configuration.AuctionProperties;
import com.ptit.bigdata.coreservice.core.auth.repository.TokenRepository;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.BidHistory;
import com.ptit.bigdata.coreservice.entity.ShillAlert;
import com.ptit.bigdata.coreservice.enumration.BidSourceEnum;
import com.ptit.bigdata.coreservice.enumration.ShillAlertStatusEnum;
import com.ptit.bigdata.coreservice.enumration.ShillSeverityEnum;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.BidHistoryRepository;
import com.ptit.bigdata.coreservice.repository.ShillAlertRepository;
import com.ptit.bigdata.coreservice.repository.UserInfoRepository;
import com.ptit.bigdata.coreservice.service.implement.ShillDetectionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShillDetectionServiceTest {

    @Mock
    private ShillAlertRepository shillAlertRepository;
    @Mock
    private BidHistoryRepository bidHistoryRepository;
    @Mock
    private AuctionSessionRepository auctionSessionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserInfoRepository userInfoRepository;
    @Mock
    private TokenRepository tokenRepository;
    @Mock
    private AutoBidService autoBidService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private ShillDetectionServiceImpl shillDetectionService;

    @BeforeEach
    void setUp() {
        AuctionProperties props = new AuctionProperties();
        shillDetectionService = new ShillDetectionServiceImpl(
                shillAlertRepository,
                bidHistoryRepository,
                auctionSessionRepository,
                userRepository,
                userInfoRepository,
                tokenRepository,
                autoBidService,
                notificationService,
                props,
                messagingTemplate
        );
    }

    @Test
    @DisplayName("A, B xen kẽ 6 lượt tay, mỗi lượt cách 10 giây -> có cảnh báo MEDIUM")
    void testAlternatingManualBidsCreatesAlert() {
        AuctionSession session = AuctionSession.builder().sessionCode("SES_SHILL").build();
        session.setId(1L);
        when(auctionSessionRepository.findById(1L)).thenReturn(Optional.of(session));

        LocalDateTime base = LocalDateTime.now();
        List<BidHistory> bids = new ArrayList<>();
        // Thứ tự giảm dần theo thời gian (mới nhất ở index 0)
        for (int i = 0; i < 6; i++) {
            Long uid = (i % 2 == 0) ? 10L : 20L;
            bids.add(BidHistory.builder()
                    .auctionSessionId(1L)
                    .userID(uid)
                    .bidAmount(100_000_000L - i * 5_000_000L)
                    .bidTime(base.minusSeconds(i * 10L))
                    .source(BidSourceEnum.MANUAL)
                    .clientIp("10.0.0." + uid)
                    .build());
        }

        when(bidHistoryRepository.findTop20ByAuctionSessionIdAndSourceOrderByBidTimeDesc(1L, BidSourceEnum.MANUAL))
                .thenReturn(bids);
        when(shillAlertRepository.findBySessionIdAndUserAIdAndUserBIdAndStatus(1L, 10L, 20L, ShillAlertStatusEnum.OPEN))
                .thenReturn(Optional.empty());
        when(shillAlertRepository.findBySessionIdAndUserAIdAndUserBId(1L, 10L, 20L))
                .thenReturn(Collections.emptyList());
        when(shillAlertRepository.save(any(ShillAlert.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.findAll()).thenReturn(Collections.emptyList());

        shillDetectionService.processManualBid(1L);

        ArgumentCaptor<ShillAlert> captor = ArgumentCaptor.forClass(ShillAlert.class);
        verify(shillAlertRepository).save(captor.capture());
        ShillAlert saved = captor.getValue();
        assertEquals(6, saved.getBidCount());
        assertEquals(ShillSeverityEnum.MEDIUM, saved.getSeverity());
        assertEquals(10L, saved.getUserAId());
        assertEquals(20L, saved.getUserBId());
    }

    @Test
    @DisplayName("Một lượt cách 20 giây (> 15s) -> không có cảnh báo")
    void testGapExceedsMaxNoAlert() {
        AuctionSession session = AuctionSession.builder().sessionCode("SES_SHILL").build();
        session.setId(1L);
        when(auctionSessionRepository.findById(1L)).thenReturn(Optional.of(session));

        LocalDateTime base = LocalDateTime.now();
        List<BidHistory> bids = new ArrayList<>();
        // Lượt thứ 3 cách lượt thứ 2 tận 20 giây
        long[] offsets = {0, 10, 30, 40, 50, 60};
        for (int i = 0; i < 6; i++) {
            Long uid = (i % 2 == 0) ? 10L : 20L;
            bids.add(BidHistory.builder()
                    .auctionSessionId(1L)
                    .userID(uid)
                    .bidAmount(100_000_000L - i * 5_000_000L)
                    .bidTime(base.minusSeconds(offsets[i]))
                    .source(BidSourceEnum.MANUAL)
                    .build());
        }

        when(bidHistoryRepository.findTop20ByAuctionSessionIdAndSourceOrderByBidTimeDesc(1L, BidSourceEnum.MANUAL))
                .thenReturn(bids);

        shillDetectionService.processManualBid(1L);

        verify(shillAlertRepository, never()).save(any());
    }

    @Test
    @DisplayName("Người thứ 3 chen vào -> chuỗi bị cắt (< 6 lượt) -> không có cảnh báo")
    void testThirdBidderBreaksChain() {
        AuctionSession session = AuctionSession.builder().sessionCode("SES_SHILL").build();
        session.setId(1L);
        when(auctionSessionRepository.findById(1L)).thenReturn(Optional.of(session));

        LocalDateTime base = LocalDateTime.now();
        List<BidHistory> bids = new ArrayList<>();
        Long[] users = {10L, 20L, 10L, 30L, 20L, 10L}; // user 30 chen vào ở giữa
        for (int i = 0; i < 6; i++) {
            bids.add(BidHistory.builder()
                    .auctionSessionId(1L)
                    .userID(users[i])
                    .bidAmount(100_000_000L - i * 5_000_000L)
                    .bidTime(base.minusSeconds(i * 8L))
                    .source(BidSourceEnum.MANUAL)
                    .build());
        }

        when(bidHistoryRepository.findTop20ByAuctionSessionIdAndSourceOrderByBidTimeDesc(1L, BidSourceEnum.MANUAL))
                .thenReturn(bids);

        shillDetectionService.processManualBid(1L);

        verify(shillAlertRepository, never()).save(any());
    }

    @Test
    @DisplayName("Hai người auto-bid trả xen kẽ -> không có cảnh báo vì chỉ lọc MANUAL")
    void testAutoBidsIgnoredNoAlert() {
        AuctionSession session = AuctionSession.builder().sessionCode("SES_SHILL").build();
        session.setId(1L);
        when(auctionSessionRepository.findById(1L)).thenReturn(Optional.of(session));

        // Chỉ trả về 2 lượt MANUAL (các lượt AUTO đã bị loại bởi query)
        when(bidHistoryRepository.findTop20ByAuctionSessionIdAndSourceOrderByBidTimeDesc(1L, BidSourceEnum.MANUAL))
                .thenReturn(List.of(
                        BidHistory.builder().userID(10L).bidTime(LocalDateTime.now()).source(BidSourceEnum.MANUAL).build(),
                        BidHistory.builder().userID(20L).bidTime(LocalDateTime.now().minusSeconds(5)).source(BidSourceEnum.MANUAL).build()
                ));

        shillDetectionService.processManualBid(1L);

        verify(shillAlertRepository, never()).save(any());
    }
}

