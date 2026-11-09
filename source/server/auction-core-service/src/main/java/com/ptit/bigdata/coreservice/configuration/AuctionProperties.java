package com.ptit.bigdata.coreservice.configuration;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Data
@Configuration
@ConfigurationProperties(prefix = "auction")
public class AuctionProperties {

    private List<StepTier> stepTiers = new ArrayList<>();
    private RoomConfig room = new RoomConfig();
    private NotifyConfig notify = new NotifyConfig();
    private WalletConfig wallet = new WalletConfig();
    private AutoBidConfigProps autoBid = new AutoBidConfigProps();
    private ChartConfig chart = new ChartConfig();
    private ShillConfig shill = new ShillConfig();

    @Data
    public static class StepTier {
        private Long upTo;
        private Long step;
    }

    @Data
    public static class RoomConfig {
        private boolean viewerCanChat = false;
    }

    @Data
    public static class NotifyConfig {
        private int startingSoonMinutes = 15;
        private int endingSoonMinutes = 5;
        private int newBidThrottleSeconds = 60;
    }

    @Data
    public static class WalletConfig {
        private Long initialBalance = 1_000_000_000L;
        private Long maxTopup = 500_000_000L;
    }

    @Data
    public static class AutoBidConfigProps {
        private long baseDelayMs = 5000L;
        private long jitterMs = 1500L;
    }

    @Data
    public static class ChartConfig {
        private int maxPoints = 1000;
    }

    @Data
    public static class ShillConfig {
        private int minAlternatingBids = 6;
        private int maxGapSeconds = 15;
    }
}

