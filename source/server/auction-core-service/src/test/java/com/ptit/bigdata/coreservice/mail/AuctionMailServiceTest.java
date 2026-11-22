package com.ptit.bigdata.coreservice.mail;

import com.ptit.bigdata.coreservice.core.auth.entity.User;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.entity.UserInfo;
import com.ptit.bigdata.coreservice.repository.UserInfoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuctionMailServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserInfoRepository userInfoRepository;

    @Mock
    private AuctionMailServiceImpl.SmtpSender smtpSender;

    private MailConfig mailConfig;
    private AuctionMailServiceImpl mailService;

    @BeforeEach
    void setUp() {
        mailConfig = MailConfig.builder()
                .host("sandbox.smtp.mailtrap.io")
                .port(587)
                .username("391cd90ed6b503")
                .password("b7ba1e7a48b484")
                .from("no-reply@auction.local")
                .fromName("Sàn đấu giá")
                .enabled(true)
                .build();

        mailService = new AuctionMailServiceImpl(mailConfig, userRepository, userInfoRepository, smtpSender);
    }

    @Test
    @DisplayName("Format tiền và nội dung MailTemplates.winnerNotice đúng chuẩn")
    void testMailTemplatesWinnerNotice() {
        MailMessage msg = MailTemplates.winnerNotice(
                "winner@example.com",
                "Nam Trần",
                "SES-HN-30K56789",
                "30K-567.89",
                110_000_000L,
                40_000_000L
        );

        assertEquals("winner@example.com", msg.to());
        assertTrue(msg.subject().contains("30K-567.89"));
        assertTrue(msg.body().contains("Nam Trần"));
        assertTrue(msg.body().contains("110.000.000 VNĐ"));
        assertTrue(msg.body().contains("40.000.000 VNĐ"));
        assertTrue(msg.body().contains("70.000.000 VNĐ")); // 110M - 40M = 70M
    }

    @Test
    @DisplayName("Bỏ qua gửi mail khi config mail.smtp.enabled = false")
    void testSendSkippedWhenDisabled() {
        mailConfig.setEnabled(false);

        CompletableFuture<Void> future = mailService.sendWinnerNoticeAsync(
                "SES-HN-30K56789",
                "30K-567.89",
                110_000_000L,
                40_000_000L,
                1L
        );

        assertNotNull(future);
        assertTrue(future.isDone());
        verifyNoInteractions(userRepository, userInfoRepository, smtpSender);
    }

    @Test
    @DisplayName("Bỏ qua gửi mail khi winnerUserId null")
    void testSendSkippedWhenWinnerUserIdNull() {
        CompletableFuture<Void> future = mailService.sendWinnerNoticeAsync(
                "SES-HN-30K56789",
                "30K-567.89",
                110_000_000L,
                40_000_000L,
                null
        );

        assertNotNull(future);
        assertTrue(future.isDone());
        verifyNoInteractions(userRepository, userInfoRepository, smtpSender);
    }

    @Test
    @DisplayName("Tra cứu thành công User -> UserInfo và gửi mail qua SmtpSender")
    void testSendFindsEmailViaUserAndUserInfo() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setUserName("namtran");

        UserInfo userInfo = new UserInfo();
        userInfo.setUserName("namtran");
        userInfo.setEmail("namtran@ptit.edu.vn");
        userInfo.setFullName("Nam Trần");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userInfoRepository.findByUserName("namtran")).thenReturn(Optional.of(userInfo));

        CompletableFuture<Void> future = mailService.sendWinnerNoticeAsync(
                "SES-HN-30K56789",
                "30K-567.89",
                110_000_000L,
                40_000_000L,
                1L
        );
        future.get();

        ArgumentCaptor<MailMessage> captor = ArgumentCaptor.forClass(MailMessage.class);
        verify(smtpSender).send(captor.capture());
        MailMessage sent = captor.getValue();
        assertEquals("namtran@ptit.edu.vn", sent.to());
        assertTrue(sent.subject().contains("30K-567.89"));
        assertTrue(sent.body().contains("Nam Trần"));
        assertTrue(sent.body().contains("110.000.000 VNĐ"));
    }

    @Test
    @DisplayName("Fallback tra cứu UserInfo theo ID khi không tìm thấy User")
    void testFallbackToUserInfoById() throws Exception {
        UserInfo userInfo = new UserInfo();
        userInfo.setEmail("fallback@example.com");
        userInfo.setFullName("Nguyễn Văn A");

        when(userRepository.findById(2L)).thenReturn(Optional.empty());
        when(userInfoRepository.findById(2L)).thenReturn(Optional.of(userInfo));

        CompletableFuture<Void> future = mailService.sendWinnerNoticeAsync(
                "SES-HN-30K56789",
                "30K-567.89",
                110_000_000L,
                40_000_000L,
                2L
        );
        future.get();

        ArgumentCaptor<MailMessage> captor = ArgumentCaptor.forClass(MailMessage.class);
        verify(smtpSender).send(captor.capture());
        MailMessage sent = captor.getValue();
        assertEquals("fallback@example.com", sent.to());
        assertTrue(sent.body().contains("Nguyễn Văn A"));
    }
}
