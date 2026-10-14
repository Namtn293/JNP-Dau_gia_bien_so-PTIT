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
        AuctionStatusEnum statusEnum = AuctionStatusEnum.SOON;
        if (auctionStatus != null && !auctionStatus.isBlank()) {
            try {
                statusEnum = AuctionStatusEnum.valueOf(auctionStatus.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // Keep default SOON
            }
        }
        return auctionSessionRepository.getAuctionSession(pageable, statusEnum);
    }
}
