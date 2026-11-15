package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.model.vo.AutoBidConfigVO;

public interface AutoBidService {
    AutoBidConfigVO configure(Long userId, String sessionCode, Long maxAmount);

    void disable(Long userId, String sessionCode);

    AutoBidConfigVO getConfig(Long userId, String sessionCode);
}

