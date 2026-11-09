package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.model.vo.BidHistoryItemVO;
import com.ptit.bigdata.coreservice.model.vo.MyAuctionHistoryVO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AuctionHistoryService {
    Page<MyAuctionHistoryVO> getMyAuctionHistory(Long userId, String resultFilter, Pageable pageable);

    List<BidHistoryItemVO> getMyBidsInSession(Long userId, String sessionCode);

    Page<BidHistoryItemVO> getSessionBids(String sessionCode, Pageable pageable);
}

