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
    INVALID_TEMP_TOKEN("401", "Token tạm thời không hợp lệ hoặc đã hết hạn"),

    // Auction & Bidding Errors
    AUCTION_NOT_FOUND("404", "Phiên đấu giá không tồn tại"),
    AUCTION_NOT_LIVE("400", "Phiên đấu giá chưa mở hoặc đã kết thúc"),
    AUCTION_NOT_REGISTERED("403", "Bạn chưa đăng ký (cọc) để tham gia đấu giá phiên này"),
    ALREADY_LEADING("400", "Bạn đang là người dẫn giá cao nhất"),
    BID_TOO_LOW("400", "Giá đặt phải lớn hơn hoặc bằng mức giá tối thiểu"),
    BID_INVALID_STEP("400", "Bước giá đặt không đúng quy định"),
    BID_UNAUTHORIZED("401", "Yêu cầu đăng nhập để đặt giá"),
    CHAT_BIDDER_ONLY("403", "Chỉ người tham gia đấu giá mới có quyền gửi tin nhắn"),

    // Wallet & Registration Errors
    WALLET_INSUFFICIENT("400", "Số dư khả dụng trong ví không đủ"),
    TOPUP_INVALID_AMOUNT("400", "Số tiền nạp không hợp lệ (phải > 0 và <= hạn mức)"),
    ALREADY_REGISTERED("400", "Bạn đã đăng ký tham gia phiên này rồi"),
    REGISTRATION_CLOSED("400", "Phiên đã đóng đăng ký"),
    NOT_REGISTERED("400", "Bạn chưa đăng ký tham gia phiên này"),
    WALLET_NOT_FOUND("404", "Không tìm thấy ví người dùng"),

    // Auto-bid Errors
    AUTOBID_NOT_ALLOWED("403", "Chỉ người đấu giá chính thức mới được bật tự động trả giá"),
    AUTOBID_MAX_TOO_LOW("400", "Giá trần phải lớn hơn hoặc bằng mức giá tối thiểu kế tiếp"),
    AUTOBID_NOT_FOUND("404", "Không tìm thấy cấu hình tự động trả giá"),

    // Announcement & Shill Alert Errors
    ANNOUNCEMENT_NOT_FOUND("404", "Không tìm thấy thông báo phòng"),
    SHILL_ALERT_NOT_FOUND("404", "Không tìm thấy cảnh báo thổi giá");

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
