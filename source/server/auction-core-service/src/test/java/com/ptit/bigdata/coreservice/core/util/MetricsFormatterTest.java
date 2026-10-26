package com.ptit.bigdata.coreservice.core.util;

import com.ptit.bigdata.coreservice.model.vo.MetricsSample;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MetricsFormatterTest {

    @Test
    void formatsLineThatUdpServerCanParse() {
        MetricsSample sample = new MetricsSample(38.5, 8, 9.9, 16.0, 248, 12.4);

        String line = MetricsFormatter.format(101, 1760000000000L, sample);

        assertEquals(
                "METRICS seq=101 ts=1760000000000 cpu=38.50 cores=8 ram_used=9.90 ram_total=16.00 online=248 bps=12.40",
                line);
    }
}