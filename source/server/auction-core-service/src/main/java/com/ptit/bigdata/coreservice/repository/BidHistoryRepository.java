package com.ptit.bigdata.coreservice.repository;

import com.ptit.bigdata.coreservice.entity.BidHistory;
import com.ptit.bigdata.coreservice.enumration.BidSourceEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidHistoryRepository extends JpaRepository<BidHistory, Long> {
    List<BidHistory> findByAuctionSessionIdOrderByBidTimeDesc(Long auctionSessionId);

    List<BidHistory> findByAuctionSessionIdOrderByBidTimeAsc(Long auctionSessionId);

    Page<BidHistory> findByAuctionSessionIdOrderByBidTimeDesc(Long auctionSessionId, Pageable pageable);

    List<BidHistory> findByAuctionSessionIdAndUserIDOrderByBidTimeDesc(Long auctionSessionId, Long userId);

    List<BidHistory> findByUserIDOrderByBidTimeDesc(Long userID);

    @Query("select distinct b.auctionSessionId from BidHistory b where b.userID = :userId")
    List<Long> findDistinctAuctionSessionIdsByUserId(@Param("userId") Long userId);

    @Query(value = "select b.auctionSessionId from BidHistory b " +
            "join AuctionSession a on a.id = b.auctionSessionId " +
            "where b.userID = :userId " +
            "and (:result is null or :result = '' " +
            "  or (:result = 'LEADING' and a.status in (com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum.LIVE, com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum.PAUSED) and exists (select 1 from BidHistory w where w.auctionSessionId = a.id and w.userID = :userId and w.isWinningBid = true)) " +
            "  or (:result = 'OUTBID' and a.status in (com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum.LIVE, com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum.PAUSED) and not exists (select 1 from BidHistory w where w.auctionSessionId = a.id and w.userID = :userId and w.isWinningBid = true)) " +
            "  or (:result = 'WON' and a.status = com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum.END and exists (select 1 from BidHistory w where w.auctionSessionId = a.id and w.userID = :userId and w.isWinningBid = true)) " +
            "  or (:result = 'LOST' and a.status = com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum.END and not exists (select 1 from BidHistory w where w.auctionSessionId = a.id and w.userID = :userId and w.isWinningBid = true)) " +
            ") " +
            "group by b.auctionSessionId " +
            "order by max(b.bidTime) desc",
            countQuery = "select count(distinct b.auctionSessionId) from BidHistory b " +
            "join AuctionSession a on a.id = b.auctionSessionId " +
            "where b.userID = :userId " +
            "and (:result is null or :result = '' " +
            "  or (:result = 'LEADING' and a.status in (com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum.LIVE, com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum.PAUSED) and exists (select 1 from BidHistory w where w.auctionSessionId = a.id and w.userID = :userId and w.isWinningBid = true)) " +
            "  or (:result = 'OUTBID' and a.status in (com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum.LIVE, com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum.PAUSED) and not exists (select 1 from BidHistory w where w.auctionSessionId = a.id and w.userID = :userId and w.isWinningBid = true)) " +
            "  or (:result = 'WON' and a.status = com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum.END and exists (select 1 from BidHistory w where w.auctionSessionId = a.id and w.userID = :userId and w.isWinningBid = true)) " +
            "  or (:result = 'LOST' and a.status = com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum.END and not exists (select 1 from BidHistory w where w.auctionSessionId = a.id and w.userID = :userId and w.isWinningBid = true)) " +
            ")")
    Page<Long> findMyAuctionSessionIds(@Param("userId") Long userId, @Param("result") String result, Pageable pageable);

    @Modifying
    @Query("update BidHistory b set b.isWinningBid = false where b.auctionSessionId = :sessionId and b.isWinningBid = true")
    int clearWinning(@Param("sessionId") Long sessionId);

    List<BidHistory> findTop20ByAuctionSessionIdAndSourceOrderByBidTimeDesc(Long auctionSessionId, BidSourceEnum source);
}

