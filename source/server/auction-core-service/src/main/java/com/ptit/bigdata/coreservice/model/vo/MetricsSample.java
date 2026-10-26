package com.ptit.bigdata.coreservice.model.vo;

/** Số liệu của một chu kỳ Metrics */
public record MetricsSample (double cpuPercent, int cores, double ramUsedGb, double ramTotalGb, long online, double bps) {

}
