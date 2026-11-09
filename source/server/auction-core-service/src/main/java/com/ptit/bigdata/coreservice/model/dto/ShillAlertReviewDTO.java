package com.ptit.bigdata.coreservice.model.dto;

import com.ptit.bigdata.coreservice.enumration.ShillAlertStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShillAlertReviewDTO {
    private ShillAlertStatusEnum status; // CONFIRMED or DISMISSED
    private String note;
}

