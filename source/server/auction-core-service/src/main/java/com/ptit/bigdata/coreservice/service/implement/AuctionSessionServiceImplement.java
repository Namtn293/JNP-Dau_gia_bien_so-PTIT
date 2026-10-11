package com.ptit.bigdata.coreservice.service.implement;

import com.ptit.bigdata.coreservice.enumration.AuctionStatusEnum;
import com.ptit.bigdata.coreservice.model.vo.AuctionSessionVO;
import com.ptit.bigdata.coreservice.repository.AuctionSessionRepository;
import com.ptit.bigdata.coreservice.service.AuctionSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuctionSessionServiceImplement implements AuctionSessionService {

    private final AuctionSessionRepository auctionSessionRepository;

    @Override
    public Page<AuctionSessionVO> getAuctionSessions(Pageable pageable, String auctionStatus) {
        AuctionStatusEnum statusEnum = AuctionStatusEnum.valueOf(auctionStatus.toUpperCase());
        return auctionSessionRepository.getAuctionSession(pageable, statusEnum);
    }
}
