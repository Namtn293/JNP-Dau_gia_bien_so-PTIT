package com.auction.model;

public enum ConnectionState {
    CONNECTED("Đã kết nối"),
    OFFLINE("Mất kết nối");

    private final String label;

    /** Khởi tạo đối tượng dữ liệu với các giá trị được cung cấp. */
    ConnectionState(String label) {
        this.label = label;
    }

    /** Trả về nhãn tiếng Việt của giá trị hiện tại. */
    public String label() {
        return label;
    }

    /** Trả về chuỗi dùng để hiển thị đối tượng. */
    @Override
    public String toString() {
        return label;
    }
}
