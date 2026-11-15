package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.configuration.AuctionProperties;
import com.ptit.bigdata.coreservice.core.auth.entity.User;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.core.util.BusinessException;
import com.ptit.bigdata.coreservice.entity.AuctionRegistration;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.entity.Wallet;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import com.ptit.bigdata.coreservice.enumration.RegistrationStatusEnum;
import com.ptit.bigdata.coreservice.enumration.RoomRoleEnum;
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
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
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
    @DisplayName("Đăng ký đấu giá thành công -> Giữ 40tr cọc, chuyển role thành BIDDER")
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

        when(auctionSessionRepository.findBySessionCode("SES_01")).thenReturn(Optional.of(session));
        when(auctionRegistrationRepository.findByUserIdAndSessionId(1L, 100L)).thenReturn(Optional.empty());
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(wallet));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(inv -> inv.getArgument(0));

        RegistrationDetailVO vo = walletService.registerAuction(1L, "SES_01");

        assertTrue(vo.isRegistered());
        assertEquals(40_000_000L, vo.getDepositAmount());
        assertEquals(RegistrationStatusEnum.ACTIVE, vo.getStatus());
        assertEquals(RoomRoleEnum.BIDDER, vo.getMyRole());
        assertEquals(40_000_000L, wallet.getHeldAmount());
        assertEquals(60_000_000L, wallet.getAvailable());
        verify(auctionRegistrationRepository).save(any(AuctionRegistration.class));
    }
}

