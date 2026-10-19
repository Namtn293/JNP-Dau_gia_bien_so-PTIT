package com.ptit.bigdata.coreservice.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocketConfig - Cấu hình STOMP WebSocket cho Phòng Đấu Giá & Chat Thời Gian Thực
 *
 * Client kết nối qua:
 * - Native WebSocket: ws://localhost:8080/ws
 * - Hoặc SockJS: http://localhost:8080/ws
 *
 * Kênh nhận dữ liệu (Subscribe):
 * - /topic/auctions         : Cập nhật thời gian thực toàn hệ thống / danh sách biển số (nhảy giá, số lượt trả, trạng thái)
 * - /topic/auction/{roomId} : Thông tin nhảy giá, đồng hồ đếm ngược, trạng thái phòng
 * - /topic/chat/{roomId}    : Tin nhắn trò chuyện giữa người tham gia
 * - /topic/room/{roomId}    : Sự kiện tham gia / rời phòng (Presence)
 *
 * Kênh gửi dữ liệu (Send):
 * - /app/auction/bid        : Đặt giá trực tiếp từ trang danh sách biển số
 * - /app/chat/{roomId}      : Gửi tin nhắn chat
 * - /app/room/{roomId}/join : Báo danh vào phòng
 * - /app/room/{roomId}/leave: Báo rời phòng
 * - /app/bid/{roomId}       : Đặt giá mới trong phòng
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Tiền tố cho các kênh Client Subscribe để nhận dữ liệu
        config.enableSimpleBroker("/topic", "/queue");

        // Tiền tố cho các request Client gửi lên Server (@MessageMapping)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint WebSocket thuần
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");

        // Endpoint WebSocket hỗ trợ SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
