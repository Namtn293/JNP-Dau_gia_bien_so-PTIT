import { DatePicker, Form } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import React, { useCallback, useRef } from "react";

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

let renderCount = 0;

export const CustomDatePicker = ({
  onChange,
  disabledDate,
  value,
  ...props
}: DatePickerProps) => {
  const countRef = useRef(++renderCount);

  // ===== CASE 1: Kiểm tra value nhận được =====
  const valueType = value === undefined ? 'undefined'
    : value === null ? 'null'
    : typeof value === 'string' ? `string("${value}")`
    : typeof value === 'number' ? `number(${value})`
    : typeof value === 'object' ? 'object' : typeof value;

  console.log(`[CDP#${countRef.current}] ====== RENDER ======`);
  console.log(`[CDP#${countRef.current}] value type: ${valueType}`);
  console.log(`[CDP#${countRef.current}] value raw:`, value);

  // ===== CASE 2: Nếu là object, kiểm tra chi tiết =====
  if (value && typeof value === 'object') {
    const v = value as any;
    console.log(`[CDP#${countRef.current}] ── Object analysis:`);
    console.log(`[CDP#${countRef.current}]    constructor: ${v.constructor?.name}`);
    console.log(`[CDP#${countRef.current}]    has $d: ${'$d' in v}`);
    console.log(`[CDP#${countRef.current}]    has $y: ${'$y' in v}`);
    console.log(`[CDP#${countRef.current}]    has format(): ${typeof v.format === 'function'}`);
    console.log(`[CDP#${countRef.current}]    dayjs.isDayjs(): ${dayjs.isDayjs(v)}`);
    console.log(`[CDP#${countRef.current}]    instanceof check: ${v instanceof (dayjs as any)}`);

    // Thử format
    try {
      const formatted = v.format?.("DD/MM/YYYY");
      console.log(`[CDP#${countRef.current}]    format result: ${formatted}`);
    } catch (e: any) {
      console.log(`[CDP#${countRef.current}]    format ERROR: ${e.message}`);
    }

    // Thử isValid
    try {
      console.log(`[CDP#${countRef.current}]    isValid(): ${v.isValid?.()}`);
    } catch (e: any) {
      console.log(`[CDP#${countRef.current}]    isValid ERROR: ${e.message}`);
    }

    // So sánh prototype
    const localDayjs = dayjs();
    console.log(`[CDP#${countRef.current}]    Same prototype as dayjs(): ${Object.getPrototypeOf(v) === Object.getPrototypeOf(localDayjs)}`);
  }

  // ===== CASE 3: Kiểm tra Form.Item injection =====
  const hasOnChange = typeof onChange === 'function';
  const hasId = 'id' in props;
  console.log(`[CDP#${countRef.current}] ── Form.Item injection:`);
  console.log(`[CDP#${countRef.current}]    onChange injected: ${hasOnChange}`);
  console.log(`[CDP#${countRef.current}]    id injected: ${hasId} ${hasId ? `(${(props as any).id})` : ''}`);

  // ===== CASE 4: Kiểm tra Form Context =====
  try {
    const formInstance = Form.useFormInstance();
    console.log(`[CDP#${countRef.current}] ── Form Context:`);
    console.log(`[CDP#${countRef.current}]    Form instance found: ${!!formInstance}`);
    if (formInstance) {
      const allValues = formInstance.getFieldsValue();
      const dateKeys = Object.keys(allValues).filter(k => k.toLowerCase().includes('ngay'));
      dateKeys.forEach(k => {
        const v = allValues[k];
        console.log(`[CDP#${countRef.current}]    Store["${k}"]: ${v === undefined ? 'undefined' : v === null ? 'null' : dayjs.isDayjs(v) ? `dayjs(${v.format("DD/MM/YYYY")})` : String(v)}`);
      });
    }
  } catch (e: any) {
    console.log(`[CDP#${countRef.current}] ── Form Context: KHÔNG TÌM THẤY (${e.message})`);
  }

  // ===== CASE 5: Tất cả props =====
  console.log(`[CDP#${countRef.current}] ── All props:`, { value, onChange: hasOnChange ? '[Function]' : undefined, disabledDate: !!disabledDate, ...Object.fromEntries(Object.entries(props).map(([k, v]) => [k, typeof v === 'function' ? '[Function]' : v])) });

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