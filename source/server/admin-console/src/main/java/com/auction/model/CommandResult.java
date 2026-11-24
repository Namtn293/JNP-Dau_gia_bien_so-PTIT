package com.auction.model;

/** Kết quả trả về sau khi gửi lệnh HALT, RESUME, KICK, CANCEL. */
public record CommandResult(boolean success, String message) {

    /** Tạo kết quả lệnh thành công cùng thông báo. */
    public static CommandResult ok(String message) {
        return new CommandResult(true, message);
    }

    /** Tạo kết quả lệnh thất bại cùng thông báo. */
    public static CommandResult fail(String message) {
        return new CommandResult(false, message);
    }
}