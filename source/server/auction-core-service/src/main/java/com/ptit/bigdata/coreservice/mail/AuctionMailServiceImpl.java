package com.ptit.bigdata.coreservice.mail;

import com.ptit.bigdata.coreservice.core.auth.entity.User;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.entity.UserInfo;
import com.ptit.bigdata.coreservice.repository.UserInfoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
@Service
public class AuctionMailServiceImpl implements AuctionMailService {

    @FunctionalInterface
    public interface SmtpSender {
        void send(MailMessage message) throws IOException;
    }

    private static final Pattern EMAIL_PATTERN = Pattern.compile("[^\\s@<>]+@[^\\s@<>]+\\.[^\\s@<>]+");

    private final MailConfig mailConfig;
    private final UserRepository userRepository;
    private final UserInfoRepository userInfoRepository;
    private final SmtpSender smtpSender;

    private final ExecutorService mailExecutor = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "auction-mail-sender");
        t.setDaemon(true);
        return t;
    });

    @Autowired
    public AuctionMailServiceImpl(MailConfig mailConfig, UserRepository userRepository, UserInfoRepository userInfoRepository) {
        this(mailConfig, userRepository, userInfoRepository, msg -> new SmtpMailClient(mailConfig).send(msg));
    }

    public AuctionMailServiceImpl(MailConfig mailConfig, UserRepository userRepository, UserInfoRepository userInfoRepository, SmtpSender smtpSender) {
        this.mailConfig = mailConfig;
        this.userRepository = userRepository;
        this.userInfoRepository = userInfoRepository;
        this.smtpSender = smtpSender;
    }

    @Override
    public CompletableFuture<Void> sendWinnerNoticeAsync(
            String roomCode,
            String plateNumber,
            long finalPrice,
            long deposit,
            Long winnerUserId
    ) {
        if (!mailConfig.isEnabled()) {
            log.info("[AUCTION-MAIL] Tính năng gửi mail đang tắt (mail.smtp.enabled = false). Bỏ qua gửi email.");
            return CompletableFuture.completedFuture(null);
        }

        if (winnerUserId == null) {
            log.warn("[AUCTION-MAIL] Không có winnerUserId cho phiên {}. Bỏ qua gửi email.", roomCode);
            return CompletableFuture.completedFuture(null);
        }

        return CompletableFuture.runAsync(() -> {
            try {
                String toEmail = null;
                String fullName = null;

                // 1. Tìm qua User -> UserInfo (theo username)
                Optional<User> userOpt = userRepository.findById(winnerUserId);
                if (userOpt.isPresent()) {
                    Optional<UserInfo> infoOpt = userInfoRepository.findByUserName(userOpt.get().getUsername());
                    if (infoOpt.isPresent()) {
                        toEmail = infoOpt.get().getEmail();
                        fullName = infoOpt.get().getFullName();
                    }
                }

                // 2. Fallback tìm trực tiếp UserInfo theo ID
                if (toEmail == null || toEmail.isBlank()) {
                    Optional<UserInfo> directOpt = userInfoRepository.findById(winnerUserId);
                    if (directOpt.isPresent()) {
                        toEmail = directOpt.get().getEmail();
                        fullName = directOpt.get().getFullName();
                    }
                }

                if (toEmail == null || toEmail.isBlank()) {
                    log.warn("[AUCTION-MAIL] Không tìm thấy email của người thắng cuộc (UserId: {}) cho phiên {}. Bỏ qua gửi email.",
                            winnerUserId, roomCode);
                    return;
                }

                String cleanEmail = toEmail.trim();
                if (!EMAIL_PATTERN.matcher(cleanEmail).matches()) {
                    log.warn("[AUCTION-MAIL] Email của người thắng cuộc không hợp lệ ('{}') cho phiên {}. Bỏ qua gửi email.",
                            cleanEmail, roomCode);
                    return;
                }

                log.info("[AUCTION-MAIL] Bắt đầu gửi email trúng đấu giá tới {} ({}) cho phiên {}",
                        cleanEmail, fullName, roomCode);

                MailMessage message = MailTemplates.winnerNotice(
                        cleanEmail,
                        fullName,
                        roomCode,
                        plateNumber,
                        finalPrice,
                        deposit
                );

                smtpSender.send(message);

                log.info("[AUCTION-MAIL] ✅ Đã gửi thành công email xác nhận trúng đấu giá tới {} cho phiên {}",
                        toEmail, roomCode);
            } catch (Exception e) {
                log.error("[AUCTION-MAIL] ❌ Lỗi khi gửi email trúng đấu giá phiên {} (winnerUserId: {}): {}",
                        roomCode, winnerUserId, e.getMessage(), e);
            }
        }, mailExecutor);
    }
}
