//các kí tự việt hoá

//Validate tên tài liệu
export const DOCUMENT_NAME =
  /^(?!(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.[^.]*)?$)[^<>:"/\\|?*\x00-\x1F]*[^<>:"/\\|?*\x00-\x1F\ .]$/;

export const VIET_HOA =
  "ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼẾỀỂưăạảấầẩẫậắằẳẵặẹẻẽềếểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳýỵỷỹ";

//mật khẩu ít nhất 6 ký tự, chứa ít nhất 1 kí tự viết hoa, 1 kí tự thường, 1 kí tự đặc biệt
export const PASSWORD_PATTERN = new RegExp(
  "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{6,}$"
);

//Không chấp nhận ký tự đặc biệt
//Chỉ chấp nhận a-zA-Z0-9, khoảng trắng và _
export const SPECIAL_CHARACTER_PATTERN = /^[a-zA-Z0-9\s_.-]*$/;
//Mã không bao gồm khoảng cách và ký tự Tiếng Việt có dấu, tối đa 50 ký tự
export const MA_PATTERN = /^[a-zA-Z0-9_\-.]+$/;
//Chỉ chấp nhận chuỗi bắt đầu bằng # và 6 kí tự tiếp theo a-fA-F0-9
export const HEX_COLOR_CODE_PATTERN = /^#[0-9A-F]{6}$/i;

//cho phép nhập chuỗi bao gồm chữ, số, và các kí tự -_. có độ dài từ 2-30 kí tự
export const CODE_PATTERN = /^[A-Za-z0-9][a-zA-Z0-9-_.]{1,29}$/;

///số điện thoại bao gồm 10 hoặc 11 số bắt đầu bằng số 0
export const PHONE_NUMBER_PATTERN = new RegExp("^[0][1-9][0-9]{8,9}$");

///CMND/CCCD chỉ bao gồm số, dài từ 12 số
export const CITIZEN_ID_PATTERN = /^[0-9]{12}$/;

//họ tên dài từ 3 đến 50 ký tự, không bao gồm số ký tự đặc biệt
export const NAME_PATTERN = new RegExp(`^[a-zA-Z0-9  ${VIET_HOA}]{3,50}$`);

export const NUMBER_PATTERN = /^[0-9.]+$/;

///mã đơn vị dài từ 1-30 kí tự, bắt đầu bằng chữ cái, chỉ bao gồm chữ, số, và các kí tự: - _ .
export const ORG_PATTERN = new RegExp("^[A-Za-z0-9][a-zA-Z0-9-_.]{0,29}$");

///tên đơn vị dài từ 1 đến 2000 ký tự, không bao gồm số ký tự đặc biệt
export const ORG_NAME_PATTERN = new RegExp(
  `^[a-zA-Z0-9-_./ ${VIET_HOA}]{1,200}$`
);

///username dài từ 3-30 kí tự, bắt đầu bằng chữ cái, chỉ bao gồm chữ, số, và - _ .
export const USERNAME_PATTERN = new RegExp("^[A-Za-z][a-zA-Z0-9-_.]{2,29}$");

//format date DD/MM/YYYY
export const DATE = /^(0?[1-9]|[12][0-9]|3[01])[/-](0?[1-9]|1[012])[/-]\d{4}$/;

//diện tích chỉ cho phép số và dấu chấm động
export const AREA = new RegExp("^[0-9]+([.]?[0-9]*)?$");

///Địa chỉ có độ dài từ 3-200 ký tự, bao gồm chứ, số, và các ký tự: -_.,/
export const ADDRESS = NAME_PATTERN;

export const NOTE = new RegExp(`^[a-zA-Z0-9-_.,/& ${VIET_HOA}]*$`);

export const QUANTITY = new RegExp("^[1-9][0-9]*$");

//format year YYYY
export const YEAR = new RegExp("^(?:[0-9]{2})[0-9]{2}$");

/** Pattern Giới hạn số tiền */
export const SO_TIEN_TABLE = /^[\d]{0,10}$/;
/** Pattern Giới hạn tổng số tiền khuyến mãi */
export const SO_TIEN_PROMOTION = /^[\d]{0,20}$/;
/** Độ dài họ tên 80 ký tự */
export const NAME_80_PATTERN = new RegExp(`^[a-zA-Z0-9  ${VIET_HOA}]{0,80}$`);
