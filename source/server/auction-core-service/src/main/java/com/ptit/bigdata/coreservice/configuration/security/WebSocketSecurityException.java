package com.ptit.bigdata.coreservice.configuration.security;

import lombok.Getter;

@Getter
public class WebSocketSecurityException extends RuntimeException {
    private final String errorCode;

    public WebSocketSecurityException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
}
