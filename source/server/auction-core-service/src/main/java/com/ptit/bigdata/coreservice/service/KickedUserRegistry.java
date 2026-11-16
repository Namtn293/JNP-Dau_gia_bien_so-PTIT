package com.ptit.bigdata.coreservice.service;

import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/** In-memory room bans for emergency KICK commands; cleared when core restarts. */
@Component
public class KickedUserRegistry {
    private final Set<String> kicked = ConcurrentHashMap.newKeySet();

    public void kick(Long userId, String roomId) {
        kicked.add(key(userId, roomId));
    }

    public boolean isKicked(Long userId, String roomId) {
        return userId != null && (kicked.contains(key(userId, "ALL")) || kicked.contains(key(userId, roomId)));
    }

    private String key(Long userId, String roomId) {
        String scope = roomId == null || roomId.isBlank() || "ALL".equalsIgnoreCase(roomId)
                ? "ALL" : roomId;
        return userId + ":" + scope;
    }
}
