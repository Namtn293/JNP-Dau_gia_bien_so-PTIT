package com.ptit.bigdata.coreservice.repository;

import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionSessionRepository extends JpaRepository<AuctionSession, Long> {
    Optional<AuctionSession> findBySessionCode(String sessionCode);

    List<AuctionSession> findByStatus(AuctionStatusEnum status);

    Optional<AuctionSession> findByNumberPlate_PlateNumber(String plateNumber);

    List<AuctionSession> findByNumberPlate_Province_Id(Long provinceId);

    List<AuctionSession> findByNumberPlate_Province_Name(String provinceName);
}
