package com.auction.udp.protocol;

/** Gói tin sai định dạng hoặc thiếu trường bắt buộc. */
public class ProtocolException extends RuntimeException {
    public ProtocolException(String message) {
        super(message);
    }
}