package com.ptit.bigdata.coreservice.core.util;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonPropertyOrder({"code", "message", "success", "data", "metaData"})
public class ErrorResponse {
    @Builder.Default
    private Integer code = 400;
    private String message;
    @Builder.Default
    private Boolean success = false;
    private Object data;
    private Object metaData;

    public ErrorResponse(String message) {
        this.code = 400;
        this.message = message;
        this.success = false;
        this.data = null;
        this.metaData = null;
    }

    public ErrorResponse(Integer code, String message) {
        this.code = code;
        this.message = message;
        this.success = false;
        this.data = null;
        this.metaData = null;
    }

    public ErrorResponse(Integer code, String message, Object data) {
        this.code = code;
        this.message = message;
        this.success = false;
        this.data = data;
        this.metaData = null;
    }

    public ErrorResponse(String message, String status) {
        try {
            this.code = Integer.parseInt(status);
        } catch (Exception e) {
            this.code = 400;
        }
        this.message = message;
        this.success = false;
        this.data = null;
        this.metaData = null;
    }
}
