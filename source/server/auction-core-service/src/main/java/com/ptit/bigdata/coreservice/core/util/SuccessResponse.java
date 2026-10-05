package com.ptit.bigdata.coreservice.core.util;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SuccessResponse<T> {
    private T data;
    private String message;
    private String status;

    public SuccessResponse(T data, String message, String status) {
        this.data = data;
        this.message = message;
        this.status = status;
    }

    public SuccessResponse(String message, T data) {
        this.message = message;
        this.data = data;
    }
}
