package com.ptit.bigdata.coreservice.core.util;

import com.ptit.bigdata.coreservice.model.vo.MetricsSample;

import java.util.Locale;

/**
 * Tạo dòng text đúng định dạng mà udp-server đọc (MessageParser):
 * METRICS seq=.. ts=.. cpu=.. cores=.. ram_used=.. ram_total=.. online=.. bps=..
 * Locale.ROOT để số thập phân luôn dùng dấu chấm.
 */
public final class MetricsFormatter {
    private MetricsFormatter() {

    }

    public static String format(long seq, long ts, MetricsSample s) {
        return String.format(Locale.ROOT,
                "METRICS seq=%d ts=%d cpu=%.2f cores=%d ram_used=%.2f ram_total=%.2f online=%d bps=%.2f",
                seq, ts, s.cpuPercent(), s.cores(), s.ramUsedGb(), s.ramTotalGb(), s.online(), s.bps()
        );
    }
}
