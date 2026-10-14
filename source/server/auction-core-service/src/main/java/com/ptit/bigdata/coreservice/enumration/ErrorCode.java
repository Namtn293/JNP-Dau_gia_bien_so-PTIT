package com.ptit.bigdata.coreservice.enumration;

public enum ErrorCode {
    USER_ALREADY_EXIST("409", "User already exist"),
    FORBIDDEN("403", "You do not have permission to perform this action"),
    TOKEN_NOT_CORRECT("401", "Token not correct"),
    USER_NOT_ALREADY_EXIST("409", "User not already exist"),
    USER_NOT_FOUND("404", "User not found"),
    PASSWORD_NOT_CORRECT("401", "Password not correct"),
    TOKEN_NOT_EXIST("404", "Token not exist"),
    TOKEN_EXPIRED("401", "Token expired"),
    TOKEN_INVAlID("401", "Token invalid"),
    ACCOUNT_BANNED("403", "Tài khoản đã bị cấm"),
    EMAIL_EXISTS("409", "Email đã tồn tại trong hệ thống"),
    PHONE_NUMBER_EXISTS("409", "Số điện thoại đã được đăng ký"),
    GOOGLE_AUTH_FAILED("401", "Xác thực Google không thành công"),
    INVALID_TEMP_TOKEN("401", "Token tạm thời không hợp lệ hoặc đã hết hạn");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
