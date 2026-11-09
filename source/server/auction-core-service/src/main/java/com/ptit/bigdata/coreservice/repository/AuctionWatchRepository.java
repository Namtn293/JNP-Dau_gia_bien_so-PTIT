package com.ptit.bigdata.coreservice.repository;

import com.ptit.bigdata.coreservice.entity.AuctionWatch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionWatchRepository extends JpaRepository<AuctionWatch, Long> {

    Optional<AuctionWatch> findByUserIdAndSessionId(Long userId, Long sessionId);

    List<AuctionWatch> findBySessionId(Long sessionId);

    Page<AuctionWatch> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<AuctionWatch> findByUserId(Long userId);

    boolean existsByUserIdAndSessionId(Long userId, Long sessionId);

    void deleteByUserIdAndSessionId(Long userId, Long sessionId);
}

