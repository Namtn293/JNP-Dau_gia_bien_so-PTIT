package com.ptit.bigdata.coreservice.service.implement;

import com.ptit.bigdata.coreservice.core.auth.entity.User;
import com.ptit.bigdata.coreservice.core.auth.repository.UserRepository;
import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.enumration.RegistrationStatusEnum;
import com.ptit.bigdata.coreservice.enumration.RoleEnum;
import com.ptit.bigdata.coreservice.enumration.RoomRoleEnum;
import com.ptit.bigdata.coreservice.repository.AuctionRegistrationRepository;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.service.RoomRoleResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoomRoleResolverImpl implements RoomRoleResolver {

    private final UserRepository userRepository;
    private final AuctionRegistrationRepository auctionRegistrationRepository;
    private final AuctionSessionRepository auctionSessionRepository;

    private record CachedRole(RoomRoleEnum role, long expiresAt) {}
    private final java.util.Map<String, CachedRole> roleCache = new java.util.concurrent.ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 15_000L;

    @Override
    public RoomRoleEnum resolve(Long userId, Long sessionId) {
        if (userId == null) {
            return RoomRoleEnum.VIEWER;
        }

        String cacheKey = userId + ":" + (sessionId != null ? sessionId : 0L);
        CachedRole cached = roleCache.get(cacheKey);
        long now = System.currentTimeMillis();
        if (cached != null && cached.expiresAt() > now) {
            return cached.role();
        }

        // 1. Kiểm tra quyền ADMIN hệ thống
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent() && userOpt.get().getRoleEnum() == RoleEnum.ADMIN) {
            roleCache.put(cacheKey, new CachedRole(RoomRoleEnum.ADMIN, now + CACHE_TTL_MS));
            return RoomRoleEnum.ADMIN;
        }

        // 2. Kiểm tra cọc / đăng ký phiên đấu giá
        if (sessionId != null) {
            boolean isRegistered = auctionRegistrationRepository.existsByUserIdAndSessionIdAndStatus(
                    userId, sessionId, RegistrationStatusEnum.ACTIVE);
            if (isRegistered) {
                roleCache.put(cacheKey, new CachedRole(RoomRoleEnum.BIDDER, now + CACHE_TTL_MS));
                return RoomRoleEnum.BIDDER;
            }
        }

        roleCache.put(cacheKey, new CachedRole(RoomRoleEnum.VIEWER, now + CACHE_TTL_MS));
        return RoomRoleEnum.VIEWER;
    }

    @Override
    public void evictCache(Long userId, Long sessionId) {
        if (userId != null) {
            roleCache.remove(userId + ":" + (sessionId != null ? sessionId : 0L));
        }
    }

    @Override
    public RoomRoleEnum resolveBySessionCode(Long userId, String sessionCode) {
        if (userId == null) {
            return RoomRoleEnum.VIEWER;
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent() && userOpt.get().getRoleEnum() == RoleEnum.ADMIN) {
            return RoomRoleEnum.ADMIN;
        }

        if (sessionCode != null && !sessionCode.isBlank()) {
            Optional<AuctionSession> sessionOpt = auctionSessionRepository.findBySessionCode(sessionCode);
            if (sessionOpt.isPresent()) {
                return resolve(userId, sessionOpt.get().getId());
            }
        }

        return RoomRoleEnum.VIEWER;
    }
}

