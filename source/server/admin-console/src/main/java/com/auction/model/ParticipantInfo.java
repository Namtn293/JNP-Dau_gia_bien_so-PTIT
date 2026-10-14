package com.auction.model;

/** Một người tham gia trong phòng, dùng cho tab Điều khiển phiên (giai đoạn 3). */
public record ParticipantInfo(
        String userId,
        String fullName,
        ConnectionState connection,
        int bidsInLast5s,
        long lastPrice,
        int rttMs) {
}