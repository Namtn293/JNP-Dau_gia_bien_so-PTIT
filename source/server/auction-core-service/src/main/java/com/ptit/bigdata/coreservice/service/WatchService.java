package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.model.vo.WatchVO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface WatchService {
    void watch(Long userId, String sessionCode);

    void unwatch(Long userId, String sessionCode);

    Page<WatchVO> getWatchedSessions(Long userId, Pageable pageable);

    boolean isWatched(Long userId, Long sessionId);

    boolean isWatched(Long userId, String sessionCode);
}

