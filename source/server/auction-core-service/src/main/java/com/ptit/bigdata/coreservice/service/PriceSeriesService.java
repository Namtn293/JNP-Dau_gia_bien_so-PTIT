package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.model.vo.PriceSeriesVO;

public interface PriceSeriesService {
    PriceSeriesVO getPriceSeries(String sessionCode);
}

