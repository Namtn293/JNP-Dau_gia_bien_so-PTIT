package com.ptit.bigdata.coreservice.core.util;

public class ResponseUtil {
    public static <T> SuccessResponse<T> ok(String message) {
        return new SuccessResponse<>(null, message, "200");
    }

    public static <T> SuccessResponse<T> ok(String message, T data) {
        return new SuccessResponse<>(data, message, "200");
    }

    public static <T> SuccessResponse<T> ok(String message, T data, String status) {
        return new SuccessResponse<>(data, message, status);
    }

    public static ErrorResponse error(String message, String code) {
        return new ErrorResponse(message, code);
    }
}
