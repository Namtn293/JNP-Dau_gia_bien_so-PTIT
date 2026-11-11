package com.ptit.bigdata.coreservice.configuration.security;

import com.ptit.bigdata.coreservice.core.auth.entity.Token;
import com.ptit.bigdata.coreservice.core.auth.entity.User;
import com.ptit.bigdata.coreservice.core.auth.repository.TokenRepository;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.core.auth.service.JwtService;
import com.ptit.bigdata.coreservice.entity.UserInfo;
import com.ptit.bigdata.coreservice.enumration.RoleEnum;
import com.ptit.bigdata.coreservice.enumration.StatusEnum;
import com.ptit.bigdata.coreservice.repository.UserInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final TokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final UserInfoRepository userInfoRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        StompCommand command = accessor.getCommand();

        // 1. Chống gửi thẳng vào Simple Broker (Bypass Controller)
        if (StompCommand.SEND.equals(command)) {
            String destination = accessor.getDestination();
            if (destination != null && (destination.startsWith("/topic/") || destination.startsWith("/queue/"))) {
                throw new WebSocketSecurityException("FORBIDDEN_DESTINATION",
                        "Không được phép gửi tin nhắn trực tiếp vào kênh phân phối (Broker)");
            }
        }

        // 2. Xử lý Frame CONNECT
        if (StompCommand.CONNECT.equals(command)) {
            handleConnect(accessor);
            return message;
        }

        // 3. Xử lý Frame SUBSCRIBE
        if (StompCommand.SUBSCRIBE.equals(command)) {
            handleSubscribe(accessor);
            return message;
        }

        // 4. Xử lý Frame SEND
        if (StompCommand.SEND.equals(command)) {
            handleSend(accessor);
            return message;
        }

        return message;
    }

    private void handleConnect(StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");

        // Trường hợp 1: Không gửi header -> Khách vãng lai (Anonymous)
        if (authHeader == null || authHeader.isBlank()) {
            AuctionUserPrincipal anon = AuctionUserPrincipal.createAnonymous();
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    anon, null, List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS"))
            );
            accessor.setUser(auth);
            log.info("[WS-CONNECT] Khách vãng lai đã kết nối (Session: {})", accessor.getSessionId());
            return;
        }

        // Trường hợp 2: Có gửi header -> Bắt buộc phải hợp lệ
        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7).trim() : authHeader.trim();

        try {
            if (jwtService.isExpired(token)) {
                throw new WebSocketSecurityException("TOKEN_EXPIRED", "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
            }
        } catch (WebSocketSecurityException e) {
            throw e;
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            throw new WebSocketSecurityException("TOKEN_EXPIRED", "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        } catch (Exception e) {
            throw new WebSocketSecurityException("TOKEN_INVALID", "Token không hợp lệ hoặc sai định dạng");
        }

        Optional<Token> tokenOpt = tokenRepository.findByToken(token);
        if (tokenOpt.isEmpty() || tokenOpt.get().isExpired() || tokenOpt.get().isRevoked()) {
            throw new WebSocketSecurityException("TOKEN_INVALID", "Mã truy cập không hợp lệ hoặc đã bị thu hồi");
        }

        String username;
        try {
            username = jwtService.getUserName(token);
        } catch (Exception e) {
            throw new WebSocketSecurityException("TOKEN_INVALID", "Token không đúng định dạng");
        }

        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new WebSocketSecurityException("TOKEN_INVALID", "Người dùng không tồn tại"));

        Optional<UserInfo> userInfoOpt = userInfoRepository.findByUserName(username);
        if (userInfoOpt.isPresent() && userInfoOpt.get().getStatus() == StatusEnum.BANNED) {
            throw new WebSocketSecurityException("USER_BANNED", "Tài khoản của bạn đã bị khóa");
        }

        String fullName = userInfoOpt
                .map(UserInfo::getFullName)
                .filter(s -> !s.isBlank())
                .orElse(username);

        AuctionUserPrincipal principal = AuctionUserPrincipal.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(fullName)
                .roleEnum(user.getRoleEnum())
                .anonymous(false)
                .build();

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, user.getAuthorities()
        );
        accessor.setUser(auth);
        log.info("[WS-CONNECT] Người dùng đã xác thực: {} ({}, id={})", username, fullName, user.getId());
    }

    private void handleSubscribe(StompHeaderAccessor accessor) {
        Principal principal = accessor.getUser();
        if (principal == null) {
            throw new WebSocketSecurityException("AUTH_REQUIRED", "Yêu cầu kết nối STOMP hợp lệ trước khi đăng ký nhận tin");
        }

        AuctionUserPrincipal customPrincipal = extractPrincipal(principal);
        String destination = accessor.getDestination();

        // Khách vãng lai CHỈ ĐƯỢC subscribe duy nhất "/topic/auctions"
        if (customPrincipal == null || customPrincipal.isAnonymous()) {
            if (destination != null && !destination.equals("/topic/auctions")) {
                throw new WebSocketSecurityException("AUTH_REQUIRED",
                        "Bạn cần đăng nhập để tham gia và theo dõi chi tiết phòng đấu giá");
            }
        }

        // Kênh /topic/admin/** chỉ dành riêng cho ADMIN
        if (destination != null && destination.startsWith("/topic/admin")) {
            if (customPrincipal == null || customPrincipal.getRoleEnum() != RoleEnum.ADMIN) {
                throw new WebSocketSecurityException("ADMIN_REQUIRED",
                        "Chỉ quản trị viên mới được phép đăng ký nhận tin từ kênh quản trị");
            }
        }
    }

    private void handleSend(StompHeaderAccessor accessor) {
        Principal principal = accessor.getUser();
        if (principal == null) {
            throw new WebSocketSecurityException("AUTH_REQUIRED", "Yêu cầu đăng nhập trước khi gửi tin nhắn");
        }

        AuctionUserPrincipal customPrincipal = extractPrincipal(principal);
        if (customPrincipal == null || customPrincipal.isAnonymous()) {
            throw new WebSocketSecurityException("AUTH_REQUIRED", "Vui lòng đăng nhập để thực hiện hành động này");
        }

        // Kiểm tra tài khoản có bị khóa giữa phiên hay không
        Optional<UserInfo> userInfoOpt = userInfoRepository.findByUserName(customPrincipal.getUsername());
        if (userInfoOpt.isPresent() && userInfoOpt.get().getStatus() == StatusEnum.BANNED) {
            throw new WebSocketSecurityException("USER_BANNED", "Tài khoản của bạn đã bị khóa");
        }

        // Kiểm tra quyền ADMIN đối với endpoint cập nhật trạng thái phiên
        String destination = accessor.getDestination();
        if ("/app/auction/status".equals(destination)) {
            if (customPrincipal.getRoleEnum() != RoleEnum.ADMIN) {
                throw new WebSocketSecurityException("ADMIN_REQUIRED",
                        "Chỉ quản trị viên mới có quyền cập nhật trạng thái phiên đấu giá");
            }
        }
    }

    public static AuctionUserPrincipal extractPrincipal(Principal principal) {
        if (principal instanceof Authentication auth) {
            if (auth.getPrincipal() instanceof AuctionUserPrincipal aup) {
                return aup;
            }
        }
        if (principal instanceof AuctionUserPrincipal aup) {
            return aup;
        }
        return null;
    }
}
