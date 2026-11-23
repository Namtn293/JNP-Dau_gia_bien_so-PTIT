package com.ptit.bigdata.coreservice.model.vo;

public record CreateAuctionSessionVO(
        String sessionCode,
        String plateNumber,
        String status) {
}
