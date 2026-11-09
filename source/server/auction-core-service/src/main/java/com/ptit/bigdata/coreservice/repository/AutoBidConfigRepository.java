package com.ptit.bigdata.coreservice.repository;

import com.ptit.bigdata.coreservice.entity.AutoBidConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AutoBidConfigRepository extends JpaRepository<AutoBidConfig, Long> {

    Optional<AutoBidConfig> findByUserIdAndSessionId(Long userId, Long sessionId);

    List<AutoBidConfig> findBySessionIdAndActiveTrue(Long sessionId);

    List<AutoBidConfig> findBySessionId(Long sessionId);

    List<AutoBidConfig> findByUserId(Long userId);
}

