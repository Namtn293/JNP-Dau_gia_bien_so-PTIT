import type { SelectProps } from "antd";
import { Select } from "antd";
import type { RuleObject } from "antd/es/form";
import { useMemo } from "react";

export const DISABLED_OPTION_MESSAGE =
  "Giá trị đang chọn không còn hoạt động, vui lòng chọn lại";

export interface SelectOption {
  value: string | number;
  label: React.ReactNode;
  /** Khi hoatDong=false: option bị ẩn trừ khi đang được selected */
  hoatDong?: boolean;
  [key: string]: any;
}

export interface SelectWithDisabledOptionsProps extends Omit<
  SelectProps,
  "options"
> {
  /**
   * Danh sách đầy đủ options, bao gồm cả enabled (hoatDong=false/undefined)
   * và disabled (hoatDong=true).
   *
   * Logic hiển thị:
   *  - Chưa có value  → chỉ hiện options enabled
   *  - Đã có value    → hiện options enabled + option disabled khớp value đang chọn
   */
  allOptions: SelectOption[];
  disabledOptionMessage?: string;
  /**
   * Nếu false (mặc định): border đỏ chỉ hiện khi Form.Item đã validate (sau submit).
   * Nếu true: border đỏ hiện ngay khi value đang là option disabled.
   */
  showErrorImmediately?: boolean;
}

/**
 * HOC bọc Ant Design Select với logic lọc options thông minh:
 *
 * Mục tiêu: không để user chọn mới một option disabled,
 * nhưng vẫn hiển thị đúng label khi record cũ đang giữ giá trị đó.
 *
 * Dùng thay thế trực tiếp cho <Select> — nhận toàn bộ SelectProps.
 */
const getRawValue = (value: unknown) => {
  if (value && typeof value === "object" && "value" in value) {
    return (value as { value: unknown }).value;
  }
  return value;
};

const isEmptyValue = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

const hasDisabledSelectedOption = (
  value: unknown,
  allOptions: SelectOption[],
) => {
  if (isEmptyValue(value)) return false;

  const values = Array.isArray(value) ? value : [value];
  return values.some((item) => {
    const rawValue = getRawValue(item);
    return allOptions.some(
      (option) =>
        option.hoatDong === false && String(option.value) === String(rawValue),
    );
  });
};

const getDisabledSelectedLabels = (
  value: unknown,
  allOptions: SelectOption[],
): string[] => {
  if (isEmptyValue(value)) return [];
  const values = Array.isArray(value) ? value : [value];
  return values.reduce<string[]>((acc, item) => {
    const rawValue = getRawValue(item);
    const found = allOptions.find(
      (opt) => opt.hoatDong === false && String(opt.value) === String(rawValue),
    );
    if (found) {
      // label có thể là ReactNode, fallback về string nếu có thể
      const labelStr =
        typeof found.label === "string" ? found.label : String(found.value);
      acc.push(labelStr);
    }
    return acc;
  }, []);
};

// eslint-disable-next-line react-refresh/only-export-components
export const validateDisabledSelectOption = (
  value: unknown,
  allOptions: SelectOption[] = [],
  message?: string,
) => {
  if (
    !Array.isArray(allOptions) ||
    !hasDisabledSelectedOption(value, allOptions)
  ) {
    return Promise.resolve();
  }

  if (message) {
    return Promise.reject(new Error(message));
  }

  const isMultiple = Array.isArray(value);
  if (isMultiple) {
    const disabledLabels = getDisabledSelectedLabels(value, allOptions);
    const names = disabledLabels.join(", ");
    return Promise.reject(
      new Error(
        `Giá trị không còn hoạt động: ${names}. Vui lòng bỏ chọn và chọn lại`,
      ),
    );
  }

  return Promise.reject(new Error(DISABLED_OPTION_MESSAGE));
};

export const createDisabledSelectOptionRule = (
  allOptions: SelectOption[] = [],
  message?: string,
): RuleObject => ({
  validator: (_: RuleObject, value: unknown) =>
    validateDisabledSelectOption(value, allOptions, message),
});

const SelectWithDisabledOptions = ({
  allOptions,
  value,
  mode,
  optionFilterProp = "label",
  status,
  disabledOptionMessage: _disabledOptionMessage,
  showErrorImmediately = false,
  ...rest
}: SelectWithDisabledOptionsProps) => {
  const selectedValues = useMemo<Array<string | number>>(() => {
    if (value === undefined || value === null) return [];
    if (mode === "multiple" || mode === "tags") {
      const values = Array.isArray(value) ? value : [value];
      return values.map((item) => getRawValue(item) as string | number);
    }
    return [getRawValue(value) as string | number];
  }, [value, mode]);

  const filteredOptions = useMemo<SelectOption[]>(() => {
    if (!Array.isArray(allOptions)) return [];

    return allOptions.filter(
      (opt) =>
        opt.hoatDong !== false ||
        selectedValues.map(String).includes(String(opt.value)),
    );
  }, [allOptions, selectedValues]);

  const hasSelectedDisabledOption = useMemo(
    () =>
      Array.isArray(allOptions) && hasDisabledSelectedOption(value, allOptions),
    [allOptions, value],
  );

  return (
    <Select
      value={value}
      mode={mode}
      options={filteredOptions}
      optionFilterProp={optionFilterProp}
      status={
        status ??
        (showErrorImmediately && hasSelectedDisabledOption
          ? "error"
          : undefined)
      }
      {...rest}
    />
  );
};

(SelectWithDisabledOptions as any).isSelectWithDisabledOptions = true;

export default SelectWithDisabledOptions;
