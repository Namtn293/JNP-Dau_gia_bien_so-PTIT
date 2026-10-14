package com.auction.model;

/** Chỉ số máy chủ lấy qua UDP 8888. */
public record ServerMetrics(
        double cpuPercent,
        int cpuCores,
        double ramUsedGb,
        double ramTotalGb,
        int pingMs,
        int onlineUsers,
        double bidsPerSecond) {
}