package com.ptit.bigdata.coreservice.service;

import com.ptit.bigdata.coreservice.configuration.AuctionProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class StepPriceCalculatorTest {

    private StepPriceCalculator calculator;

    @BeforeEach
    void setUp() {
        AuctionProperties properties = new AuctionProperties();
        AuctionProperties.StepTier tier1 = new AuctionProperties.StepTier();
        tier1.setUpTo(99_999_999L);
        tier1.setStep(5_000_000L);

        AuctionProperties.StepTier tier2 = new AuctionProperties.StepTier();
        tier2.setUpTo(500_000_000L);
        tier2.setStep(10_000_000L);

        AuctionProperties.StepTier tier3 = new AuctionProperties.StepTier();
        tier3.setUpTo(null);
        tier3.setStep(20_000_000L);

        properties.setStepTiers(List.of(tier1, tier2, tier3));
        calculator = new StepPriceCalculator(properties);
    }

    @Test
    @DisplayName("Giá khởi điểm 40tr -> Bước giá 5tr")
    void testStartPriceStep() {
        assertEquals(5_000_000L, calculator.stepFor(40_000_000L));
    }

    @Test
    @DisplayName("Giá cận biên 95tr -> Bước giá 5tr")
    void testNear100mStep() {
        assertEquals(5_000_000L, calculator.stepFor(95_000_000L));
    }

    @Test
    @DisplayName("Giá 100tr -> Bước giá 10tr")
    void test100mStep() {
        assertEquals(10_000_000L, calculator.stepFor(100_000_000L));
    }

    @Test
    @DisplayName("Giá 500tr -> Bước giá 10tr")
    void test500mStep() {
        assertEquals(10_000_000L, calculator.stepFor(500_000_000L));
    }

    @Test
    @DisplayName("Giá trên 500tr (510tr) -> Bước giá 20tr")
    void testAbove500mStep() {
        assertEquals(20_000_000L, calculator.stepFor(510_000_000L));
    }
}

