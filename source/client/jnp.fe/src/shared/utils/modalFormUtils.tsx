/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { Form, Input } from "antd";
import type { Rule } from "antd/es/form";
import type { InputProps } from "antd/es/input";
import { rulesCheck } from "./validate";

type FieldName = string | (string | number)[];
type TextAreaProps = React.ComponentProps<typeof Input.TextArea>;

// --- Rule builders ---

/**
 * Rules dùng cho field Mã:
 * - Bắt buộc (sau khi trim)
 * - Không khoảng trắng ở bất kỳ vị trí nào
 * - Không tiếng Việt có dấu / ký tự đặc biệt (chỉ a-z, A-Z, 0-9, _ -)
 * - Không vượt quá maxLength ký tự
 */
export const getMaRules = (label: string, maxLength = 50): Rule[] => [
  {
    validator: async (_, value: string) => {
      const raw = value ?? "";
      const trimmed = raw.trim();
      if (!trimmed) {
        return Promise.reject(new Error(`Vui lòng nhập ${label}`));
      }
      const xssError = rulesCheck.noXSS(label)(trimmed);
      if (xssError) return Promise.reject(new Error(xssError));
      if (!/^[a-zA-Z0-9!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]+$/.test(trimmed)) {
        return Promise.reject(
          new Error("Mã không bao gồm khoảng trắng và tiếng Việt có dấu.")
        );
      }
      if (trimmed.length > maxLength) {
        return Promise.reject(
          new Error(`${label} không được vượt quá ${maxLength} ký tự!`)
        );
      }
      return Promise.resolve();
    },
  },
];

/**                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
 * Rules dùng cho field Tên / văn bản thông thường:
 * - Bắt buộc theo tham số required (mặc định true)
 * - Khoảng trắng giữa các từ được phép
 * - Khoảng trắng đầu/cuối → sẽ được trim bởi TrimInput trước khi validate
 * - Không vượt quá maxLength ký tự
 */
export const getTenRules = (
  label: string,
  maxLength = 255,
  required = true
): Rule[] => [
  {
    validator: async (_, value: string) => {
      const trimmed = (value ?? "").trim();
      if (!trimmed) {
        if (required) {
          return Promise.reject(new Error(`Vui lòng nhập ${label}`));
        }
        return Promise.resolve();
      }
      const xssError = rulesCheck.noXSS(label)(trimmed);
      if (xssError) return Promise.reject(new Error(xssError));
      if (trimmed.length > maxLength) {
        return Promise.reject(
          new Error(`${label} không được vượt quá ${maxLength} ký tự!`)
        );
      }
      return Promise.resolve();
    },
  },
];

/** Rules dùng cho field Mô tả (mặc định không bắt buộc, tối đa 3000 ký tự) */
export const getMoTaRules = (
  label = "Mô tả",
  maxLength = 3000,
  required = false
): Rule[] => getTenRules(label, maxLength, required);

// --- Input components với trim-on-blur ---

/** Input tự động trim khoảng trắng đầu/cuối khi out-click (blur).
 *  Nếu validateOnChange=true, validate ngay khi người dùng gõ. */
export const TrimInput: React.FC<InputProps & { fieldName: FieldName; validateOnChange?: boolean }> = ({
  fieldName,
  onBlur,
  onChange,
  validateOnChange,
  ...rest
}) => {
  const form = Form.useFormInstance();

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    const value = form.getFieldValue(fieldName);
    if (typeof value === "string") {
      const trimmed = value.replace(/\s+/g, ' ').trim();
      if (trimmed !== value) {
        form.setFieldValue(fieldName, trimmed);
        void form.validateFields([fieldName] as any[]);
      }
    }
    onBlur?.(e);
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange?.(e);
    if (validateOnChange) {
      setTimeout(() => void form.validateFields([fieldName] as any[]), 0);
    }
  };

  return <Input {...rest} onBlur={handleBlur} onChange={handleChange} />;
};

/** TextArea tự động trim khoảng trắng đầu/cuối khi out-click (blur) */
export const TrimTextArea: React.FC<TextAreaProps & { fieldName: FieldName }> =
  ({ fieldName, onBlur, ...rest }) => {
    const form = Form.useFormInstance();

    const handleBlur: React.FocusEventHandler<HTMLTextAreaElement> = (e) => {
      const value = form.getFieldValue(fieldName);
      if (typeof value === "string") {
        const trimmed = value.replace(/[ \t]+/g, ' ').trim();
        if (trimmed !== value) {
          form.setFieldValue(fieldName, trimmed);
          void form.validateFields([fieldName] as any[]);
        }
      }
      onBlur?.(e);
    };

    return <Input.TextArea {...rest} onBlur={handleBlur} />;
  };


export const getMaFieldProps = (
  label: string,
  fieldName: FieldName,
  maxLength = 50,
  inputProps?: Omit<InputProps, "onBlur">
) => ({
  required: true,
  rules: getMaRules(label, maxLength),
  component: (
    <TrimInput
      fieldName={fieldName}
      validateOnChange
      placeholder={`Nhập ${label.toLowerCase()}`}
      {...inputProps}
    />
  ),
});

export const getTenFieldProps = (
  label: string,
  fieldName: FieldName,
  maxLength = 255,
  required = true,
  inputProps?: Omit<InputProps, "onBlur">
) => ({
  required,
  rules: getTenRules(label, maxLength, required),
  component: (
    <TrimInput
      fieldName={fieldName}
      placeholder={`Nhập ${label.toLowerCase()}`}
      {...inputProps}
    />
  ),
});

export const getMoTaFieldProps = (
  label = "Mô tả",
  fieldName: FieldName = "moTa",
  maxLength = 3000,
  required = false,
  textAreaProps?: Omit<TextAreaProps, "onBlur">
) => ({
  required,
  rules: getMoTaRules(label, maxLength, required),
  component: (
    <TrimTextArea
      fieldName={fieldName}
      placeholder={`Nhập ${label.toLowerCase()}`}
      {...textAreaProps}
    />
  ),
});
