package com.ptit.bigdata.coreservice.mail;

import com.ptit.bigdata.coreservice.configuration.AuctionProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Service gửi email bất đồng bộ trên luồng nền riêng cho core-service.
 */
@Slf4j
@Service
public class MailService {

    private final AuctionProperties auctionProperties;

    private final ExecutorService executor = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "core-mail-sender");
        t.setDaemon(true);
        return t;
    });

    public MailService(AuctionProperties auctionProperties) {
        this.auctionProperties = auctionProperties;
    }

    /**
     * Gửi email bất đồng bộ. Không làm gián đoạn luồng xử lý chính.
     */
    public CompletableFuture<Void> send(MailMessage message) {
        return CompletableFuture.runAsync(() -> {
            try {
                AuctionProperties.MailConfigProps mailProps = auctionProperties.getMail();
                if (mailProps != null && !mailProps.isEnabled()) {
                    log.info("[MAIL-DISABLED] Tính năng gửi mail đang tạm tắt. Bỏ qua gửi tới: {}", message.to());
                    return;
                }

                String host = (mailProps != null && isNotBlank(mailProps.getHost())) ? mailProps.getHost() : "sandbox.smtp.mailtrap.io";
                int port = (mailProps != null && mailProps.getPort() > 0) ? mailProps.getPort() : 587;
                String from = (mailProps != null && isNotBlank(mailProps.getFrom())) ? mailProps.getFrom() : "no-reply@auction.local";
                String fromName = (mailProps != null && isNotBlank(mailProps.getFromName())) ? mailProps.getFromName() : "Sàn đấu giá biển số PTIT";

                String username = (mailProps != null && isNotBlank(mailProps.getUsername())) ? mailProps.getUsername() : System.getenv("MAIL_USER");
                String password = (mailProps != null && isNotBlank(mailProps.getPassword())) ? mailProps.getPassword() : System.getenv("MAIL_PASS");

                if (!isNotBlank(username) || !isNotBlank(password)) {
                    log.info("[MAIL-DEV-PREVIEW] Chưa cấu hình credentials SMTP (MAIL_USER/MAIL_PASS). Email mẫu được ghi nhận tại log:\n"
                            + "------------------------------------------------------------\n"
                            + "TO: {}\n"
                            + "SUBJECT: {}\n"
                            + "BODY:\n{}"
                            + "------------------------------------------------------------",
                            message.to(), message.subject(), message.body());
                    return;
                }

                SmtpMailClient client = new SmtpMailClient(host, port, username.trim(), password.trim(), from, fromName);
                client.send(message);
                log.info("[MAIL-SUCCESS] Đã gửi email thành công tới {}", message.to());

            } catch (IOException e) {
                log.error("[MAIL-ERROR] Gửi email tới {} thất bại: {}", message.to(), e.getMessage());
                throw new CompletionException(e);
            } catch (Exception e) {
                log.error("[MAIL-ERROR] Ngoại lệ không mong muốn khi gửi mail: {}", e.getMessage(), e);
                throw new CompletionException(e);
            }
        }, executor);
    }

    private static boolean isNotBlank(String s) {
        return s != null && !s.isBlank();
    }
}
