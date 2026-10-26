import { DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import React, { useCallback } from "react";

import type { DatePickerProps } from "antd";
import type { PickerFocusEventHandler } from "rc-picker/lib/interface";

dayjs.extend(customParseFormat);

const ACCEPTED_FORMATS = [
  "DD/MM/YYYY",
  "D/M/YYYY",
  "DD-MM-YYYY",
  "D-M-YYYY",
  "DD.MM.YYYY",
  "D.M.YYYY",
  "YYYY-MM-DD",
  "YYYY/MM/DD",
  "DDMMYYYY",
];

const tryParse = (raw: string): Dayjs | null => {
  for (const fmt of ACCEPTED_FORMATS) {
    const d = dayjs(raw, fmt, true);
    if (d.isValid()) return d;
  }
  return null;
};

export const CustomDatePicker = ({
  onChange,
  disabledDate,
  value,
  ...props
}: DatePickerProps) => {

  const handleBlur: PickerFocusEventHandler = useCallback(
    (e) => {
      const input = e.target as HTMLInputElement;
      const raw = input.value?.trim();
      if (!raw) return;

      const parsed = tryParse(raw);

      // Nếu parse thất bại hoặc date bị disabled → reset input về value cũ
      if (!parsed || disabledDate?.(parsed, { type: "date" })) {
        const prevFormatted = value ? (value as Dayjs).format("DD/MM/YYYY") : "";
        input.value = prevFormatted;
        return;
      }

      onChange?.(parsed, parsed.format("DD/MM/YYYY"));
    },
    [onChange, disabledDate, value],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key !== "Enter") return;
      const input = e.target as HTMLInputElement;
      const raw = input.value?.trim();
      if (!raw) return;

      const parsed = tryParse(raw);
      if (!parsed) return;

      if (disabledDate?.(parsed, { type: "date" })) {
        e.preventDefault();
        e.stopPropagation();
        // Reset về value cũ
        const prevFormatted = value ? (value as Dayjs).format("DD/MM/YYYY") : "";
        input.value = prevFormatted;
      }
    },
    [disabledDate, value],
  );

  return (
    <DatePicker
      {...props}
      value={value}
      format="DD/MM/YYYY"
      disabledDate={disabledDate}
      onBlur={handleBlur}
      onChange={onChange}
      onKeyDown={handleKeyDown}
    />
  );
};

export default React.memo(CustomDatePicker);