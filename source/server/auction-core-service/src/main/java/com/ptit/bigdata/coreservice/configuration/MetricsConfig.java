package com.ptit.bigdata.coreservice.configuration;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Bật lập lịch chỉ khi phát METRICS. Khi tắt, không có @Scheduled nào được kích hoạt. */
@Configuration
@EnableScheduling
@ConditionalOnProperty(name = "udp.metrics.enabled", havingValue = "true")
public class MetricsConfig {

}