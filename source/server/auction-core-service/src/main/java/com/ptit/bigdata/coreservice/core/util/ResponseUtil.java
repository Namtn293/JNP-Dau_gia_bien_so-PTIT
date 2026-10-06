package com.ptit.bigdata.coreservice.core.util;

import org.springframework.data.domain.Page;
import java.util.List;

public class ResponseUtil {
    public static <T> SuccessResponse<T> ok() {
        return new SuccessResponse<>(null);
    }

    public static <T> SuccessResponse<T> ok(T data) {
        return new SuccessResponse<>(data);
    }

    public static <T> SuccessResponse<T> ok(T data, Object metaData) {
        return new SuccessResponse<>(null, data, metaData);
    }

    public static <T> SuccessResponse<T> ok(String message, T data) {
        return new SuccessResponse<>(message, data);
    }

    public static <T> SuccessResponse<T> ok(Integer code, String message, T data, Object metaData) {
        return new SuccessResponse<>(code, message, data, metaData);
    }

    public static <T> SuccessResponse<List<T>> page(Page<T> page) {
        return new SuccessResponse<>(null, page.getContent(), MetaData.from(page));
    }

    public static <T> SuccessResponse<List<T>> page(String message, Page<T> page) {
        return new SuccessResponse<>(message, page.getContent(), MetaData.from(page));
    }

    public static ErrorResponse error(String message) {
        return new ErrorResponse(message);
    }

    public static ErrorResponse error(Integer code, String message) {
        return new ErrorResponse(code, message);
    }

    public static ErrorResponse error(Integer code, String message, Object data) {
        return new ErrorResponse(code, message, data);
    }

    public static ErrorResponse error(Integer code, String message, Object data, Object metaData) {
        return ErrorResponse.builder()
                .code(code)
                .message(message)
                .success(false)
                .data(data)
                .metaData(metaData)
                .build();
    }
}
