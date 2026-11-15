package com.ptit.bigdata.coreservice.configuration.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.StompSubProtocolErrorHandler;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
public class WebSocketStompErrorHandler extends StompSubProtocolErrorHandler {

    @Override
    public Message<byte[]> handleClientMessageProcessingError(Message<byte[]> clientMessage, Throwable ex) {
        Throwable cause = ex;
        while (cause.getCause() != null && !(cause instanceof WebSocketSecurityException)) {
            cause = cause.getCause();
        }

        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.ERROR);
        accessor.setLeaveMutable(true);

        if (cause instanceof WebSocketSecurityException secEx) {
            log.warn("[WS-AUTH-ERROR] Code: {}, Msg: {}", secEx.getErrorCode(), secEx.getMessage());
            accessor.setHeader("error-code", secEx.getErrorCode());
            accessor.setMessage(secEx.getMessage());
            byte[] payload = secEx.getMessage().getBytes(StandardCharsets.UTF_8);
            return MessageBuilder.createMessage(payload, accessor.getMessageHeaders());
        }

        log.warn("[WS-ERROR] Processing error: {}", ex.getMessage());
        accessor.setHeader("error-code", "INTERNAL_ERROR");
        accessor.setMessage(ex.getMessage() != null ? ex.getMessage() : "Lỗi xử lý kết nối WebSocket");
        byte[] payload = (ex.getMessage() != null ? ex.getMessage() : "Error").getBytes(StandardCharsets.UTF_8);
        return MessageBuilder.createMessage(payload, accessor.getMessageHeaders());
    }
}
