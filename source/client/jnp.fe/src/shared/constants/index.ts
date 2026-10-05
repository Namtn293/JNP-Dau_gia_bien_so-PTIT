export * from "./common";
export * from "./permissionUser";

export const SERVICE_ADMIN_PREFIX = "/admin/api"; // service admin prefix
export const SERVICE_VBQPPL_PREFIX = SERVICE_ADMIN_PREFIX; // service văn bản quy phạm pháp luật prefix
export const SERVICE_QLDMDL_PREFIX = SERVICE_ADMIN_PREFIX; // service quản lý danh mục dùng chung prefix
export const SERVICE_QLTH_PREFIX = SERVICE_ADMIN_PREFIX; // service quản lý tích hợp prefix
export const SERVICE_XLHS_PREFIX = SERVICE_ADMIN_PREFIX; // service xử lý hồ sơ prefix
export const SERVICE_PAKN_PREFIX = SERVICE_ADMIN_PREFIX; // service xử lý phản ánh kiến nghị prefix

// số điện thoại
export const VIETNAM_DIAL_CODE = "84";
export const VIETNAM_PHONE_LENGTH = 9;
export const MIN_PHONE_LENGTH = 4;
export const MAX_E164_LENGTH = 15;
export const VIETNAM_VALID_PREFIXES = /^[35789]/;

export const DIGITS_ONLY_RE = /^\d+$/;
export const NON_DIGIT_RE = /\D/g;

export const TRANG_THAI_HOAT_DONG = {
  true: { color: "success", label: "Hoạt động" },
  false: { color: "error", label: "Không hoạt động" },
} as const;

export const TRANG_THAI_OPTIONS = [
  { value: true, label: "Hoạt động" },
  { value: false, label: "Không hoạt động" },
];

export const TRANG_THAI_HIEU_LUC = {
  true: { color: "success", label: "Có Hiệu Lực" },
  false: { color: "error", label: "Không Hiệu Lực" },
} as const;
