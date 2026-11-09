package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.enumration.RoomRoleEnum;

public interface RoomRoleResolver {
    RoomRoleEnum resolve(Long userId, Long sessionId);
    RoomRoleEnum resolveBySessionCode(Long userId, String sessionCode);
    default void evictCache(Long userId, Long sessionId) {}
}

