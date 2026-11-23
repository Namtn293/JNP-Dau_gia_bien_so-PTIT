package com.ptit.bigdata.coreservice.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record CreateAuctionSessionDTO(
        @NotBlank @Size(max = 20) String plateNumber,

        @NotNull @Positive Long startPrice,

        @NotNull @Positive Long depositAmount,

        @NotNull LocalDateTime startTime,

        @NotNull LocalDateTime endTime) {
}
