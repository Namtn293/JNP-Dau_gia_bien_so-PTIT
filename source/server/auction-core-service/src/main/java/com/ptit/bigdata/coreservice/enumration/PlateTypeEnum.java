package com.ptit.bigdata.coreservice.enumration;

import lombok.Getter;

@Getter
public enum PlateTypeEnum {
    NGU_QUY("Ngũ quý"),
    TU_QUY("Tứ quý"),
    LOC_PHAT("Lộc phát"),
    THAN_TAI("Thần tài"),
    SANH_TIEN("Sảnh tiến"),
    OTHER("Khác");

    private final String description;

    PlateTypeEnum(String description) {
        this.description = description;
    }
}
