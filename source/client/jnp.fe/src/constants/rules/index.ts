import * as message from "./message";
import * as pattern from "./pattern";

/** @description Trường bắt buộc điền không được để trống */
export const REQUIRED = {
  required: true,
  message: message.REQUIRED_MESSAGE,
};

/**
 * @description Validate tên tài liệu ko được phép chứa 1 trong các kí tự /\:*?"<>|
 */
export const DOCUMENT_NAME = {
  pattern: pattern.DOCUMENT_NAME,
  message: message.INVALID_DOCUMENT_NAME,
};

export const PASSWORD = {
  pattern: pattern.PASSWORD_PATTERN,
  message: message.INVALID_PASSWORD,
};

export const PASSWORD_RULE = {
  validator(_: any, value: string) {
    if (!value) {
      return Promise.resolve();
    }

    const missing: string[] = [];

    if (value.length < 6) {
      missing.push(message.PASSWORD_MESSAGE.MIN_LENGTH);
    }

    if (!/[a-z]/.test(value)) {
      missing.push(message.PASSWORD_MESSAGE.LOWERCASE);
    }

    if (!/[A-Z]/.test(value)) {
      missing.push(message.PASSWORD_MESSAGE.UPPERCASE);
    }

    if (!/[0-9]/.test(value)) {
      missing.push(message.PASSWORD_MESSAGE.NUMBER);
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      missing.push(message.PASSWORD_MESSAGE.SPECIAL_CHAR);
    }

    // ✅ Đủ hết
    if (missing.length === 0) {
      return Promise.resolve();
    }

    // 🔹 Nhiều lỗi → show dạng full (nhưng đã loại trừ cái đúng)
    return Promise.reject(
      `${message.PASSWORD_MESSAGE.PASSWORD_FULL_PREFIX} ${missing.join(", ")}`
    );
  },
};

/**
 * @description Không chấp nhận ký tự đặc biệt, chỉ chấp nhận a-zA-Z0-9, khoảng trắng và _
 */
export const SPECIAL_CHARACTER = {
  pattern: pattern.SPECIAL_CHARACTER_PATTERN,
  message: message.INVALID_SPECIAL_CHARACTER_MESSAGE,
};

/**
 * @description Chỉ chấp nhận mã màu HEX bắt đầu bằng # và 6 kí tự tiếp theo phải thuộc a-fA-F0-9
 * @description Example: #00a9fc
 * */
export const HEX_COLOR_CODE = {
  pattern: pattern.HEX_COLOR_CODE_PATTERN,
  message: message.INVALID_HEX_COLOR_CODE_MESSAGE,
};

export const CODE_FORMAT = {
  pattern: pattern.CODE_PATTERN,
  message: message.INVALID_CODE,
};

export const EMAIL_FORMAT = {
  type: "email" as any,
  message: message.INVALID_EMAIL,
};

export const PHONE_NUMBER_FORMAT = {
  pattern: pattern.PHONE_NUMBER_PATTERN,
  message: message.INVALID_PHONE_NUMBER,
};

export const CITIZEN_ID_FORMAT = {
  pattern: pattern.CITIZEN_ID_PATTERN,
  message: message.INVALID_CITIZEN_ID,
};

export const NAME_FORMAT = {
  pattern: pattern.NAME_PATTERN,
  message: message.INVALID_NAME,
};

export const NUMBER_FORMAT = {
  pattern: pattern.NUMBER_PATTERN,
  message: message.INVALID_NUMBER,
};

export const PAPER_NAME_FORMAT = {
  pattern: pattern.NAME_PATTERN,
  message: message.INVALID_PAPER_NAME,
};

export const PAPER_NUMBER_FORMAT = {
  pattern: pattern.NUMBER_PATTERN,
  message: "Sai định dạng",
};

/**
 * @description Validate mã tổ chức, dài từ 1-30 kí tự, bắt đầu bằng chữ cái
 * , chỉ bao gồm chữ, số, và các kí tự: - _ .
 * */
export const ORG_FORMAT = {
  pattern: pattern.ORG_PATTERN,
  message: message.INVALID_ORG,
};

/** @description Validate tên tổ chức. */
export const ORG_NAME_FORMAT = {
  pattern: pattern.ORG_NAME_PATTERN,
  message: message.INVALID_PAPER_NAME,
};

/** @description Validate tài khoản đăng nhập. */
export const USER_NAME_FORMAT = {
  pattern: pattern.USERNAME_PATTERN,
  message: message.INVALID_USERNAME,
};

/** @description Validate mật khẩu. */
export const PASSWORD_FORMAT = {
  pattern: pattern.PASSWORD_PATTERN,
  message: message.INVALID_PASSWORD,
};

/**  @description Validate số tiền */
export const SO_TIEN_VALIDATE = {
  pattern: pattern.SO_TIEN_TABLE,
  message: message.SO_TIEN_TABLE_MESSAGE,
};

/**  @description Validate số tiền */
export const SO_TIEN_PROMOTION = {
  pattern: pattern.SO_TIEN_PROMOTION,
  message: message.SO_TIEN_TABLE_MESSAGE,
};

export const WHITE_SPACE = {
  whitespace: true,
  message: "Vui lòng không nhập khoảng trắng",
};
