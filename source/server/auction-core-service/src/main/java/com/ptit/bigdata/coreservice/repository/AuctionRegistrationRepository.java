package com.ptit.bigdata.coreservice.repository;

import com.ptit.bigdata.coreservice.entity.AuctionRegistration;
import com.ptit.bigdata.coreservice.enumration.RegistrationStatusEnum;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Collection;
import java.util.Optional;

@Repository
public interface AuctionRegistrationRepository extends JpaRepository<AuctionRegistration, Long> {

    Optional<AuctionRegistration> findByUserIdAndSessionId(Long userId, Long sessionId);

    Optional<AuctionRegistration> findByUserIdAndSessionIdAndStatus(Long userId, Long sessionId, RegistrationStatusEnum status);

    List<AuctionRegistration> findBySessionIdAndStatus(Long sessionId, RegistrationStatusEnum status);

    List<AuctionRegistration> findBySessionId(Long sessionId);

    @Query("select r.sessionId, count(r) from AuctionRegistration r " +
            "where r.status = com.ptit.bigdata.coreservice.enumration.RegistrationStatusEnum.ACTIVE " +
            "and r.sessionId in :ids group by r.sessionId")
    List<Object[]> countActiveBySessionIds(@Param("ids") Collection<Long> ids);

    @Query("select count(r) from AuctionRegistration r " +
            "where r.status = com.ptit.bigdata.coreservice.enumration.RegistrationStatusEnum.ACTIVE " +
            "and r.sessionId in (select s.id from AuctionSession s where s.status = :sessionStatus)")
    Long countActiveRegistrationsBySessionStatus(@Param("sessionStatus") AuctionStatusEnum sessionStatus);

    List<AuctionRegistration> findByUserId(Long userId);

    boolean existsByUserIdAndSessionIdAndStatus(Long userId, Long sessionId, RegistrationStatusEnum status);
}

