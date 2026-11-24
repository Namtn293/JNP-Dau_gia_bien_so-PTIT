package com.auction.model;

public enum ConnectionState {
    CONNECTED("Đã kết nối"),
    DISCONNECTED("Mất kết nối");

    private final String label;

    ConnectionState(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    @Override
    public String toString() {
        return label;
    }
}
