import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import type { Moment } from "moment";

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDateUTC = (
  date?: string | Date | null,
  format: string = "DD/MM/YYYY HH:mm",
  tz: string = dayjs.tz.guess(),
): string => {
  if (!date) return "-";
  return dayjs.utc(date).tz(tz).format(format);
};

// (VI) Kiểm tra ngày có phải giá trị rỗng hoặc sentinel mặc định BE trả về (VD: 0001-01-01) khi người dùng không nhập ngày
export const isEmptyOrSentinelDate = (date?: string | Date | null): boolean => {
  if (!date) return true;
  const d = new Date(date);
  return isNaN(d.getTime()) || d.getUTCFullYear() <= 1;
};

// (VI) Format ngày theo định dạng dd/MM/yyyy
export const formatDate = (isoDate?: string | null): string => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // tháng 0-11
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// (VI) Format ngày và giờ theo định dạng dd/MM/yyyy HH:mm
export const formatDateTime = (isoDate?: string | null): string => {
  if (!isoDate) return "";
  try {
    const date = new Date(isoDate);
    // (VI) Kiểm tra date hợp lệ
    if (isNaN(date.getTime())) return isoDate;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    // (VI) Nếu có lỗi, trả về giá trị gốc
    return isoDate;
  }
};

// (VI) Format ngày theo định dạng tiếng Việt: "22 Tháng 12 Năm 2025"
export const formatVietnameseDate = (isoDate?: string | null): string => {
  if (!isoDate) return "";
  try {
    const date = new Date(isoDate);
    // (VI) Kiểm tra date hợp lệ
    if (isNaN(date.getTime())) return isoDate;

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day} Tháng ${month} Năm ${year}`;
  } catch (error) {
    // (VI) Nếu có lỗi, trả về giá trị gốc
    return isoDate;
  }
};

// (API) Format ngày để gửi backend theo chuẩn UTC+0 (ISO String)
export const formatDateToApi = (
  date?: Date | string | null | Moment | dayjs.Dayjs,
  type?: "start" | "end"
): string | undefined => {
  if (!date) return undefined;

  let d: Date;

  // Nếu là Moment hoặc Dayjs thì dùng .toDate(), còn lại là Date hoặc string
  if ((date as Moment)?.isValid !== undefined && (date as Moment).isValid()) {
    d = (date as Moment).toDate();
  } else if ((date as dayjs.Dayjs)?.isValid && (date as dayjs.Dayjs).isValid()) {
    d = (date as dayjs.Dayjs).toDate();
  } else {
    d = new Date(date as string | Date);
  }

  if (isNaN(d.getTime())) return undefined;

  const djs = dayjs(d);
  if (type === "start") {
    return djs.startOf("day").toISOString();
  } else if (type === "end") {
    return djs.endOf("day").toISOString();
  }

  return djs.toISOString();
};
