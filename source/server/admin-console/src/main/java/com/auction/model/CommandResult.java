package com.auction.model;

/** Kết quả trả về sau khi gửi lệnh HALT, RESUME, KICK, CANCEL. */
public record CommandResult(boolean success, String message) {

    public static CommandResult ok(String message) {
        return new CommandResult(true, message);
    }

    public static CommandResult fail(String message) {
        return new CommandResult(false, message);
    }
}