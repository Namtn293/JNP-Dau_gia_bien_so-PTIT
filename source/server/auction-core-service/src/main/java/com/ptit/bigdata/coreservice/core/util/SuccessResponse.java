package com.ptit.bigdata.coreservice.core.util;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonPropertyOrder({"code", "message", "success", "data", "metaData"})
public class SuccessResponse<T> {
    @Builder.Default
    private Integer code = 200;
    private String message = null;
    @Builder.Default
    private Boolean success = true;
    private T data;
    private Object metaData;

    public SuccessResponse(T data) {
        this.code = 200;
        this.message = null;
        this.success = true;
        this.data = data;
        this.metaData = null;
    }

    public SuccessResponse(String message, T data) {
        this.code = 200;
        this.message = message;
        this.success = true;
        this.data = data;
        this.metaData = null;
    }

    public SuccessResponse(String message, T data, Object metaData) {
        this.code = 200;
        this.message = message;
        this.success = true;
        this.data = data;
        this.metaData = metaData;
    }

    public SuccessResponse(Integer code, String message, T data, Object metaData) {
        this.code = code;
        this.message = message;
        this.success = true;
        this.data = data;
        this.metaData = metaData;
    }
}
