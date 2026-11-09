package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.configuration.AuctionProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class StepPriceCalculator {

    private final AuctionProperties auctionProperties;

    public long stepFor(long currentPrice) {
        List<AuctionProperties.StepTier> tiers = auctionProperties.getStepTiers();
        if (tiers != null && !tiers.isEmpty()) {
            for (AuctionProperties.StepTier tier : tiers) {
                if (tier.getUpTo() == null || currentPrice <= tier.getUpTo()) {
                    return tier.getStep() != null ? tier.getStep() : 5_000_000L;
                }
            }
        }
        // Fallback default tiers
        if (currentPrice < 100_000_000L) return 5_000_000L;    // < 100tr
        if (currentPrice <= 500_000_000L) return 10_000_000L;  // 100tr – 500tr
        return 20_000_000L;                                     // > 500tr
    }
}

