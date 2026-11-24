package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.configuration.AuctionProperties;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.BidHistory;
import com.ptit.bigdata.coreservice.entity.NumberPlate;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.mail.AuctionMailService;
import com.ptit.bigdata.coreservice.model.vo.BidMessageVO;
import com.ptit.bigdata.coreservice.model.vo.RoomEventVO;
import com.ptit.bigdata.coreservice.repository.AuctionRegistrationRepository;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.AuctionWatchRepository;
import com.ptit.bigdata.coreservice.repository.BidHistoryRepository;
import com.ptit.bigdata.coreservice.repository.NotificationLogRepository;
import com.ptit.bigdata.coreservice.repository.NumberPlateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuctionBackgroundServiceTest {

    @Mock private AuctionSessionRepository auctionSessionRepository;
    @Mock private BidHistoryRepository bidHistoryRepository;
    @Mock private NumberPlateRepository numberPlateRepository;
    @Mock private SimpMessagingTemplate messagingTemplate;
    @Mock private WalletService walletService;
    @Mock private NotificationService notificationService;
    @Mock private NotificationLogRepository notificationLogRepository;
    @Mock private AuctionWatchRepository auctionWatchRepository;
    @Mock private AuctionRegistrationRepository auctionRegistrationRepository;
    @Mock private AutoBidScheduler autoBidScheduler;
    @Mock private TransactionTemplate transactionTemplate;
    @Mock private TransactionStatus txStatus;
    @Mock private AuctionMailService auctionMailService;

    private AuctionBackgroundService backgroundService;

    @BeforeEach
    void setUp() {
        StepPriceCalculator stepPriceCalculator = new StepPriceCalculator(new AuctionProperties());
        backgroundService = new AuctionBackgroundService(
                auctionSessionRepository,
                bidHistoryRepository,
                numberPlateRepository,
                messagingTemplate,
                walletService,
                notificationService,
                notificationLogRepository,
                auctionWatchRepository,
                auctionRegistrationRepository,
                new AuctionProperties(),
                autoBidScheduler,
                stepPriceCalculator,
                transactionTemplate,
                auctionMailService
        );
    }

    @Test
    @DisplayName("Chuyển SOON -> LIVE phải commit DB trước khi gửi START/STATUS_CHANGE kèm remainingSeconds")
    void testSoonToLiveCommitsBeforeBroadcastWithRemainingSeconds() {
        AuctionSession session = AuctionSession.builder()
                .sessionCode("SES-BN-99A99999")
                .title("Đấu giá biển số xe ô tô 99A-999.99")
                .numberPlateId(99L)
                .startPrice(40_000_000L)
                .currentPrice(40_000_000L)
                .stepPrice(5_000_000L)
                .bidCount(0)
                .startTime(LocalDateTime.now().minusSeconds(1))
                .endTime(LocalDateTime.now().plusHours(2))
                .status(AuctionStatusEnum.SOON)
                .build();
        session.setId(13L);

        NumberPlate plate = NumberPlate.builder()
                .plateNumber("99A-999.99")
                .build();
        plate.setId(99L);

        when(auctionSessionRepository.findByStatusAndEndTimeBefore(eq(AuctionStatusEnum.LIVE), any()))
                .thenReturn(Collections.emptyList());
        when(auctionSessionRepository.findByStatusAndEndTimeBefore(eq(AuctionStatusEnum.SOON), any()))
                .thenReturn(Collections.emptyList());
        when(auctionSessionRepository.findByStatusAndStartTimeBeforeAndEndTimeAfter(eq(AuctionStatusEnum.SOON), any(), any()))
                .thenReturn(List.of(session));
        when(auctionSessionRepository.findByStatus(AuctionStatusEnum.SOON)).thenReturn(Collections.emptyList());
        when(auctionSessionRepository.findByStatus(AuctionStatusEnum.LIVE)).thenReturn(Collections.emptyList());

        when(auctionSessionRepository.findById(13L)).thenReturn(Optional.of(session));
        when(numberPlateRepository.findById(99L)).thenReturn(Optional.of(plate));
        when(auctionWatchRepository.findBySessionId(13L)).thenReturn(Collections.emptyList());
        when(auctionRegistrationRepository.findBySessionIdAndStatus(eq(13L), any())).thenReturn(Collections.emptyList());

        doAnswer(inv -> {
            TransactionCallback<?> cb = inv.getArgument(0);
            return cb.doInTransaction(txStatus);
        }).when(transactionTemplate).execute(any());

        doAnswer(inv -> {
            Consumer<TransactionStatus> c = inv.getArgument(0);
            c.accept(txStatus);
            return null;
        }).when(transactionTemplate).executeWithoutResult(any());

        backgroundService.checkAndProcessAuctionStatus();

        // 1. Trạng thái DB đã chuyển sang LIVE & lưu bên trong transaction
        assertEquals(AuctionStatusEnum.LIVE, session.getStatus());
        InOrder order = inOrder(auctionSessionRepository, transactionTemplate, messagingTemplate, autoBidScheduler);
        order.verify(transactionTemplate).execute(any());
        order.verify(autoBidScheduler).scheduleNextAutoBid(13L);
        order.verify(messagingTemplate).convertAndSend(eq("/topic/auctions"), any(BidMessageVO.class));
        order.verify(messagingTemplate).convertAndSend(eq("/topic/auction/SES-BN-99A99999"), any(BidMessageVO.class));
        order.verify(messagingTemplate).convertAndSend(eq("/topic/room/SES-BN-99A99999"), any(RoomEventVO.class));

        // 2. Payload broadcast mang theo remainingSeconds > 0, nextStep & bidCount
        ArgumentCaptor<BidMessageVO> bidCap = ArgumentCaptor.forClass(BidMessageVO.class);
        verify(messagingTemplate).convertAndSend(eq("/topic/auction/SES-BN-99A99999"), bidCap.capture());
        BidMessageVO sentMsg = bidCap.getValue();
        assertEquals("LIVE", sentMsg.getStatus());
        assertEquals("STATUS_CHANGE", sentMsg.getType());
        assertEquals(0, sentMsg.getBidCount());
        assertEquals(5_000_000L, sentMsg.getNextStep());
        assertNotNull(sentMsg.getRemainingSeconds());
        assertTrue(sentMsg.getRemainingSeconds() > 7000);

        ArgumentCaptor<RoomEventVO> roomCap = ArgumentCaptor.forClass(RoomEventVO.class);
        verify(messagingTemplate).convertAndSend(eq("/topic/room/SES-BN-99A99999"), roomCap.capture());
        RoomEventVO sentEvent = roomCap.getValue();
        assertEquals("START", sentEvent.getEvent());
        assertNotNull(sentEvent.getRemainingSeconds());
        assertTrue(sentEvent.getRemainingSeconds() > 7000);
    }

    @Test
    @DisplayName("Chốt phiên LIVE quá hạn có người thắng phải chuyển sang COMPLETED và gửi email thông báo")
    void testEndSessionSendsWinnerEmail() {
        AuctionSession session = AuctionSession.builder()
                .sessionCode("SES-HN-30K56789")
                .title("Đấu giá biển số xe ô tô 30K-567.89")
                .numberPlateId(10L)
                .startPrice(40_000_000L)
                .currentPrice(110_000_000L)
                .depositAmount(40_000_000L)
                .bidCount(5)
                .userInfoId(1L)
                .startTime(LocalDateTime.now().minusHours(2))
                .endTime(LocalDateTime.now().minusSeconds(10))
                .status(AuctionStatusEnum.LIVE)
                .build();
        session.setId(20L);

        NumberPlate plate = NumberPlate.builder()
                .plateNumber("30K-567.89")
                .build();
        plate.setId(10L);

        BidHistory winningBid = BidHistory.builder()
                .auctionSessionId(20L)
                .userID(1L)
                .bidAmount(110_000_000L)
                .build();

        when(auctionSessionRepository.findByStatusAndEndTimeBefore(eq(AuctionStatusEnum.LIVE), any()))
                .thenReturn(List.of(session));
        when(auctionSessionRepository.findByStatusAndEndTimeBefore(eq(AuctionStatusEnum.SOON), any()))
                .thenReturn(Collections.emptyList());
        when(auctionSessionRepository.findByStatusAndStartTimeBeforeAndEndTimeAfter(eq(AuctionStatusEnum.SOON), any(), any()))
                .thenReturn(Collections.emptyList());
        when(auctionSessionRepository.findByStatus(AuctionStatusEnum.SOON)).thenReturn(Collections.emptyList());
        when(auctionSessionRepository.findByStatus(AuctionStatusEnum.LIVE)).thenReturn(Collections.emptyList());

        when(auctionSessionRepository.findById(20L)).thenReturn(Optional.of(session));
        when(numberPlateRepository.findById(10L)).thenReturn(Optional.of(plate));
        when(bidHistoryRepository.findByAuctionSessionIdOrderByBidTimeDesc(20L)).thenReturn(List.of(winningBid));
        when(auctionWatchRepository.findBySessionId(20L)).thenReturn(Collections.emptyList());

        doAnswer(inv -> {
            TransactionCallback<?> cb = inv.getArgument(0);
            return cb.doInTransaction(txStatus);
        }).when(transactionTemplate).execute(any());

        doAnswer(inv -> {
            Consumer<TransactionStatus> c = inv.getArgument(0);
            c.accept(txStatus);
            return null;
        }).when(transactionTemplate).executeWithoutResult(any());

        backgroundService.checkAndProcessAuctionStatus();

        assertEquals(AuctionStatusEnum.COMPLETED, session.getStatus());
        assertEquals(110_000_000L, session.getEndPrice());
        assertEquals(110_000_000L, session.getWinningPrice());

        // Kiểm tra gọi walletService và autoBidScheduler
        verify(walletService).handleSessionEnded(20L);
        verify(autoBidScheduler).cancelSessionTasks(20L);

        // Kiểm tra gửi email chúc mừng người thắng cuộc
        verify(auctionMailService).sendWinnerNoticeAsync(
                eq("SES-HN-30K56789"),
                eq("30K-567.89"),
                eq(110_000_000L),
                eq(40_000_000L),
                eq(1L)
        );
    }

    @Test
    @DisplayName("Chốt phiên không có người thắng phải giữ END và không gửi email trúng đấu giá")
    void testEndSessionWithoutWinnerKeepsEndStatus() {
        AuctionSession session = AuctionSession.builder()
                .sessionCode("SES-HN-30K68686")
                .title("Đấu giá biển số xe ô tô 30K-686.86")
                .numberPlateId(11L)
                .startPrice(40_000_000L)
                .currentPrice(40_000_000L)
                .depositAmount(40_000_000L)
                .bidCount(0)
                .startTime(LocalDateTime.now().minusHours(2))
                .endTime(LocalDateTime.now().minusSeconds(10))
                .status(AuctionStatusEnum.LIVE)
                .build();
        session.setId(21L);

        NumberPlate plate = NumberPlate.builder()
                .plateNumber("30K-686.86")
                .build();
        plate.setId(11L);

        when(auctionSessionRepository.findByStatusAndEndTimeBefore(eq(AuctionStatusEnum.LIVE), any()))
                .thenReturn(List.of(session));
        when(auctionSessionRepository.findByStatusAndEndTimeBefore(eq(AuctionStatusEnum.SOON), any()))
                .thenReturn(Collections.emptyList());
        when(auctionSessionRepository.findByStatusAndStartTimeBeforeAndEndTimeAfter(eq(AuctionStatusEnum.SOON), any(), any()))
                .thenReturn(Collections.emptyList());
        when(auctionSessionRepository.findById(21L)).thenReturn(Optional.of(session));
        when(numberPlateRepository.findById(11L)).thenReturn(Optional.of(plate));
        when(bidHistoryRepository.findByAuctionSessionIdOrderByBidTimeDesc(21L)).thenReturn(Collections.emptyList());
        when(auctionWatchRepository.findBySessionId(21L)).thenReturn(Collections.emptyList());

        doAnswer(inv -> {
            TransactionCallback<?> cb = inv.getArgument(0);
            return cb.doInTransaction(txStatus);
        }).when(transactionTemplate).execute(any());

        backgroundService.checkAndProcessAuctionStatus();

        assertEquals(AuctionStatusEnum.END, session.getStatus());
        assertNull(session.getUserInfoId());
        assertNull(session.getWinningPrice());
        verify(walletService).handleSessionEnded(21L);
        verify(autoBidScheduler).cancelSessionTasks(21L);
        verify(auctionMailService, never()).sendWinnerNoticeAsync(any(), any(), anyLong(), anyLong(), anyLong());

        ArgumentCaptor<BidMessageVO> statusCaptor = ArgumentCaptor.forClass(BidMessageVO.class);
        verify(messagingTemplate).convertAndSend(eq("/topic/auction/SES-HN-30K68686"), statusCaptor.capture());
        assertEquals("END", statusCaptor.getValue().getStatus());
    }
}
