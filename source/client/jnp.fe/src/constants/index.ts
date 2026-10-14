export * from "./storageKeys"
export * from '@apps/auth/constants'

export const DEBOUNCE_TIME = 500;
export const MIN_DEVICE_WIDTH = 1400; //Chiều rộng tối thiểu màn hình

export const LANGUAGE = {
  VN: "VN", //Tiếng Việt
  EN: "EN", //Tiếng Anh
  CN: "CN", //Tiếng Trung
  JP: "JP", //Tiếng Nhật
  KR: "KR"  //Tiếng Hàn
}

export const LANGUAGE_REQUEST = {
  vi: LANGUAGE['VN'],
  en: LANGUAGE['EN'],
  cn: LANGUAGE['CN'],
  jp: LANGUAGE['JP'],
  kr: LANGUAGE['KR'],
}

export const DATE_FORMAT_YYYYMMdd = 'YYYYMMdd';
export const DATE_FORMAT_YYYY_MM_DD = 'YYYY-MM-DD';
export const DATE_FORMAT_YYYY_MM_dd = 'YYYY-MM-dd';
export const DATE_FORMAT_YYYY_MM_dd_Combined = 'YYYYMMddHHmm';
export const DATE_FORMAT_YYYY_MM_dd_HH_mm = 'YYYY-MM-dd HH:mm';
export const DATE_FORMAT_DD_MM_YYYY = 'DD-MM-YYYY';
export const DATE_FORMAT_DD_MM_YYYY_WITH_DOT = 'DD.MM.YYYY';
export const DATE_FORMAT_MM_DD_YYYY_WITH_SLASH = 'MM/DD/YYYY';
export const DATE_FORMAT_m_d_YYYY_WITH_SLASH = 'M/d/YYYY';
export const DATE_FORMAT_DD_MM_YYYY_WITH_SLASH = 'DD/MM/YYYY';
export const DATE_FORMAT_dd_MMM = 'ddMMM';
export const DATE_FORMAT_dd_MM_yy = 'ddMMyy';
export const DATE_FORMAT_dd_MMM_YYYY = 'ddMMMYYYY';
export const DATE_FORMAT_DD_MM_YYYY_COMBINED = 'DDMMYYYY';
export const DATE_FORMAT_DD_MM_YYYY_HH_mm_ss = "YYYY-MM-dd'T'HH:mm:ss";
export const DATE_FORMAT_DD_MM_YYYY_HH_mm_ss_sz = "YYYY-MM-dd'T'HH:mm:ss.SSS";
export const DATE_FORMAT_DD_MM_YYYY_HH_mm = 'dd-MM-YYYY HH:mm';
export const DATE_FORMAT_HH_mm = 'HH:mm';
export const DATE_FORMAT_YYYY_MM_DDTHH_mm_ssZ = "YYYY-MM-DD'T'HH:mm:ssZ";
export const DATE_FORMAT_USAGE_TIME = 'HH:mm';
export const DATE_FORMAT_TEST_TIME = "mm's";
export const DATE_FORMAT_MM = 'M';
export const DATE_FORMAT_DD = 'DD';
export const DATE_FORMAT_YYYY = 'YYYY';
export const DATE_FORMAT_MM_YYYY = 'MM-YYYY';
export const DATE_FORMAT_DD_MM = 'DD/MM';
export const DATE_FORMAT_D_M = 'D/M';
export const DATE_FORMAT_MM_DD_YYYY = 'MM-DD-YYYY';

export const FORM_SUBCRIBE_AUTORUN = 'FORM_SUBCRIBE_AUTORUN';

export const API_ADMIN = '/admin/api'; //