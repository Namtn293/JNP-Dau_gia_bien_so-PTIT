//libs
import dayjs from "dayjs";

//others
import * as message from "../../constants/rules/message";
import {
  MAX_E164_LENGTH,
  MIN_PHONE_LENGTH,
  VIETNAM_DIAL_CODE,
  VIETNAM_PHONE_LENGTH,
  VIETNAM_VALID_PREFIXES,
} from "../constants";

type RuleCheck = (value: string) => string | null;

export const runSequentialRules = (value: string, rules: RuleCheck[]) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return Promise.reject(new Error(error));
  }
  return Promise.resolve();
};

export const rulesCheck = {
  required:
    (label: string): RuleCheck =>
    (v) => {
      if (!v) return `Vui lòng nhập ${label}!`;
      if (dayjs.isDayjs(v))
        return v.isValid() ? null : `Vui lòng nhập ${label}!`;
      return !String(v ?? "").trim() ? `Vui lòng nhập ${label}!` : null;
    },

  noSpace: (): RuleCheck => (v) =>
    v && v.trimStart() !== v ? "Không được để khoảng trắng ở đầu!" : null,

  max:
    (label: string, count: number): RuleCheck =>
    (v) =>
      v && v.length > count
        ? `${label} không được vượt quá ${count} ký tự!`
        : null,

  noNumber:
    (msg: string): RuleCheck =>
    (v) =>
      /\d/.test(v) ? msg : null,

  noSpecial:
    (msg: string): RuleCheck =>
    (v) =>
      !/^[a-zA-Z0-9ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼẾỀỂưăạảấầẩẫậắằẳẵặẹẻẽềếểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳýỵỷỹ\s_]*$/.test(
        v,
      )
        ? msg
        : null,

  isPhone:
    (msg: string, label = "Số điện thoại"): RuleCheck =>
    (v) => {
      if (!v) return null;
      if (v.length > 15) {
        return `${label} không được vượt quá 15 ký tự!`;
      }
      const phoneRegex = /^[\+\d\s]{1,15}$/;
      return phoneRegex.test(v) ? null : msg;
    },

  noSQL:
    (label?: string): RuleCheck =>
    (v) => {
      if (!v) return null;
      const sqlPattern =
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC(UTE)?|UNION(\s+ALL)?|TRUNCATE|MERGE|DECLARE|CAST|CONVERT|FETCH|HAVING|GRANT|REVOKE|REPLACE|CALL)\b)|(--|;|\/\*|\*\/|xp_|0x[0-9a-fA-F]+)/i;
      return sqlPattern.test(v)
        ? `${label || "Nội dung"} chứa ký tự SQL!`
        : null;
    },

  // chặn xss
  noXSS:
    (label?: string): RuleCheck =>
    (v) => {
      if (!v || typeof v !== "string") return null;

      const value = v.trim();

      // Kiểm tra thẻ HTML thực sự
      const htmlTagRegex = /<\/?[a-z][\w-]*\b[^>]*>/i;

      // Kiểm tra protocol nguy hiểm như javascript:
      const jsProtocolRegex = /\bjavascript\s*:/i;

      // Kiểm tra inline event handler như onclick=, onerror=
      const eventHandlerRegex = /\son\w+\s*=/i;

      // Kiểm tra các thẻ nguy hiểm như script, iframe, object, embed, style, link, meta
      const dangerousTagRegex =
        /<(script|iframe|object|embed|style|link|meta)\b/i;

      if (
        htmlTagRegex.test(value) ||
        jsProtocolRegex.test(value) ||
        eventHandlerRegex.test(value) ||
        dangerousTagRegex.test(value)
      ) {
        return `${label || "Nội dung"} không được chứa HTML hoặc script!`;
      }

      return null;
    },
  // ngày tháng
  isValidDate:
    (msg: string): RuleCheck =>
    (v) => {
      if (!v) return null;
      return dayjs(v).isValid() ? null : msg;
    },

  //  validate số âm
  noNegative:
    (msg: string): RuleCheck =>
    (v) =>
      v && Number(v) < 0 ? msg : null,
  //  chỉ đc nhập số bao gồm số thập phân
  isNumeric:
    (msg: string): RuleCheck =>
    (v) => {
      if (!v) return null;
      return !/^\d*\.?\d*$/.test(v.toString()) ? msg : null;
    },

  isGreaterThanZero:
    (msg: string): RuleCheck =>
    (v) => {
      if (!v) return null;
      return Number(v) <= 0 ? msg : null;
    },

  // Validate định dạng CCCD (12 số)
  isCCCD:
    (msg: string): RuleCheck =>
    (v) => {
      if (!v) return null;
      return /^[a-zA-Z0-9]{8,12}$/.test(v) ? null : msg;
    },

  isMaInternetFormat:
    (msg: string): RuleCheck =>
    (v) => {
      if (!v) return null;
      return /^\.[a-zA-Z]+(\.[a-zA-Z]+)*$/.test(v) ? null : msg;
    },

  isTaxCode:
    (msg: string): RuleCheck =>
    (v) => {
      if (!v) return null;
      const taxCodeRegex = /^(\d{10}|\d{10}-\d{3})$/;
      return taxCodeRegex.test(v) ? null : msg;
    },

  isIP:
    (msg: string): RuleCheck =>
    (v) => {
      if (!v) return null;
      return !/^[0-9.]*$/.test(v) ? msg : null;
    },

  isTaxOrBusinessCode: (): RuleCheck => (v) => {
    if (!v) return null;
    const regex = /^[0-9-]{1,14}$/;
    return regex.test(v) ? null : "Tối đa 14 ký tự gồm số và dấu gạch ngang";
  },

  isMaToChuc:
    (msg: string): RuleCheck =>
    (v) => {
      if (!v) return null;
      // Regex \s kiểm tra bất kỳ ký tự khoảng trắng nào
      return /\s/.test(v) ? msg : null;
    },

  isEmail:
    (msg: string): RuleCheck =>
    (v) => {
      if (!v) return null;

      // Regex đủ dùng cho 99% case thực tế
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}$/;

      return emailRegex.test(v) ? null : msg;
    },

  isAtLeast18Years:
    (msg: string): RuleCheck =>
    (v) => {
      if (!v) return null;

      const date = dayjs(v);
      if (!date.isValid()) return msg;

      const minDate = dayjs().subtract(18, "year");

      return date.isAfter(minDate, "day") ? msg : null;
    },

  //  chặn 3 lần cách liên tiếp
  noTripleSpace:
    (msg: string): RuleCheck =>
    (v) =>
      v && /\s{3,}/.test(v) ? msg : null,

  // Chỉ cho phép số
  isOnlyDigits:
    (msg: string): RuleCheck =>
    (v) =>
      v && !/^[0-9]+$/.test(v) ? msg : null,

  // Cho phép chữ, số và dấu gạch ngang (-)
  isTextAndDash:
    (msg: string): RuleCheck =>
    (v) =>
      v && !/^[a-zA-Z0-9\-]+$/.test(v) ? msg : null,

  containsWhitespace:
    (msg: string): RuleCheck =>
    (v) =>
      v && /\s/.test(v) ? msg : null,

  isOnlyLettersAndDots:
    (msg: string): RuleCheck =>
    (v) =>
      v && !/^\.[a-zA-Z]+(\.[a-zA-Z]+)*$/.test(v) ? msg : null,

  // Mã điện thoại: Chỉ bắt đầu bằng + và theo sau là số
  isPhoneCode:
    (msg: string): RuleCheck =>
    (v) =>
      v && !/^\+[0-9]+$/.test(v) ? msg : null,

  noFutureDate:
    (msg: string): RuleCheck =>
    (v) => {
      if (!v) return null;
      return dayjs(v).isAfter(dayjs(), "day") ? msg : null;
    },
  noSpaceAndVietnamese:
    (msg: string): RuleCheck =>
    (v) => {
      if (!v) return null;
      return !/^[!-~]+$/.test(v) ? msg : null;
    },
  isCodeFormat:
    (
      msg = "Chỉ được nhập chữ, số, dấu gạch dưới (_) và dấu gạch ngang (-)",
    ): RuleCheck =>
    (v) =>
      // !/^[a-zA-Z0-9\-_]*$/.test(v) ? msg : null,
      // Cho phép:
      // - chữ không dấu a-z A-Z
      // - số 0-9
      // - ký tự đặc biệt
      //
      // Không cho phép:
      // - khoảng trắng
      // - tiếng Việt có dấu

      !/^[A-Za-z0-9!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]*$/.test(v)
        ? msg
        : null,
  maxWords:
    (count: number, msg?: string): RuleCheck =>
    (v) => {
      if (!v) return null;
      if (v.length > count) {
        if (!msg) return `Nội dung không được vượt quá ${count} ký tự!`;
        if (msg.includes("không được vượt quá")) return msg;
        return `${msg} không được vượt quá ${count} ký tự!`;
      }
      return null;
    },
  maxNums:
    (count: number, msg?: string): RuleCheck =>
    (v) => {
      if (!v) return null;
      if (String(v).length > count) {
        return msg ?? `Giá trị không được vượt quá ${count} ký tự!`;
      }
      return null;
    },
  maxValueNums:
    (maxVal: number, msg?: string): RuleCheck =>
    (v) => {
      if (v === undefined || v === null || v === "") return null;
      const trimmed = String(v).trim();
      if (!/^\d+$/.test(trimmed)) {
        if (!msg) return `Giá trị chỉ được nhập ký tự số!`;
        return `${msg} chỉ được nhập ký tự số!`;
      }
      if (Number(trimmed) > maxVal) {
        if (!msg) return `Giá trị không được vượt quá ${maxVal}!`;
        if (msg.includes("không được vượt quá")) return msg;
        return `${msg} không được vượt quá ${maxVal}!`;
      }
      return null;
    },

  validateRangeHelper: (from: any, to: any, label: string = "Giá trị"): any => {
    if (
      from === undefined ||
      from === null ||
      from === "" ||
      to === undefined ||
      to === null ||
      to === ""
    ) {
      return "";
    }

    let isGreater = false;

    if (dayjs.isDayjs(from) && dayjs.isDayjs(to)) {
      isGreater = from.isAfter(to);
    } else if (!isNaN(Number(from)) && !isNaN(Number(to))) {
      isGreater = Number(from) > Number(to);
    } else {
      isGreater = from > to;
    }

    if (isGreater) {
      return `${label} từ không được lớn hơn ${label.toLowerCase()} đến!`;
    }

    return "";
  },
};

export const validateRules = {
  name: (label: string) => ({
    validator: (_: any, value: string) =>
      runSequentialRules(value, [
        rulesCheck.required(label),
        rulesCheck.noXSS(label),
        // rulesCheck.noSQL(label),
        // rulesCheck.noNumber(`${label} không được chứa số!`),
        // rulesCheck.noSpecial(`${label} không được chứa ký tự đặc biệt!`),

        rulesCheck.max(label, 255),
      ]),
  }),

  password: (label: string) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value !== undefined && value !== null ? String(value) : "";

      // Chạy các rule cơ bản trước
      return runSequentialRules(stringValue, [rulesCheck.max(label, 255)]).then(
        () => {
          // Sau khi pass hết → kiểm tra độ mạnh password
          if (!stringValue) return Promise.resolve();

          const missing: string[] = [];
          if (stringValue.length < 6) {
            missing.push(message.PASSWORD_MESSAGE.MIN_LENGTH);
          }
          if (!/[a-z]/.test(stringValue)) {
            missing.push(message.PASSWORD_MESSAGE.LOWERCASE);
          }
          if (!/[A-Z]/.test(stringValue)) {
            missing.push(message.PASSWORD_MESSAGE.UPPERCASE);
          }
          if (!/[0-9]/.test(stringValue)) {
            missing.push(message.PASSWORD_MESSAGE.NUMBER);
          }
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(stringValue)) {
            missing.push(message.PASSWORD_MESSAGE.SPECIAL_CHAR);
          }

          if (missing.length === 0) return Promise.resolve();

          return Promise.reject(
            `${message.PASSWORD_MESSAGE.PASSWORD_FULL_PREFIX} ${missing.join(", ")}`,
          );
        },
      );
    },
  }),

  nameWithMax: (
    label: string,
    max: number = 255,
    required: boolean = true,
  ) => ({
    validator: (_: any, value: string) =>
      runSequentialRules(value, [
        ...(required ? [rulesCheck.required(label)] : []),
        rulesCheck.noXSS(label),
        // rulesCheck.noSQL(label),

        rulesCheck.max(label, max),
      ]),
  }),

  code: (label: string) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value === undefined || value === null ? "" : String(value);
      const trimmedValue = stringValue.trim();

      if (!trimmedValue) {
        // Rule 'code' ban đầu không bắt buộc (comment required), nên nếu rỗng bỏ qua
        return Promise.resolve();
      }

      return runSequentialRules(trimmedValue, [
        // rulesCheck.required(label),
        rulesCheck.noSpaceAndVietnamese(
          "Mã không bao gồm khoảng trắng và tiếng Việt có dấu.",
        ),
        rulesCheck.noSpecial(`${label} không được chứa ký tự đặc biệt!`),
        rulesCheck.max(label, 50),
      ]);
    },
  }),

  nameVB: (label: string) => ({
    validator: (_: any, value: string) =>
      runSequentialRules(value, [
        rulesCheck.noXSS(label),
        // rulesCheck.noSQL(label),
        // rulesCheck.required(label),
        // rulesCheck.noNumber(`${label} không được chứa số!`),
        // rulesCheck.noSpecial(`${label} không được chứa ký tự đặc biệt!`),

        rulesCheck.max(label, 255),
      ]),
  }),

  ma: (label: string, maxlength: number = 50) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value === undefined || value === null ? "" : String(value);
      const trimmedValue = stringValue.trim();

      if (!trimmedValue) {
        return Promise.reject(new Error(`Vui lòng nhập ${label}!`));
      }

      return runSequentialRules(trimmedValue, [
        rulesCheck.noXSS(label),
        // rulesCheck.noSQL(label),

        // rulesCheck.noNumber(`${label} không được chứa số!`),
        // rulesCheck.noSpecial(`${label} không được chứa ký tự đặc biệt!`),
        rulesCheck.isCodeFormat(
          "Mã không bao gồm khoảng trắng và tiếng Việt có dấu.",
        ),
        rulesCheck.max(label, maxlength),
      ]);
    },
  }),

  maToChuc: (label: string) => ({
    validator: (_: any, value: string) =>
      runSequentialRules(value, [
        rulesCheck.required(label),
        rulesCheck.noXSS(label),
        rulesCheck.isMaToChuc(`${label} không được chứa khoảng trắng!`),
        rulesCheck.max(label, 50),
      ]),
  }),

  soDangKyKinhDoanh: (label: string) => ({
    validator: (_: any, value: string) =>
      runSequentialRules(value, [
        rulesCheck.required(label),
        rulesCheck.isTaxOrBusinessCode(),
      ]),
  }),

  maCode: (label: string) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value === undefined || value === null ? "" : String(value);
      const trimmedValue = stringValue.trim();

      if (!trimmedValue) {
        return Promise.reject(new Error(`Vui lòng nhập ${label}!`));
      }

      return runSequentialRules(trimmedValue, [
        rulesCheck.noXSS(label),
        rulesCheck.isCodeFormat(
          "Mã không bao gồm khoảng trắng và tiếng Việt có dấu.",
        ),
        rulesCheck.max(label, 50),
      ]);
    },
  }),

  tenOther: (label: string, maxlengh?: number) => ({
    validator: (_: any, value: string) =>
      runSequentialRules(value, [
        rulesCheck.required(label),
        rulesCheck.noXSS(label),

        rulesCheck.max(label, maxlengh || 255),
      ]),
  }),

  number: (label: string, count?: number) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value !== undefined && value !== null ? String(value) : "";

      return runSequentialRules(stringValue, [
        rulesCheck.required(label),
        // rulesCheck.noNegative(`${label} không được là số âm!`),
        rulesCheck.isNumeric(`${label} phải là chữ số!`),

        rulesCheck.max(label, count || 30),
      ]);
    },
  }),

  numberOptional: (label: string) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value !== undefined && value !== null ? String(value) : "";

      return runSequentialRules(stringValue, [
        rulesCheck.isNumeric(`${label} không đúng định dạng số!`),

        rulesCheck.max(label, 30),
      ]);
    },
  }),
  numberGreaterThanZero: (label: string) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value !== undefined && value !== null ? String(value) : "";

      return runSequentialRules(stringValue, [
        rulesCheck.required(label),
        rulesCheck.isNumeric(`${label} không đúng định dạng số!`),
        rulesCheck.isGreaterThanZero(`${label} phải lớn hơn 0!`),

        rulesCheck.max(label, 30),
      ]);
    },
  }),
  numberGreaterThanZeroOptional: (label: string) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value !== undefined && value !== null ? String(value) : "";

      return runSequentialRules(stringValue, [
        rulesCheck.isNumeric(`${label} không đúng định dạng số!`),
        rulesCheck.isGreaterThanZero(`${label} phải lớn hơn 0!`),

        rulesCheck.max(label, 30),
      ]);
    },
  }),
  // Rule chỉ kiểm tra định dạng ngày tháng
  date: (label: string) => ({
    validator: (_: any, value: any) =>
      runSequentialRules(value, [
        rulesCheck.required(label),
        rulesCheck.noFutureDate(`${label} không được là ngày trong tương lai!`),
        rulesCheck.isValidDate(`${label} không đúng định dạng ngày tháng!`),
      ]),
  }),
  phone: (label: string) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value !== undefined && value !== null ? String(value) : "";
      return runSequentialRules(stringValue, [
        // rulesCheck.required(label),
        rulesCheck.isPhone(`${label} không đúng định dạng`, label),
      ]);
    },
  }),

  // Thêm validate sdt theo từng quốc gia
  phoneDropdown: (label: string, prefix?: string) => ({
    validator(_: any, value: any) {
      const stringValue = value ? String(value) : "";
      if (stringValue.length === 0) return Promise.resolve();

      const normalized = stringValue.replace(/^0+/, "");
      const len = normalized.length;

      const dialCode = (prefix ?? "+84").replace(/^\+/, "");
      const isVN = dialCode === "84";

      if (isVN) {
        if (len !== 9) {
          return Promise.reject(
            new Error(`Vui lòng nhập ${label.toLowerCase()} gồm 9 số.`),
          );
        }
        return Promise.resolve();
      }

      if (len < 4 || len > 14) {
        return Promise.reject(
          new Error(`Vui lòng nhập ${label.toLowerCase()} gồm 4 - 14 số.`),
        );
      }
      return Promise.resolve();
    },
  }),

  phoneVnNoDropdown: (label: string) => ({
    validator(_: any, value: any) {
      const stringValue = value ? String(value) : "";
      const len = stringValue.length;
      if (len === 0) return Promise.resolve();

      if (len !== 10) {
        return Promise.reject(
          new Error(`Vui lòng nhập ${label.toLowerCase()} gồm 10 số.`),
        );
      }
      return Promise.resolve();
    },
  }),

  phoneIntlNoDropdown: (label: string) => ({
    validator(_: any, value: any) {
      const stringValue = value ? String(value) : "";
      const len = stringValue.length;
      if (len === 0) return Promise.resolve();

      if (len < 4 || len > 15) {
        return Promise.reject(
          new Error(`Vui lòng nhập ${label.toLowerCase()} gồm 4 - 15 số.`),
        );
      }
      return Promise.resolve();
    },
  }),

  ngayCapDuTuoi: (label: string) => ({
    validator: (_: any, value: any) =>
      runSequentialRules(value, [
        // rulesCheck.required(label),
        rulesCheck.noFutureDate(`${label} không được là ngày trong tương lai!`),
        rulesCheck.isAtLeast18Years(`${label} phải đủ 18 tuổi trở lên!`),
      ]),
  }),

  ngayCap: (label: string) => ({
    validator: (_: any, value: any) =>
      runSequentialRules(value, [
        // rulesCheck.required(label),
        rulesCheck.noFutureDate(`${label} không được là ngày trong tương lai!`),
        // rulesCheck.isAtLeast18Years(`${label} phải đủ 18 tuổi trở lên!`),
      ]),
  }),

  ngayBanHanh: (label: string) => ({
    validator: (_: any, value: any) =>
      runSequentialRules(value, [
        rulesCheck.required(label),
        // rulesCheck.noFutureDate(`${label} không được là ng ày trong tương lai!`),
        // rulesCheck.isAtLeast18Years(`${label} phải đủ 18 tuổi trở lên!`),
      ]),
  }),

  ngayBanHanhChanNgayTuongLai: (label: string) => ({
    validator: (_: any, value: any) => {
      if (value === null || value === undefined || value === "") {
        return Promise.reject(new Error(`Vui lòng nhập ${label}!`));
      }

      let dateValue = dayjs(value);

      // Nếu value là chuỗi định dạng DD/MM/YYYY, ta parse thủ công để dayjs hiểu đúng
      if (typeof value === "string") {
        const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (match) {
          const [_, d, m, y] = match;
          dateValue = dayjs(`${y}-${m}-${d}`);
        }
      }

      if (!dateValue.isValid()) {
        return Promise.reject(new Error(`${label} không hợp lệ!`));
      }

      if (dateValue.isAfter(dayjs(), "day")) {
        return Promise.reject(
          new Error(`${label} không được là ngày trong tương lai!`),
        );
      }

      return Promise.resolve();
    },
  }),

  Fax: (label: string) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value !== undefined && value !== null ? String(value) : "";
      const trimmed = stringValue.trim();
      if (!trimmed) return Promise.resolve();

      return runSequentialRules(trimmed, [
        rulesCheck.max(label, 15),
        (v) => {
          const faxRegex = /^[0-9+\(\)\-]+$/;
          return faxRegex.test(v)
            ? null
            : `${label} chỉ bao gồm chữ số, dấu "+", dấu gạch ngang "-" và ngoặc tròn!`;
        },
      ]);
    },
  }),

  ip: (label: string) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value !== undefined && value !== null ? String(value) : "";
      return runSequentialRules(stringValue, [
        rulesCheck.isIP(`${label} không đúng định dạng!`),
      ]);
    },
  }),

  email: (label: string) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value !== undefined && value !== null ? String(value) : "";

      return runSequentialRules(stringValue, [
        // rulesCheck.required(label),

        rulesCheck.max(label, 255),
        rulesCheck.isEmail(
          `${label.charAt(0).toUpperCase() + label.slice(1)} không đúng định dạng email!`,
        ),
      ]);
    },
  }),

  website: (label: string) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value !== undefined && value !== null ? String(value) : "";

      return runSequentialRules(stringValue, [
        // rulesCheck.noSQL(),
        rulesCheck.noXSS(),

        rulesCheck.max(label, 255),
      ]);
    },
  }),

  ghiChu: (label: string) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value !== undefined && value !== null ? String(value) : "";

      return runSequentialRules(stringValue, [
        rulesCheck.noXSS("Ghi chú không được chứa ký tự đặc biệt!"),

        rulesCheck.max(label, 3000),
      ]);
    },
  }),

  moTa: (label: string) => ({
    validator: (_: any, value: string) =>
      runSequentialRules(value, [
        // rulesCheck.noSQL(label),
        rulesCheck.noXSS(label),

        rulesCheck.max(label, 3000),
      ]),
  }),

  diaChi: (label: string) => ({
    validator: (_: any, value: string) =>
      runSequentialRules(value, [
        rulesCheck.required(label),
        rulesCheck.noXSS(label),
        rulesCheck.max(label, 3000),
      ]),
  }),

  maSoThue: (label: string) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value !== undefined && value !== null ? String(value) : "";

      return runSequentialRules(stringValue, [
        // rulesCheck.required(label),
        rulesCheck.max(label, 14),

        rulesCheck.isTaxOrBusinessCode(),
      ]);
    },
  }),

  isCCCD: (label: string) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value !== undefined && value !== null ? String(value) : "";

      return runSequentialRules(stringValue, [
        rulesCheck.isCCCD(`${label} không đúng định dạng!`),
      ]);
    },
  }),
  maInternet: (label: string) => ({
    validator: (_: any, value: string) =>
      runSequentialRules(value, [
        rulesCheck.noXSS("Mã Internet không được chứa ký tự đặc biệt!"),
        rulesCheck.isMaInternetFormat("Mã Internet không đúng định dạng"),
        rulesCheck.max(label, 255),
      ]),
  }),
  // kiểm tra đúng ký tự/đúng pattern của mã internet
  internetCodeCharacters: (message = "Chỉ được chứa dấu chấm và chữ cái") => ({
    validator: (_: any, value: string) =>
      runSequentialRules(value, [rulesCheck.isOnlyLettersAndDots(message)]),
  }),
  // kiểm tra không có khoảng trắng
  internetCodeNoWhitespace: (
    message = "Mã internet không được chứa khoảng trắng",
  ) => ({
    validator: (_: any, value: string) =>
      runSequentialRules(value, [rulesCheck.containsWhitespace(message)]),
  }),

  cccd: (label: string) => ({
    validator: (_: any, value: any) =>
      validateRules.isCCCD(label).validator(_, value),
  }),

  noSpecial: (label: string) => ({
    validator: (_: any, value: string) =>
      runSequentialRules(value, [
        rulesCheck.noSpecial(`${label} không được chứa ký tự đặc biệt!`),
      ]),
  }),
  maxWords: (count: number, message?: string) => ({
    validator: (_: any, value: string) => {
      const stringValue =
        value === undefined || value === null ? "" : String(value);
      const trimmedValue = stringValue.trim();
      // if (stringValue && !trimmedValue) {
      //   return Promise.reject(
      //     new Error("Vui lòng không nhập toàn khoảng trắng!"),
      //   );
      // }
      return runSequentialRules(trimmedValue, [
        rulesCheck.noXSS(message || "Nội dung không được chứa ký tự đặc biệt!"),
        rulesCheck.maxWords(
          count,
          message || `Nội dung không được vượt quá ${count} ký tự!`,
        ),
      ]);
    },
  }),

  maxNums: (count: number, message?: string) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value === undefined || value === null ? "" : String(value);
      const trimmedValue = stringValue.trim();
      // if (stringValue && !trimmedValue) {
      //   return Promise.reject(
      //     new Error("Vui lòng không nhập toàn khoảng trắng!"),
      //   );
      // }
      return runSequentialRules(trimmedValue, [
        rulesCheck.noXSS(message || "Nội dung không được chứa ký tự đặc biệt!"),
        rulesCheck.maxNums(
          count,
          message || `Giá trị không được vượt quá ${count} ký tự!`,
        ),
      ]);
    },
  }),

  maxValueNums: (maxVal: number, message?: string) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value === undefined || value === null ? "" : String(value);
      const trimmedValue = stringValue.trim();
      return runSequentialRules(trimmedValue, [
        rulesCheck.noXSS(message || "Nội dung không được chứa ký tự đặc biệt!"),
        rulesCheck.maxValueNums(
          maxVal,
          message || `Giá trị không được vượt quá ${maxVal}!`,
        ),
      ]);
    },
  }),

  maRq: (label: string, count?: number) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value === undefined || value === null ? "" : String(value);
      const trimmedValue = stringValue.trim();

      if (!trimmedValue) {
        return Promise.reject(new Error(`Vui lòng nhập ${label}!`));
      }

      return runSequentialRules(trimmedValue, [
        rulesCheck.maxWords(count || 50, label),
        rulesCheck.noXSS(label),
        // rulesCheck.noSQL(label),
        rulesCheck.noSpaceAndVietnamese(
          "Mã không bao gồm khoảng trắng và tiếng Việt có dấu.",
        ),
      ]);
    },
  }),

  /** Nội dung ủy quyền: trim đầu cuối, không cho SQL/XSS, tối đa 3000 ký tự */
  noiDungUyQuyen: () => ({
    validator: (_: any, value: any) => {
      const trimmed: string = (value ?? "").replace(
        /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
        "",
      );
      return runSequentialRules(trimmed, [
        // rulesCheck.noSQL(),
        rulesCheck.noXSS(),
        rulesCheck.maxWords(3000, "Nội dung ủy quyền"),
      ]);
    },
  }),

  maDienThoai: (label: string) => ({
    validator: (_: any, value: any) => {
      const stringValue = value ? String(value) : "";
      return runSequentialRules(stringValue, [
        rulesCheck.required(label),

        rulesCheck.isPhoneCode(
          `${label} phải có định dạng +[Mã quốc gia] (VD: +123)!`,
        ),
        rulesCheck.max(label, 10),
      ]);
    },
  }),

  maBuuChinh: (label: string) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value === undefined || value === null ? "" : String(value).trim();
      return runSequentialRules(stringValue, [
        rulesCheck.required(label),
        // rulesCheck.isTextAndDash(
        //   `${label} chỉ được chứa chữ, số và dấu gạch ngang (-)!`,
        // ),
        rulesCheck.maxNums(10, `${label} tối đa 10 số`),
      ]);
    },
  }),
  // kiểm tra chỉ có chữ số
  digitsOnly: (label: string) => ({
    validator: (_: any, value: any) => {
      const stringValue = value ? String(value) : "";
      return runSequentialRules(stringValue, [
        rulesCheck.required(label),

        rulesCheck.isOnlyDigits(`${label} chỉ được chứa chữ số!`),
      ]);
    },
  }),

  validateHierarchical: (
    form: any,
    listData: any[],
    fieldType: "idCha" | "cap",
  ) => ({
    validator: (_: any, value: any) => {
      if (fieldType === "idCha") {
        const currentCap = form.getFieldValue("cap");
        if (!value) return Promise.resolve();
        const parent = listData.find((item: any) => item.id === value);
        if (
          parent &&
          currentCap !== undefined &&
          parent.cap !== currentCap - 1
        ) {
          return Promise.reject(
            new Error(`Mã cha phải ở cấp ${currentCap - 1}`),
          );
        }
      } else {
        if (value === undefined || value === null) return Promise.resolve();
        if (value < 0)
          return Promise.reject(new Error("Số không được là số âm"));
        const idCha = form.getFieldValue("idCha");
        if (!idCha) return Promise.resolve();
        const parent = listData.find((item: any) => item.id === idCha);
        if (parent && parent.cap !== value - 1) {
          return Promise.reject(
            new Error(
              `Cấp phải là ${parent.cap + 1} (dựa trên mã cha cấp ${parent.cap})`,
            ),
          );
        }
      }
      return Promise.resolve();
    },
  }),
};

/**
 * Bộ rules validate chuyên dùng cho các màn Danh mục trong module Xúc tiến đầu tư (XTDT).
 * Import và sử dụng trực tiếp trong `rules` của formItems.
 *
 * @example
 * import { validateRulesXTDT } from '@shared/utils/validate';
 *
 * rules: [validateRulesXTDT.ma("Mã loại hoạt động")]
 */
export const validateRulesXTDT = {
  /** Mã danh mục: bắt buộc, không ký tự đặc biệt, không khoảng trắng đầu, tối đa 50 ký tự */
  ma: (label: string) => ({
    validator: (_: any, value: any) => {
      const stringValue =
        value === undefined || value === null ? "" : String(value);
      const trimmedValue = stringValue.trim();

      if (!trimmedValue) {
        return Promise.reject(new Error(`Vui lòng nhập ${label}!`));
      }

      return runSequentialRules(trimmedValue, [
        rulesCheck.noSpaceAndVietnamese(
          "Mã không bao gồm khoảng trắng và tiếng Việt có dấu.",
        ),
        rulesCheck.noSpecial(`${label} không được chứa ký tự đặc biệt!`),
        rulesCheck.max(label, 50),
      ]);
    },
  }),

  /** Tên danh mục: bắt buộc, không ký tự đặc biệt, không khoảng trắng đầu, tối đa 255 ký tự */
  ten: (label: string) => ({
    validator: (_: any, value: string) =>
      runSequentialRules(value, [
        rulesCheck.required(label),

        rulesCheck.noSpecial(`${label} không được chứa ký tự đặc biệt!`),
        rulesCheck.max(label, 255),
      ]),
  }),

  /** Mô tả: không bắt buộc, không khoảng trắng đầu, tối đa 500 ký tự */
  moTa: (label: string) => ({
    validator: (_: any, value: string) =>
      runSequentialRules(value, [rulesCheck.max(label, 500)]),
  }),
};

export const normalizeDigits = (value?: string | null) =>
  String(value ?? "").replace(/\D/g, "");

export const normalizePostalCode = (value?: string | null) =>
  String(value ?? "").replace(/[^0-9]/g, "");

export const phoneValidator = (prefix?: string) => ({
  validator(_: unknown, value: string) {
    const len = value?.length ?? 0;
    if (len === 0) return Promise.resolve();

    const dialCode = (prefix ?? "+84").replace(/^\+/, "");
    const isVN = dialCode === VIETNAM_DIAL_CODE;

    if (isVN) {
      if (!VIETNAM_VALID_PREFIXES.test(value)) {
        return Promise.reject(
          new Error("Số điện thoại phải bắt đầu bằng 3, 5, 7, 8 hoặc 9"),
        );
      }
      if (len !== VIETNAM_PHONE_LENGTH) {
        return Promise.reject(
          new Error(
            "Số điện thoại Việt Nam phải có đúng 9 chữ số (không tính mã vùng)",
          ),
        );
      }
      return Promise.resolve();
    }

    if (value.startsWith("0")) {
      return Promise.reject(
        new Error("Số điện thoại không được bắt đầu bằng số 0"),
      );
    }
    const valid = len >= MIN_PHONE_LENGTH && len <= MAX_E164_LENGTH;
    return valid
      ? Promise.resolve()
      : Promise.reject(new Error("Số điện thoại phải có từ 4 đến 15 chữ số"));
  },
});
