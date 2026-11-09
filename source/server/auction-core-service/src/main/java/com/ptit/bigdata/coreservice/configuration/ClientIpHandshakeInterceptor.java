package com.ptit.bigdata.coreservice.configuration;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
public class ClientIpHandshakeInterceptor implements HandshakeInterceptor {

    public static final String CLIENT_IP_ATTR = "CLIENT_IP";

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                  WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String ip = null;
        if (request instanceof ServletServerHttpRequest servletRequest) {
            var req = servletRequest.getServletRequest();
            ip = req.getHeader("X-Forwarded-For");
            if (ip != null && !ip.isBlank()) {
                // X-Forwarded-For can contain multiple IPs: client, proxy1, proxy2
                ip = ip.split(",")[0].trim();
            } else {
                ip = req.getRemoteAddr();
            }
        }
        if (ip == null || ip.isBlank()) {
            if (request.getRemoteAddress() != null && request.getRemoteAddress().getAddress() != null) {
                ip = request.getRemoteAddress().getAddress().getHostAddress();
            } else {
                ip = "127.0.0.1";
            }
        }
        attributes.put(CLIENT_IP_ATTR, ip);
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // No-op
    }
}

