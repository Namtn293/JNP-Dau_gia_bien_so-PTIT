package com.ptit.bigdata.coreservice.enumration;

import lombok.Getter;

@Getter
public enum AuctionStatusEnum {
    SOON("Sắp diễn ra"),
    LIVE("Đang diễn ra"),
    END("Đã kết thúc");

    private final String description;

    public String toString(){
        return description;
    }

    AuctionStatusEnum(String description) {
        this.description = description;
    }
}
