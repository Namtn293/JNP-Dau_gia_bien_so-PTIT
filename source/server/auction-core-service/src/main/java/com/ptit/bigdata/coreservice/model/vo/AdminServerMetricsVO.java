package com.ptit.bigdata.coreservice.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminServerMetricsVO {
    private double cpuPercent;
    private int cpuCores;
    private double ramUsedGb;
    private double ramTotalGb;
    private int pingMs;
    private int onlineUsers;
    private double bidsPerSecond;
}
