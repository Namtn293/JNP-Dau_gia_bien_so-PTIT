package com.ptit.bigdata.coreservice.repository;

import com.ptit.bigdata.coreservice.entity.AuctionRegistration;
import com.ptit.bigdata.coreservice.enumration.RegistrationStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionRegistrationRepository extends JpaRepository<AuctionRegistration, Long> {

    Optional<AuctionRegistration> findByUserIdAndSessionId(Long userId, Long sessionId);

    Optional<AuctionRegistration> findByUserIdAndSessionIdAndStatus(Long userId, Long sessionId, RegistrationStatusEnum status);

    List<AuctionRegistration> findBySessionIdAndStatus(Long sessionId, RegistrationStatusEnum status);

    List<AuctionRegistration> findBySessionId(Long sessionId);

    List<AuctionRegistration> findByUserId(Long userId);

    List<AuctionRegistration> findByUserIdAndStatus(Long userId, RegistrationStatusEnum status);

    boolean existsByUserIdAndSessionIdAndStatus(Long userId, Long sessionId, RegistrationStatusEnum status);
}

