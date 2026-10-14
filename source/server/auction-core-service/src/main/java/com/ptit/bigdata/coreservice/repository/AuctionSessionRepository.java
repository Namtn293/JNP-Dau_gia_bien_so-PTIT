package com.ptit.bigdata.coreservice.repository;

import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.model.vo.AuctionSessionVO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface AuctionSessionRepository extends JpaRepository<AuctionSession, Long> {

    @Query(value = "select new com.ptit.bigdata.coreservice.model.vo.AuctionSessionVO(n.plateNumber, p.name, n.plateType, a.startPrice, a.status, a.startTime, a.endTime, a.stepPrice, a.participantCount, a.endPrice) " +
            "from AuctionSession a " +
            "join NumberPlate n on a.numberPlateId = n.id " +
            "join Province p on n.provinceId = p.id " +
            "where a.status = :sessionStatus",
            countQuery = "select count(a) from AuctionSession a where a.status = :sessionStatus")
    Page<AuctionSessionVO> getAuctionSession(Pageable pageable, @Param("sessionStatus") AuctionStatusEnum sessionStatus);
}
