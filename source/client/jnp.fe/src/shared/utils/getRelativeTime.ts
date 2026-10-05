import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getRelativeTime = (
  dateStr?: string | Date | null,
  dayOnly: boolean = false
): string => {
  if (!dateStr) return "";

  if (dayOnly) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || dayjs.tz.guess();
    const localNow = dayjs().tz(tz);
    const localDate = dayjs.utc(dateStr).tz(tz);

    if (localNow.isSame(localDate, "day")) {
      const diffInSeconds = localNow.diff(localDate, "second");
      if (diffInSeconds < 60) return "Vừa xong";

      const diffInMinutes = localNow.diff(localDate, "minute");
      if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

      const diffInHours = localNow.diff(localDate, "hour");
      return `${diffInHours} giờ trước`;
    }

    const startNow = localNow.startOf("day");
    const startDate = localDate.startOf("day");

    const diffInDays = startNow.diff(startDate, "day");
    if (diffInDays < 30) return `${diffInDays} ngày trước`;

    const diffInMonths = startNow.diff(startDate, "month");
    if (diffInMonths < 12) return `${diffInMonths} tháng trước`;

    const diffInYears = startNow.diff(startDate, "year");
    return `${diffInYears} năm trước`;
  }

  const now = dayjs();
  const date = dayjs.utc(dateStr);
  const diffInSeconds = now.diff(date, "second");

  if (diffInSeconds < 60) return "Vừa xong";

  const diffInMinutes = now.diff(date, "minute");
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

  const diffInHours = now.diff(date, "hour");
  if (diffInHours < 24) return `${diffInHours} giờ trước`;

  const diffInDays = now.diff(date, "day");
  if (diffInDays < 30) return `${diffInDays} ngày trước`;

  const diffInMonths = now.diff(date, "month");
  if (diffInMonths < 12) return `${diffInMonths} tháng trước`;

  const diffInYears = now.diff(date, "year");
  return `${diffInYears} năm trước`;
};

