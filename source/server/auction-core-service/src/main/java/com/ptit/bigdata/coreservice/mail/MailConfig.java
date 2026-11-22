package com.ptit.bigdata.coreservice.mail;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "mail.smtp")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MailConfig {
    @Builder.Default
    private String host = "sandbox.smtp.mailtrap.io";

    @Builder.Default
    private int port = 587;

    @Builder.Default
    private String username = "391cd90ed6b503";

    @Builder.Default
    private String password = "b7ba1e7a48b484";

    @Builder.Default
    private String from = "no-reply@auction.local";

    @Builder.Default
    private String fromName = "Sàn đấu giá biển số xe";

    @Builder.Default
    private boolean enabled = true;
}
