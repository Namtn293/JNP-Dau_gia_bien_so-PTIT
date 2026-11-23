package com.ptit.bigdata.coreservice.model.vo;

import com.ptit.bigdata.coreservice.enumration.PlateTypeEnum;

public record AvailablePlateVO(
        String plateNumber,
        String provinceName,
        PlateTypeEnum plateType,
        String vehicleType) {
}
