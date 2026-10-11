import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import queryString from 'query-string';

export * from './desEncryt';
export * from './mathUtils';
export * from './normalizeTrimSpace';
export * from './storage';

dayjs.extend(utc);
dayjs.extend(timezone);

// Map offset sang Timezone ID
export const TIMEZONE_MAP = new Map<number, string>([
  [7, "Asia/Ho_Chi_Minh"],
  [8, "Asia/Singapore"],
  [9, "Asia/Tokyo"],
  [0, "UTC"],
  [1, "Europe/Paris"],
  [-5, "America/New_York"],
]);

export const getTimezoneID = (utcOffset: number): string => {
  return TIMEZONE_MAP.get(utcOffset) ?? TIMEZONE_MAP.get(7)!;
};

export const formatDateUTC = (
  date?: string | Date | null | dayjs.Dayjs,
  format = "DD/MM/YYYY HH:mm",
  utcOffset = 7,
): string => {
  if (!date) return "";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || getTimezoneID(utcOffset);
  return dayjs.utc(date).tz(tz).format(format);
};

export const formatDateUTCNoH = (
  date?: string | Date | null | dayjs.Dayjs,
  format = "DD/MM/YYYY",
  utcOffset = 7,
): string => {
  if (!date) return "-";

  const tz = getTimezoneID(utcOffset);
  return dayjs.utc(formatDateToISO(date)).tz(tz).format(format);
};

export const formatDateToISO = (
  date?: string | Date | null | dayjs.Dayjs,
  utcOffset = 7,
): string => {
  if (!date) return "";
  const tz = getTimezoneID(utcOffset);
  return dayjs(date)
    .tz(tz)
    .add(utcOffset, "hour")
    .utc()
    .format("YYYY-MM-DDTHH:mm:ssZ");
};

/**
 * @description Convert object thành query trên url
 */
export const stringtifyQuery = (object: object) => {
  const flattened = flattenQuery(object);
  return queryString.stringify(flattened, {
    skipEmptyString: false,
    // skipNull: true,
  });
};

export const stringtifyQueryKeepEmpty = (object: object) => {
  const flattened = flattenQuery(object);
  return queryString.stringify(flattened, {
    skipEmptyString: false,
  });
};


/** redirect sang dashboard hoặc redirect search ... */
export const handleRedirect = (path?: string) => {
  const params = new URLSearchParams(window.location.search);
  //login cũ
  // const redirectPath = path ?? decodeURIComponent(params.get('redirect') || '/')
  const redirectCandidate = path ?? params.get('redirect');
  const redirectPath = redirectCandidate ? decodeURIComponent(redirectCandidate) : '/admin';
  window.location.href = redirectPath;
}

const flattenQuery = (input:object) => {
  const result = {};
  Object.entries(input).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.entries(value).forEach(([childKey, childValue]) => {
        const dotKey = `${key}.${childKey}`;
        result[dotKey] = childValue === null ? null : childValue;
      });
    } else {
      result[key] = value;
    }
  });
  return result;
};

export const objectToFormData = (object: object) => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(object)) {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        for (const item of value) {
          formData.append(key, item);
        }
      } else {
        formData.append(key, value);
      }
    }
  }

  return formData;
};

export const toDatePickerValue = (val: unknown) => {
  if (val == null || val === "") return undefined;
  if (dayjs.isDayjs(val) && val.isValid()) return val;
  const formattedDate = formatDateUTC(
    val as string | Date,
    "YYYY/MM/DD"
  );
  const parsed = dayjs(formattedDate);
  return parsed.isValid() ? parsed : undefined;
};