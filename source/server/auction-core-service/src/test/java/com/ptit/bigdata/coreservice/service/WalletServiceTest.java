package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.configuration.AuctionProperties;
import com.ptit.bigdata.coreservice.core.auth.entity.User;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.entity.AuctionRegistration;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.Wallet;
import com.ptit.bigdata.coreservice.entity.WalletTransaction;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import com.ptit.bigdata.coreservice.enumration.RegistrationStatusEnum;
import com.ptit.bigdata.coreservice.enumration.RoomRoleEnum;
import com.ptit.bigdata.coreservice.enumration.WalletTxTypeEnum;
import com.ptit.bigdata.coreservice.model.vo.RegistrationDetailVO;
import com.ptit.bigdata.coreservice.model.vo.WalletVO;
import com.ptit.bigdata.coreservice.repository.AuctionRegistrationRepository;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.WalletRepository;
import com.ptit.bigdata.coreservice.repository.WalletTransactionRepository;
import com.ptit.bigdata.coreservice.service.implement.WalletServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;
    @Mock
    private WalletTransactionRepository walletTransactionRepository;
    @Mock
    private AuctionRegistrationRepository auctionRegistrationRepository;
    @Mock
    private AuctionSessionRepository auctionSessionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RoomRoleResolver roomRoleResolver;
    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private AuctionProperties auctionProperties;
    private WalletServiceImpl walletService;

    @BeforeEach
    void setUp() {
        auctionProperties = new AuctionProperties();
        walletService = new WalletServiceImpl(
                walletRepository,
                walletTransactionRepository,
                auctionRegistrationRepository,
                auctionSessionRepository,
                userRepository,
                roomRoleResolver,
                auctionProperties,
                messagingTemplate
        );
    }

    @Test
    @DisplayName("Lấy ví lần đầu -> Tự động khởi tạo ví với 1 tỷ và ghi INIT_BONUS")
    void testGetWalletFirstTime() {
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(walletRepository.save(any(Wallet.class))).thenAnswer(inv -> {
            Wallet w = inv.getArgument(0);
            w.setId(10L);
            return w;
        });

        WalletVO vo = walletService.getWallet(1L);
        assertNotNull(vo);
        assertEquals(1_000_000_000L, vo.getBalance());
        assertEquals(0L, vo.getHeldAmount());
        assertEquals(1_000_000_000L, vo.getAvailable());
        verify(walletTransactionRepository).save(any());
    }

    @Test
    @DisplayName("Nạp tiền âm hoặc vượt hạn mức 500tr -> TOPUP_INVALID_AMOUNT")
    void testTopupInvalidAmount() {
        BusinessException exNegative = assertThrows(BusinessException.class, () ->
                walletService.topup(1L, -100_000L));
        assertEquals(ErrorCode.TOPUP_INVALID_AMOUNT, exNegative.getErrorCode());

        BusinessException exOverLimit = assertThrows(BusinessException.class, () ->
                walletService.topup(1L, 600_000_000L));
        assertEquals(ErrorCode.TOPUP_INVALID_AMOUNT, exOverLimit.getErrorCode());
    }

    @Test
    @DisplayName("Nạp tiền ảo hợp lệ -> Cộng số dư và ghi TOPUP")
    void testTopupSuccess() {
        Wallet existing = Wallet.builder()
                .userId(1L)
                .balance(100_000_000L)
                .heldAmount(0L)
                .build();
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(existing));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(inv -> inv.getArgument(0));

        WalletVO vo = walletService.topup(1L, 50_000_000L);
        assertEquals(150_000_000L, vo.getBalance());
        assertEquals(150_000_000L, vo.getAvailable());
        verify(walletTransactionRepository).save(any());
    }

    @Test
    @DisplayName("Đăng ký đấu giá khi số dư khả dụng không đủ cọc -> WALLET_INSUFFICIENT")
    void testRegisterInsufficientBalance() {
        AuctionSession session = AuctionSession.builder()
                .sessionCode("SES_01")
                .status(AuctionStatusEnum.SOON)
                .depositAmount(40_000_000L)
                .build();
        session.setId(100L);

        Wallet wallet = Wallet.builder()
                .userId(1L)
                .balance(30_000_000L) // Chỉ có 30tr < 40tr cọc
                .heldAmount(0L)
                .build();

        when(auctionSessionRepository.findBySessionCode("SES_01")).thenReturn(Optional.of(session));
        when(auctionRegistrationRepository.findByUserIdAndSessionId(1L, 100L)).thenReturn(Optional.empty());
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(wallet));

        BusinessException ex = assertThrows(BusinessException.class, () ->
                walletService.registerAuction(1L, "SES_01"));
        assertEquals(ErrorCode.WALLET_INSUFFICIENT, ex.getErrorCode());
    }

    @Test
    @DisplayName("Đăng ký đấu giá thành công -> Trừ trực tiếp 40tr từ số dư ví, tăng held 40tr, chuyển role thành BIDDER")
    void testRegisterSuccess() {
        AuctionSession session = AuctionSession.builder()
                .sessionCode("SES_01")
                .status(AuctionStatusEnum.SOON)
                .depositAmount(40_000_000L)
                .participantCount(0L)
                .build();
        session.setId(100L);

        Wallet wallet = Wallet.builder()
                .userId(1L)
                .balance(100_000_000L)
                .heldAmount(0L)
                .build();
        wallet.setId(10L);

        when(auctionSessionRepository.findBySessionCode("SES_01")).thenReturn(Optional.of(session));
        when(auctionRegistrationRepository.findByUserIdAndSessionId(1L, 100L)).thenReturn(Optional.empty());
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(wallet));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(inv -> inv.getArgument(0));

        RegistrationDetailVO vo = walletService.registerAuction(1L, "SES_01");

        assertTrue(vo.isRegistered());
        assertEquals(40_000_000L, vo.getDepositAmount());
        assertEquals(RegistrationStatusEnum.ACTIVE, vo.getStatus());
        assertEquals(RoomRoleEnum.BIDDER, vo.getMyRole());
        assertEquals(60_000_000L, wallet.getBalance());
        assertEquals(40_000_000L, wallet.getHeldAmount());
        assertEquals(60_000_000L, wallet.getAvailable());
        verify(auctionRegistrationRepository).save(any(AuctionRegistration.class));

        ArgumentCaptor<WalletTransaction> txCaptor = ArgumentCaptor.forClass(WalletTransaction.class);
        verify(walletTransactionRepository).save(txCaptor.capture());
        assertEquals(WalletTxTypeEnum.HOLD, txCaptor.getValue().getType());
        assertEquals(40_000_000L, txCaptor.getValue().getAmount());
        assertEquals(60_000_000L, txCaptor.getValue().getBalanceAfter());
        assertEquals(40_000_000L, txCaptor.getValue().getHeldAfter());
    }

    @Test
    @DisplayName("Hủy đăng ký phiên SOON -> Cộng hoàn lại 40tr vào số dư ví và giảm held về 0")
    void testCancelRegistrationRefundsDeposit() {
        AuctionSession session = AuctionSession.builder()
                .sessionCode("SES_01")
                .status(AuctionStatusEnum.SOON)
                .depositAmount(40_000_000L)
                .build();
        session.setId(100L);

        AuctionRegistration reg = AuctionRegistration.builder()
                .userId(1L)
                .sessionId(100L)
                .depositAmount(40_000_000L)
                .status(RegistrationStatusEnum.ACTIVE)
                .build();

        Wallet wallet = Wallet.builder()
                .userId(1L)
                .balance(60_000_000L)
                .heldAmount(40_000_000L)
                .build();
        wallet.setId(10L);

        when(auctionSessionRepository.findBySessionCode("SES_01")).thenReturn(Optional.of(session));
        when(auctionRegistrationRepository.findByUserIdAndSessionIdAndStatus(1L, 100L, RegistrationStatusEnum.ACTIVE))
                .thenReturn(Optional.of(reg));
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(wallet));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(inv -> inv.getArgument(0));

        RegistrationDetailVO vo = walletService.cancelRegistration(1L, "SES_01");

        assertFalse(vo.isRegistered());
        assertEquals(RegistrationStatusEnum.CANCELLED, vo.getStatus());
        assertEquals(100_000_000L, wallet.getBalance());
        assertEquals(0L, wallet.getHeldAmount());
        assertEquals(100_000_000L, wallet.getAvailable());

        ArgumentCaptor<WalletTransaction> txCaptor = ArgumentCaptor.forClass(WalletTransaction.class);
        verify(walletTransactionRepository).save(txCaptor.capture());
        assertEquals(WalletTxTypeEnum.RELEASE, txCaptor.getValue().getType());
        assertEquals(40_000_000L, txCaptor.getValue().getAmount());
        assertEquals(100_000_000L, txCaptor.getValue().getBalanceAfter());
        assertEquals(0L, txCaptor.getValue().getHeldAfter());
    }

    @Test
    @DisplayName("Kết thúc phiên -> Người thắng bị trừ phần chênh lệch (150tr - 40tr = 110tr), người thua được hoàn 40tr cọc")
    void testHandleSessionEndedWinnerAndLoser() {
        AuctionSession session = AuctionSession.builder()
                .sessionCode("SES_END_1")
                .status(AuctionStatusEnum.COMPLETED)
                .startPrice(40_000_000L)
                .currentPrice(150_000_000L)
                .winningPrice(150_000_000L)
                .depositAmount(40_000_000L)
                .userInfoId(1L) // User 1 thắng
                .build();
        session.setId(200L);

        AuctionRegistration winnerReg = AuctionRegistration.builder()
                .userId(1L)
                .sessionId(200L)
                .depositAmount(40_000_000L)
                .status(RegistrationStatusEnum.ACTIVE)
                .build();

        AuctionRegistration loserReg = AuctionRegistration.builder()
                .userId(2L)
                .sessionId(200L)
                .depositAmount(40_000_000L)
                .status(RegistrationStatusEnum.ACTIVE)
                .build();

        // Cả 2 đều bắt đầu 1 tỷ -> đã trừ 40tr lúc cọc -> còn 960tr, held 40tr
        Wallet winnerWallet = Wallet.builder().userId(1L).balance(960_000_000L).heldAmount(40_000_000L).build();
        winnerWallet.setId(11L);
        Wallet loserWallet = Wallet.builder().userId(2L).balance(960_000_000L).heldAmount(40_000_000L).build();
        loserWallet.setId(12L);

        when(auctionSessionRepository.findById(200L)).thenReturn(Optional.of(session));
        when(auctionRegistrationRepository.findBySessionIdAndStatus(200L, RegistrationStatusEnum.ACTIVE))
                .thenReturn(List.of(winnerReg, loserReg));
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(winnerWallet));
        when(walletRepository.findByUserId(2L)).thenReturn(Optional.of(loserWallet));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(inv -> inv.getArgument(0));

        walletService.handleSessionEnded(200L);

        // Người thắng: tổng mất đúng 150tr (40tr lúc cọc + 110tr chênh lệch) -> còn 850tr, held = 0
        assertEquals(850_000_000L, winnerWallet.getBalance());
        assertEquals(0L, winnerWallet.getHeldAmount());
        assertEquals(RegistrationStatusEnum.CAPTURED, winnerReg.getStatus());

        // Người thua: hoàn lại 40tr -> quay về đúng 1 tỷ, held = 0
        assertEquals(1_000_000_000L, loserWallet.getBalance());
        assertEquals(0L, loserWallet.getHeldAmount());
        assertEquals(RegistrationStatusEnum.RELEASED, loserReg.getStatus());

        ArgumentCaptor<WalletTransaction> txCaptor = ArgumentCaptor.forClass(WalletTransaction.class);
        verify(walletTransactionRepository, times(2)).save(txCaptor.capture());
        List<WalletTransaction> txs = txCaptor.getAllValues();

        WalletTransaction winTx = txs.stream().filter(t -> t.getWalletId().equals(11L)).findFirst().orElseThrow();
        assertEquals(WalletTxTypeEnum.AUCTION_PAYMENT, winTx.getType());
        assertEquals(110_000_000L, winTx.getAmount());
        assertEquals(850_000_000L, winTx.getBalanceAfter());
        assertEquals(0L, winTx.getHeldAfter());

        WalletTransaction loseTx = txs.stream().filter(t -> t.getWalletId().equals(12L)).findFirst().orElseThrow();
        assertEquals(WalletTxTypeEnum.RELEASE, loseTx.getType());
        assertEquals(40_000_000L, loseTx.getAmount());
        assertEquals(1_000_000_000L, loseTx.getBalanceAfter());
        assertEquals(0L, loseTx.getHeldAfter());
    }

    @Test
    @DisplayName("Kết thúc phiên trúng đúng giá bằng tiền cọc (40tr) -> Không trừ thêm tiền, giải phóng held về 0")
    void testHandleSessionEndedWinnerAtExactDepositPrice() {
        AuctionSession session = AuctionSession.builder()
                .sessionCode("SES_END_EXACT")
                .status(AuctionStatusEnum.COMPLETED)
                .startPrice(40_000_000L)
                .currentPrice(40_000_000L)
                .winningPrice(40_000_000L)
                .depositAmount(40_000_000L)
                .userInfoId(1L)
                .build();
        session.setId(201L);

        AuctionRegistration winnerReg = AuctionRegistration.builder()
                .userId(1L)
                .sessionId(201L)
                .depositAmount(40_000_000L)
                .status(RegistrationStatusEnum.ACTIVE)
                .build();

        Wallet winnerWallet = Wallet.builder().userId(1L).balance(960_000_000L).heldAmount(40_000_000L).build();
        winnerWallet.setId(11L);

        when(auctionSessionRepository.findById(201L)).thenReturn(Optional.of(session));
        when(auctionRegistrationRepository.findBySessionIdAndStatus(201L, RegistrationStatusEnum.ACTIVE))
                .thenReturn(List.of(winnerReg));
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(winnerWallet));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(inv -> inv.getArgument(0));

        walletService.handleSessionEnded(201L);

        assertEquals(960_000_000L, winnerWallet.getBalance());
        assertEquals(0L, winnerWallet.getHeldAmount());
        assertEquals(RegistrationStatusEnum.CAPTURED, winnerReg.getStatus());

        ArgumentCaptor<WalletTransaction> txCaptor = ArgumentCaptor.forClass(WalletTransaction.class);
        verify(walletTransactionRepository).save(txCaptor.capture());
        assertEquals(WalletTxTypeEnum.CAPTURE, txCaptor.getValue().getType());
        assertEquals(0L, txCaptor.getValue().getAmount());
        assertEquals(960_000_000L, txCaptor.getValue().getBalanceAfter());
    }

    @Test
    @DisplayName("Admin hủy phiên -> Hoàn 100% tiền cọc về số dư ví cho tất cả người đã đăng ký")
    void testHandleSessionCancelledRefundsAll() {
        AuctionSession session = AuctionSession.builder()
                .sessionCode("SES_CANCEL")
                .status(AuctionStatusEnum.END)
                .depositAmount(40_000_000L)
                .build();
        session.setId(202L);

        AuctionRegistration reg1 = AuctionRegistration.builder()
                .userId(1L).sessionId(202L).depositAmount(40_000_000L).status(RegistrationStatusEnum.ACTIVE).build();
        AuctionRegistration reg2 = AuctionRegistration.builder()
                .userId(2L).sessionId(202L).depositAmount(40_000_000L).status(RegistrationStatusEnum.ACTIVE).build();

        Wallet w1 = Wallet.builder().userId(1L).balance(960_000_000L).heldAmount(40_000_000L).build();
        w1.setId(11L);
        Wallet w2 = Wallet.builder().userId(2L).balance(560_000_000L).heldAmount(40_000_000L).build();
        w2.setId(12L);

        when(auctionSessionRepository.findById(202L)).thenReturn(Optional.of(session));
        when(auctionRegistrationRepository.findBySessionIdAndStatus(202L, RegistrationStatusEnum.ACTIVE))
                .thenReturn(List.of(reg1, reg2));
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(w1));
        when(walletRepository.findByUserId(2L)).thenReturn(Optional.of(w2));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(inv -> inv.getArgument(0));

        walletService.handleSessionCancelled(202L);

        assertEquals(1_000_000_000L, w1.getBalance());
        assertEquals(0L, w1.getHeldAmount());
        assertEquals(RegistrationStatusEnum.CANCELLED, reg1.getStatus());

        assertEquals(600_000_000L, w2.getBalance());
        assertEquals(0L, w2.getHeldAmount());
        assertEquals(RegistrationStatusEnum.CANCELLED, reg2.getStatus());
    }
}

