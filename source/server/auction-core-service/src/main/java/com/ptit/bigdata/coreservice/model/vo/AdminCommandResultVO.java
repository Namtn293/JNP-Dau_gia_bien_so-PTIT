package com.ptit.bigdata.coreservice.model.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCommandResultVO {
    private boolean success;
    private String message;

    public static AdminCommandResultVO ok(String message) {
        return new AdminCommandResultVO(true, message);
    }

    public static AdminCommandResultVO fail(String message) {
        return new AdminCommandResultVO(false, message);
    }
}
