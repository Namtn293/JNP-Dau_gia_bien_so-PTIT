package com.ptit.bigdata.coreservice.core.util;

import com.ptit.bigdata.coreservice.enumration.ErrorCode;
import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public String getStatus() {
        return errorCode.getCode();
    }
}
