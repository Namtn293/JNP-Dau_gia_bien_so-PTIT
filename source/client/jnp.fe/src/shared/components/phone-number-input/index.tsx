//libs
import React, { useMemo, useCallback, useEffect, useRef } from "react";
import { Input, Select, Space } from "antd";
import type { DefaultOptionType } from "antd/es/select";

//services
import { useCountryPhoneCodes } from "~/shared/services/query";
import type { CountryCodeOption } from "~/shared/services";

//others
import { splitPhoneString } from "~/shared/utils/splitPhoneString";
import { DIGITS_ONLY_RE, NON_DIGIT_RE } from "~/shared/constants";

// ─── Props ────────────────────────────────────────────────────────────────────
interface PhoneNumberInputProps {
  value?: string;
  onChange?: (digits: string) => void;
  prefix: string;
  onPrefixChange: (prefix: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  id?: string;
  status?: "" | "error" | "warning";
  disabled?: boolean;
  tabIndex?: number;
  maxLength?: number | false;
  disablePrefixSelect?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value = "",
  onChange,
  prefix,
  onPrefixChange,
  placeholder,
  style,
  id,
  status,
  disabled = false,
  tabIndex,
  maxLength = 15,
  disablePrefixSelect = false,
}) => {
  const { data: countryCodes = [], isLoading } = useCountryPhoneCodes() as {
    data: CountryCodeOption[];
    isLoading: boolean;
  };

//  cấu hình chặn người dùng nhập truyền false thì k chặn mặc định là  true
  const finalMaxLength = maxLength === false ? undefined : maxLength;

  const { parsedPrefix, currentDigits } = useMemo(() => {
    if (!value) return { parsedPrefix: prefix, currentDigits: "" };

    if (value.startsWith("+") && countryCodes.length > 0) {
      const { prefix: p, digits: d } = splitPhoneString(value, countryCodes);
      return { parsedPrefix: p, currentDigits: d };
    }

    return {
      parsedPrefix: prefix,
      currentDigits: value.replace(NON_DIGIT_RE, ""),
    };
  }, [value, countryCodes, prefix]);

  const prevParsedPrefixRef = useRef(parsedPrefix);

  useEffect(() => {
    if (
      value.startsWith("+") &&
      countryCodes.length > 0 &&
      parsedPrefix !== prefix &&
      parsedPrefix !== prevParsedPrefixRef.current
    ) {
      prevParsedPrefixRef.current = parsedPrefix;
      onPrefixChange(parsedPrefix);
      onChange?.(currentDigits);
    }
  }, [
    parsedPrefix,
    countryCodes,
    value,
    prefix,
    currentDigits,
    onChange,
    onPrefixChange,
  ]);

  const handlePrefixChange = useCallback(
    (newPrefix: string) => {
      onPrefixChange(newPrefix);
      onChange?.(currentDigits);
    },
    [onPrefixChange, onChange, currentDigits],
  );

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value.replace(NON_DIGIT_RE, "").replace(/^0+/, ""));
    },
    [onChange],
  );

  const filterOption = useCallback(
    (input: string, option: DefaultOptionType | undefined): boolean => {
      const raw = input.trim().toLowerCase();
      if (!raw) return true;

      const search = raw.replace(/^\+\s*/, "");
      const opt = option as CountryCodeOption | undefined;

      if (DIGITS_ONLY_RE.test(search)) {
        return (opt?.value ?? "").replace("+", "").startsWith(search);
      }

      return (opt?.label ?? "").toString().toLowerCase().includes(search);
    },
    [],
  );

  return (
    <Space.Compact style={style}>
      <Select<string>
        value={prefix || "+84"}
        onChange={handlePrefixChange}
        style={{ width: 180 }}
        popupMatchSelectWidth={false}
        loading={isLoading}
        showSearch
        optionLabelProp="selectedLabel"
        options={countryCodes}
        disabled={disabled || disablePrefixSelect}
        filterOption={filterOption}
        tabIndex={tabIndex}
      />
      <Input
        style={{ flex: 1 }}
        value={currentDigits}
        onChange={handleNumberChange}
        placeholder={placeholder}
        maxLength={finalMaxLength}
        id={id}
        status={status}
        disabled={disabled}
        tabIndex={tabIndex}
      />
    </Space.Compact>
  );
};

export default React.memo(PhoneNumberInput);
