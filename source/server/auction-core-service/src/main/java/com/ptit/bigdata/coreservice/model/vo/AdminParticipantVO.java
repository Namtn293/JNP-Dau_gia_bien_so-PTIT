package com.ptit.bigdata.coreservice.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminParticipantVO {
    private String userId;
    private String fullName;
    private String connection;
    private long lastPrice;
    private int rttMs;
    private String role;
}
