package com.ptit.bigdata.coreservice.service.implement;

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
import com.ptit.bigdata.coreservice.model.vo.WalletTransactionVO;
import com.ptit.bigdata.coreservice.model.vo.WalletVO;
import com.ptit.bigdata.coreservice.repository.AuctionRegistrationRepository;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.repository.WalletRepository;
import com.ptit.bigdata.coreservice.repository.WalletTransactionRepository;
import com.ptit.bigdata.coreservice.service.RoomRoleResolver;
import com.ptit.bigdata.coreservice.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final AuctionRegistrationRepository auctionRegistrationRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final UserRepository userRepository;
    private final RoomRoleResolver roomRoleResolver;
    private final AuctionProperties auctionProperties;
    private final SimpMessagingTemplate messagingTemplate;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.ptit.bigdata.coreservice.repository.AutoBidConfigRepository autoBidConfigRepository;

    @Override
    @Transactional
    public WalletVO getWallet(Long userId) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        Wallet wallet = getOrCreateWallet(userId);
        return mapToWalletVO(wallet);
    }

    @Override
    @Transactional
    public WalletVO topup(Long userId, Long amount) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        long maxTopup = auctionProperties.getWallet() != null && auctionProperties.getWallet().getMaxTopup() != null
                ? auctionProperties.getWallet().getMaxTopup()
                : 500_000_000L;

        if (amount == null || amount <= 0 || amount > maxTopup) {
            throw new BusinessException(ErrorCode.TOPUP_INVALID_AMOUNT);
        }

        Wallet wallet = getOrCreateWallet(userId);
        long newBalance = wallet.getBalance() + amount;
        wallet.setBalance(newBalance);
        wallet = walletRepository.save(wallet);

        recordTx(wallet.getId(), WalletTxTypeEnum.TOPUP, amount, newBalance, wallet.getHeldAmount(), null, "Nạp tiền ảo vào ví");

        log.info("[WALLET-TOPUP] User {}: Nạp {} VNĐ thành công, số dư mới: {}", userId, amount, newBalance);
        return mapToWalletVO(wallet);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WalletTransactionVO> getTransactions(Long userId, WalletTxTypeEnum type, Pageable pageable) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        Optional<Wallet> walletOpt = walletRepository.findByUserId(userId);
        if (walletOpt.isEmpty()) {
            return Page.empty(pageable);
        }
        Long walletId = walletOpt.get().getId();
        Page<WalletTransaction> page = (type != null)
                ? walletTransactionRepository.findByWalletIdAndTypeOrderByCreatedAtDesc(walletId, type, pageable)
                : walletTransactionRepository.findByWalletIdOrderByCreatedAtDesc(walletId, pageable);

        return page.map(tx -> WalletTransactionVO.builder()
                .id(tx.getId())
                .type(tx.getType())
                .amount(tx.getAmount())
                .balanceAfter(tx.getBalanceAfter())
                .heldAfter(tx.getHeldAfter())
                .sessionCode(tx.getSessionCode())
                .note(tx.getNote())
                .createdAt(tx.getCreatedAt())
                .build());
    }

    @Override
    @Transactional
    public RegistrationDetailVO registerAuction(Long userId, String sessionCode) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        AuctionSession session = auctionSessionRepository.findBySessionCode(sessionCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        if (session.getStatus() != AuctionStatusEnum.SOON && session.getStatus() != AuctionStatusEnum.LIVE) {
            throw new BusinessException(ErrorCode.REGISTRATION_CLOSED);
        }

        // Kiểm tra đã đăng ký chưa
        Optional<AuctionRegistration> existingOpt = auctionRegistrationRepository.findByUserIdAndSessionId(userId, session.getId());
        if (existingOpt.isPresent() && existingOpt.get().getStatus() == RegistrationStatusEnum.ACTIVE) {
            throw new BusinessException(ErrorCode.ALREADY_REGISTERED);
        }

        long deposit = session.getDepositAmount() != null ? session.getDepositAmount() : 40_000_000L;

        Wallet wallet = getOrCreateWallet(userId);
        if (wallet.getAvailable() < deposit) {
            throw new BusinessException(ErrorCode.WALLET_INSUFFICIENT);
        }

        // Giữ tiền cọc
        long newHeld = wallet.getHeldAmount() + deposit;
        wallet.setHeldAmount(newHeld);
        wallet = walletRepository.save(wallet);

        recordTx(wallet.getId(), WalletTxTypeEnum.HOLD, deposit, wallet.getBalance(), newHeld,
                sessionCode, "Đặt cọc tham gia phiên đấu giá " + sessionCode);

        // Lưu bản ghi đăng ký
        AuctionRegistration reg = existingOpt.orElse(AuctionRegistration.builder()
                .userId(userId)
                .sessionId(session.getId())
                .build());
        reg.setDepositAmount(deposit);
        reg.setStatus(RegistrationStatusEnum.ACTIVE);
        reg.setCreatedAt(LocalDateTime.now());
        auctionRegistrationRepository.save(reg);

        // Tăng participant count của phiên
        session.setParticipantCount((session.getParticipantCount() != null ? session.getParticipantCount() : 0L) + 1);
        auctionSessionRepository.save(session);

        // Xóa cache role và thông báo đổi role cho FE
        roomRoleResolver.evictCache(userId, session.getId());
        notifyRoleChanged(userId, sessionCode, RoomRoleEnum.BIDDER, RegistrationStatusEnum.ACTIVE);

        log.info("[AUCTION-REG] User {} đăng ký tham gia phiên {} thành công (Cọc: {})", userId, sessionCode, deposit);

        return RegistrationDetailVO.builder()
                .registered(true)
                .depositAmount(deposit)
                .status(RegistrationStatusEnum.ACTIVE)
                .myRole(RoomRoleEnum.BIDDER)
                .build();
    }

    @Override
    @Transactional
    public RegistrationDetailVO cancelRegistration(Long userId, String sessionCode) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        AuctionSession session = auctionSessionRepository.findBySessionCode(sessionCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        if (session.getStatus() != AuctionStatusEnum.SOON) {
            throw new BusinessException(ErrorCode.REGISTRATION_CLOSED);
        }

        AuctionRegistration reg = auctionRegistrationRepository.findByUserIdAndSessionIdAndStatus(
                userId, session.getId(), RegistrationStatusEnum.ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_REGISTERED));

        long deposit = reg.getDepositAmount() != null ? reg.getDepositAmount() : 40_000_000L;
        Wallet wallet = getOrCreateWallet(userId);
        long newHeld = Math.max(0L, wallet.getHeldAmount() - deposit);
        wallet.setHeldAmount(newHeld);
        walletRepository.save(wallet);

        recordTx(wallet.getId(), WalletTxTypeEnum.RELEASE, deposit, wallet.getBalance(), newHeld,
                sessionCode, "Hoàn cọc do hủy đăng ký phiên " + sessionCode);

        reg.setStatus(RegistrationStatusEnum.CANCELLED);
        auctionRegistrationRepository.save(reg);

        // Tắt auto-bid nếu có
        if (autoBidConfigRepository != null) {
            autoBidConfigRepository.findByUserIdAndSessionId(userId, session.getId()).ifPresent(cfg -> {
                if (Boolean.TRUE.equals(cfg.getActive())) {
                    cfg.setActive(false);
                    cfg.setStoppedReason(com.ptit.bigdata.coreservice.enumration.AutoBidStopReasonEnum.NOT_REGISTERED);
                    cfg.setUpdatedAt(LocalDateTime.now());
                    autoBidConfigRepository.save(cfg);
                }
            });
        }

        // Giảm participant count
        session.setParticipantCount(Math.max(0L, (session.getParticipantCount() != null ? session.getParticipantCount() : 1L) - 1));
        auctionSessionRepository.save(session);

        roomRoleResolver.evictCache(userId, session.getId());
        notifyRoleChanged(userId, sessionCode, RoomRoleEnum.VIEWER, RegistrationStatusEnum.CANCELLED);

        log.info("[AUCTION-CANCEL-REG] User {} hủy đăng ký phiên {}, hoàn cọc {}", userId, sessionCode, deposit);

        return RegistrationDetailVO.builder()
                .registered(false)
                .depositAmount(deposit)
                .status(RegistrationStatusEnum.CANCELLED)
                .myRole(RoomRoleEnum.VIEWER)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public RegistrationDetailVO getRegistration(Long userId, String sessionCode) {
        AuctionSession session = auctionSessionRepository.findBySessionCode(sessionCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        RoomRoleEnum role = roomRoleResolver.resolve(userId, session.getId());
        long deposit = session.getDepositAmount() != null ? session.getDepositAmount() : 40_000_000L;

        if (userId == null) {
            return RegistrationDetailVO.builder()
                    .registered(false)
                    .depositAmount(deposit)
                    .status(null)
                    .myRole(RoomRoleEnum.VIEWER)
                    .build();
        }

        Optional<AuctionRegistration> regOpt = auctionRegistrationRepository.findByUserIdAndSessionId(userId, session.getId());
        boolean isRegistered = regOpt.isPresent() && regOpt.get().getStatus() == RegistrationStatusEnum.ACTIVE;

        return RegistrationDetailVO.builder()
                .registered(isRegistered)
                .depositAmount(regOpt.map(AuctionRegistration::getDepositAmount).orElse(deposit))
                .status(regOpt.map(AuctionRegistration::getStatus).orElse(null))
                .myRole(role)
                .build();
    }

    @Override
    @Transactional
    public void handleSessionEnded(Long sessionId) {
        AuctionSession session = auctionSessionRepository.findById(sessionId).orElse(null);
        if (session == null) return;

        Long winnerUserId = session.getUserInfoId();
        List<AuctionRegistration> activeRegs = auctionRegistrationRepository.findBySessionIdAndStatus(sessionId, RegistrationStatusEnum.ACTIVE);

        log.info("[SESSION-END-WALLET] Xử lý cọc cho phiên {} (Người thắng: {}, Số người cọc: {})",
                session.getSessionCode(), winnerUserId, activeRegs.size());

        for (AuctionRegistration reg : activeRegs) {
            try {
                Wallet w = getOrCreateWallet(reg.getUserId());
                long dep = reg.getDepositAmount() != null ? reg.getDepositAmount() : 40_000_000L;

                if (winnerUserId != null && winnerUserId.equals(reg.getUserId())) {
                    // CAPTURE cọc người thắng
                    long newBal = Math.max(0L, w.getBalance() - dep);
                    long newHeld = Math.max(0L, w.getHeldAmount() - dep);
                    w.setBalance(newBal);
                    w.setHeldAmount(newHeld);
                    walletRepository.save(w);

                    recordTx(w.getId(), WalletTxTypeEnum.CAPTURE, dep, newBal, newHeld, session.getSessionCode(),
                            "Khấu trừ cọc trúng đấu giá phiên " + session.getSessionCode());
                    reg.setStatus(RegistrationStatusEnum.CAPTURED);
                    auctionRegistrationRepository.save(reg);
                    log.info("[CAPTURE-DEPOSIT] Đã khấu trừ {} cọc của người thắng {}", dep, reg.getUserId());
                } else {
                    // RELEASE cọc người không thắng
                    long newHeld = Math.max(0L, w.getHeldAmount() - dep);
                    w.setHeldAmount(newHeld);
                    walletRepository.save(w);

                    recordTx(w.getId(), WalletTxTypeEnum.RELEASE, dep, w.getBalance(), newHeld, session.getSessionCode(),
                            "Hoàn cọc không trúng đấu giá phiên " + session.getSessionCode());
                    reg.setStatus(RegistrationStatusEnum.RELEASED);
                    auctionRegistrationRepository.save(reg);
                    log.info("[RELEASE-DEPOSIT] Đã hoàn {} cọc cho người dùng {}", dep, reg.getUserId());
                }
            } catch (Exception e) {
                log.error("[SESSION-END-WALLET-ERR] Lỗi khi xử lý cọc cho user {}: ", reg.getUserId(), e);
            }
        }
    }

    @Override
    @Transactional
    public void handleSessionCancelled(Long sessionId) {
        AuctionSession session = auctionSessionRepository.findById(sessionId).orElse(null);
        if (session == null) return;

        List<AuctionRegistration> activeRegs = auctionRegistrationRepository.findBySessionIdAndStatus(sessionId, RegistrationStatusEnum.ACTIVE);
        log.info("[SESSION-CANCEL-WALLET] Hoàn 100% cọc phiên {} cho {} người đăng ký", session.getSessionCode(), activeRegs.size());

        for (AuctionRegistration reg : activeRegs) {
            try {
                Wallet w = getOrCreateWallet(reg.getUserId());
                long dep = reg.getDepositAmount() != null ? reg.getDepositAmount() : 40_000_000L;
                long newHeld = Math.max(0L, w.getHeldAmount() - dep);
                w.setHeldAmount(newHeld);
                walletRepository.save(w);

                recordTx(w.getId(), WalletTxTypeEnum.RELEASE, dep, w.getBalance(), newHeld, session.getSessionCode(),
                        "Hoàn 100% cọc do admin hủy phiên " + session.getSessionCode());
                reg.setStatus(RegistrationStatusEnum.CANCELLED);
                auctionRegistrationRepository.save(reg);
            } catch (Exception e) {
                log.error("[SESSION-CANCEL-WALLET-ERR] Lỗi khi hoàn cọc cho user {}: ", reg.getUserId(), e);
            }
        }
    }

    private Wallet getOrCreateWallet(Long userId) {
        return walletRepository.findByUserId(userId).orElseGet(() -> {
            long initBal = auctionProperties.getWallet() != null && auctionProperties.getWallet().getInitialBalance() != null
                    ? auctionProperties.getWallet().getInitialBalance()
                    : 1_000_000_000L;

            Wallet newWallet = Wallet.builder()
                    .userId(userId)
                    .balance(initBal)
                    .heldAmount(0L)
                    .updatedAt(LocalDateTime.now())
                    .build();
            newWallet = walletRepository.save(newWallet);

            recordTx(newWallet.getId(), WalletTxTypeEnum.INIT_BONUS, initBal, initBal, 0L, null, "Tặng số dư khởi tạo ví ảo");
            log.info("[WALLET-INIT] Khởi tạo ví ảo cho user {}: {} VNĐ", userId, initBal);
            return newWallet;
        });
    }

    private void recordTx(Long walletId, WalletTxTypeEnum type, Long amount, Long balanceAfter, Long heldAfter, String sessionCode, String note) {
        WalletTransaction tx = WalletTransaction.builder()
                .walletId(walletId)
                .type(type)
                .amount(amount)
                .balanceAfter(balanceAfter)
                .heldAfter(heldAfter)
                .sessionCode(sessionCode)
                .note(note)
                .createdAt(LocalDateTime.now())
                .build();
        walletTransactionRepository.save(tx);
    }

    private WalletVO mapToWalletVO(Wallet wallet) {
        return WalletVO.builder()
                .balance(wallet.getBalance())
                .heldAmount(wallet.getHeldAmount())
                .available(wallet.getAvailable())
                .build();
    }

    private void notifyRoleChanged(Long userId, String sessionCode, RoomRoleEnum role, RegistrationStatusEnum status) {
        try {
            userRepository.findById(userId).ifPresent(user -> {
                messagingTemplate.convertAndSendToUser(
                        user.getUsername(),
                        "/queue/room-role",
                        Map.of(
                                "sessionCode", sessionCode,
                                "role", role.name(),
                                "status", status.name()
                        )
                );
            });
        } catch (Exception e) {
            log.warn("[ROLE-NOTIFY-FAIL] Không thể gửi thông báo đổi role cho user {}: {}", userId, e.getMessage());
        }
    }
}

