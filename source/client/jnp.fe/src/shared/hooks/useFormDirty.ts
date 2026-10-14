import { useCallback, useRef, useState } from "react";
import type { FormInstance } from "antd/lib";
import isEqual from "lodash/isEqual";

const isFileItem = (item: unknown): boolean =>
  item !== null &&
  typeof item === "object" &&
  ("uid" in (item as object) || "url" in (item as object));

const autoNormalize = (value: unknown): unknown => {
  if (value === undefined || value === null) return null;

  if (
    typeof value === "object" &&
    typeof (value as any).toISOString === "function"
  ) {
    return (value as any).toISOString();
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return [];

    // Dayjs array (RangePicker)
    if (typeof (value[0] as any)?.toISOString === "function") {
      return value.map((v) => (v as any).toISOString());
    }

    if (value.every(isFileItem)) {
      return value.map((f) => (f as any).url ?? (f as any).uid);
    }

    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }

  return value;
};

const normalizeForCompare = (
  values: Record<string, unknown>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const key in values) {
    result[key] = autoNormalize(values[key]);
  }
  return result;
};

export const useFormDirty = (form: FormInstance) => {
  const initialValuesRef = useRef<Record<string, unknown> | null>(null);
  const isDirtyRef = useRef(false);

  const [isDirty, setIsDirty] = useState(false);

  const syncDirty = useCallback((next: boolean) => {
    if (isDirtyRef.current !== next) {
      isDirtyRef.current = next;
      setIsDirty(next);
    }
  }, []);

  const setInitialValues = useCallback(
    (values: Record<string, unknown>) => {
      initialValuesRef.current = normalizeForCompare(values);
      syncDirty(false);
    },
    [syncDirty],
  );

  const resetDirty = useCallback(() => {
    initialValuesRef.current = null;
    syncDirty(false);
  }, [syncDirty]);

  const handleValuesChange = useCallback(() => {
    if (!initialValuesRef.current) {
      syncDirty(true);
      return;
    }
    const current = normalizeForCompare(form.getFieldsValue(true));
    syncDirty(!isEqual(current, initialValuesRef.current));
  }, [form, syncDirty]);

  return { isDirty, setInitialValues, resetDirty, handleValuesChange };
};
