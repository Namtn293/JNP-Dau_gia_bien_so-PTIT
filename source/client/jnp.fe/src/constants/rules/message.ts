//Trường bắt buộc điền không được để trống
export const REQUIRED_MESSAGE = "Chưa nhập đủ trường bắt buộc!";

export const INVALID_DOCUMENT_NAME = `Tên tài liệu không hợp lệ`;

export const INVALID_PASSWORD =
  "Mật khẩu chứa tối thiểu 6 ký tự. Bao gồm: số, chữ thường, chữ viết hoa, ký tự đặc biệt";

export const PASSWORD_MESSAGE = {
  PASSWORD_FULL_PREFIX: "Mật khẩu phải bao gồm:",
  MIN_LENGTH: "tối thiểu 6 ký tự",
  LOWERCASE: "chữ thường",
  UPPERCASE: "chữ viết hoa",
  NUMBER: "số",
  SPECIAL_CHAR: "ký tự đặc biệt",
};

//Không được nhập ký tự đặc biệt
export const INVALID_SPECIAL_CHARACTER_MESSAGE = `Trường không đúng định dạng`;

//Chỉ chấp nhận mã màu Hex
export const INVALID_HEX_COLOR_CODE_MESSAGE = "Mã màu không hợp lệ";

//chỉ cho phép nhập mã bắt đầu bằng chữ cái [a-zA-Z], bao gồm chữ cái và số,
//có độ dài từ 2-30 kí tự
export const INVALID_CODE = "Mã không hợp lệ";

export const INVALID_EMAIL = "Email không đúng định dạng.";

//Phone number invalid format.
export const INVALID_PHONE_NUMBER = "Số điện thoại không đúng dịnh dạng.";

//Citizen ID must contain 8-12 characters.
export const INVALID_CITIZEN_ID = "CMND/CCCD phải chứa 12 chữ số.";

export const INVALID_NAME = "Họ tên không đúng định dạng";

export const INVALID_NUMBER = "Không đúng định dạng số";

export const INVALID_PAPER_NAME = "Tên không đúng định dạng";

export const INVALID_ORG =
  "Mã đơn vị chứa 1-30 kí tự, bao gồm chữ số, và - _ .";

export const INVALID_USERNAME =
  "Tên tài khoản từ 3-30 ký tự, bao gồm: a-z, 0-9 dấu “.” và dấu “_”";

//"The confirm password does not match."
export const INVALID_CONFIRM_PASSWORD = "Mật khẩu không khớp.";

export const INVALIDE_AREA = "Diện tích không đúng định dạng";
export const INVALID_ADDRESS = "Địa chỉ không đúng định dạng";
export const INVALID_NOTE = "Ghi chú không đúng định dạng";
export const INVALID_FLOOR_NUMBER = "Số tầng không đúng định dạng";
export const INVALID_BASEMENT_QUANTITY = "Số tầng hầm không đúng định dạng";
export const INVALID_DATE = "Sai định dạng ngày (dd/mm/yyyy)";
export const INVALID_YEAR = "Sai định dạng năm (YYYY)";
export const INVALID_ROOM_NUMBER = "Số phòng không đúng định dạng";
export const INVALID_BUILDING_NAME = "Tên nhà chung cư không đúng định dạng";
export const INVALID_ALLLEY_NAME = "Ngõ không đúng định dạng";
export const INVALID_APARTMENT_NUMBER = "Số nhà không đúng định dạng";
export const INVALID_DETAIL_ADDRESS = "Địa chỉ chi tiết không đúng định dạng";
export const SHARED_ITEM = "Tên hạng mục dùng chung không đúng định dạng";

export const SO_TIEN_TABLE_MESSAGE = "Số tiền vượt quá quy định";
