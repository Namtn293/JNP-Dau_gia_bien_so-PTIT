package com.ptit.bigdata.coreservice.configuration;

import com.ptit.bigdata.coreservice.configuration.security.WebSocketAuthChannelInterceptor;
import com.ptit.bigdata.coreservice.configuration.security.WebSocketStompErrorHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthChannelInterceptor authChannelInterceptor;
    private final WebSocketStompErrorHandler stompErrorHandler;
    private final ClientIpHandshakeInterceptor clientIpHandshakeInterceptor;

    private static final String[] ALLOWED_ORIGIN_PATTERNS = {
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://localhost:5174"
    };

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Tiền tố cho các kênh Client Subscribe để nhận dữ liệu
        config.enableSimpleBroker("/topic", "/queue");

        // Tiền tố cho các request Client gửi lên Server (@MessageMapping)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Đăng ký custom error handler để trả mã lỗi STOMP có cấu trúc (error-code)
        registry.setErrorHandler(stompErrorHandler);

        // Endpoint WebSocket thuần
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(ALLOWED_ORIGIN_PATTERNS)
                .addInterceptors(clientIpHandshakeInterceptor);

        // Endpoint WebSocket hỗ trợ SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(ALLOWED_ORIGIN_PATTERNS)
                .addInterceptors(clientIpHandshakeInterceptor)
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Đăng ký Interceptor xác thực Token JWT và phân quyền kênh truy cập
        registration.interceptors(authChannelInterceptor);
    }
}
