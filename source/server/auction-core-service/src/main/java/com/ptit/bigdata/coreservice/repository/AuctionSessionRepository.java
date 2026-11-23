package com.ptit.bigdata.coreservice.repository;

import com.ptit.bigdata.coreservice.entity.AuctionSession;
import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.model.vo.AuctionSessionVO;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Collection;

@Repository
public interface AuctionSessionRepository extends JpaRepository<AuctionSession, Long> {

        Optional<AuctionSession> findBySessionCode(String sessionCode);

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("select a from AuctionSession a where a.sessionCode = :code")
        Optional<AuctionSession> findBySessionCodeForUpdate(@Param("code") String code);

        Optional<AuctionSession> findFirstByNumberPlateId(Long numberPlateId);

        Optional<AuctionSession> findFirstByNumberPlateIdAndStatus(Long numberPlateId, AuctionStatusEnum status);

        Optional<AuctionSession> findFirstByNumberPlateIdOrderByStartTimeDesc(Long numberPlateId);

        List<AuctionSession> findByStatus(AuctionStatusEnum status);

        List<AuctionSession> findByStatusAndEndTimeBefore(AuctionStatusEnum status, LocalDateTime endTime);

        List<AuctionSession> findByStatusAndStartTimeBeforeAndEndTimeAfter(AuctionStatusEnum status,
                        LocalDateTime startTime, LocalDateTime endTime);

        @Query(value = "select new com.ptit.bigdata.coreservice.model.vo.AuctionSessionVO(a.sessionCode, n.plateNumber, p.name, n.plateType, a.startPrice, a.status, a.startTime, a.endTime, a.stepPrice, a.participantCount, a.endPrice, a.currentPrice, a.bidCount) "
                        + "from AuctionSession a "
                        + "join NumberPlate n on a.numberPlateId = n.id "
                        + "join Province p on n.provinceId = p.id "
                        + "where a.status = :sessionStatus", countQuery = "select count(a) from AuctionSession a where a.status = :sessionStatus")
        Page<AuctionSessionVO> getAuctionSession(Pageable pageable,
                        @Param("sessionStatus") AuctionStatusEnum sessionStatus);

        /**
         * Cập nhật trực tiếp số người tham gia duy nhất đang ở trong phòng vào DB.
         */
        @Modifying
        @Transactional
        @Query("update AuctionSession a set a.participantCount = :count, a.updatedAt = :updatedAt where a.sessionCode = :sessionCode")
        int updateParticipantCountBySessionCode(
                        @Param("sessionCode") String sessionCode,
                        @Param("count") Long count,
                        @Param("updatedAt") LocalDateTime updatedAt);

        /**
         * Đồng bộ reset participant_count về 0 khi server khởi động lại (không còn kết
         * nối WebSocket cũ).
         */
        @Modifying
        @Transactional
        @Query("update AuctionSession a set a.participantCount = 0L")
        int resetAllParticipantCounts();

        /**
         * Tổng số người tham gia của các phiên đang ở trạng thái cho trước (dùng cho
         * METRICS.online).
         */
        @Query("select coalesce(sum(a.participantCount), 0L) from AuctionSession a where a.status = :status")
        Long sumParticipantsByStatus(@Param("status") AuctionStatusEnum status);

        /**
         * Tổng số lượt đặt giá của mọi phiên (dùng cho METRICS.bps, cần chênh lệch theo
         * thời gian).
         */
        @Query("select coalesce(sum(a.bidCount), 0L) from AuctionSession a")
        Long sumBidCount();

        boolean existsByNumberPlateIdAndStatusIn(
                        Long numberPlateId,
                        Collection<AuctionStatusEnum> statues);

        boolean existsBySessionCode(String sessionCode);
}