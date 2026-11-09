package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.enumration.BidSourceEnum;
import com.ptit.bigdata.coreservice.model.vo.BidResultVO;

public interface BidService {
    BidResultVO placeBid(String sessionCode, Long userId, Long bidAmount, BidSourceEnum source, String clientIp);
}

