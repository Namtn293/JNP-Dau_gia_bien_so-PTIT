package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.model.vo.AuctionSessionVO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuctionSessionService {

    Page<AuctionSessionVO> getAuctionSessions(Pageable pageable, String auctionStatus);

}
