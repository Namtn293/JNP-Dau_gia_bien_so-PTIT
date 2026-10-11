import { Form, Input } from "antd";
import type { TextAreaProps } from "antd/es/input";
import type { InputProps } from "antd/lib";
import { useEffect, useState } from "react";
import useDebounce from "~/shared/hooks/useDebounce";

type FieldName = string | (string | number)[];
const { TextArea, Search } = Input;

export const DebouncedTrimInput: React.FC<InputProps & { fieldName?: FieldName; validateOnChange?: boolean }> = ({
  fieldName,
  validateOnChange,
  onBlur,
  onChange,
  ...props
}) => {
  const form = Form.useFormInstance();

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    if (fieldName) {
      const value = form.getFieldValue(fieldName);
      if (typeof value === "string") {
        const trimmed = value.replace(/\s+/g, ' ').trim();
        if (trimmed !== value) {
          form.setFieldValue(fieldName, trimmed);
        }
        void form.validateFields([fieldName] as any[]);
      }
    } else {
      const trimmedValue = e.target.value.replace(/\s+/g, ' ').trim();
      if (onChange && e.target.value !== trimmedValue) {
        e.target.value = trimmedValue;
        onChange(e);
      }
    }
    onBlur?.(e);
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange?.(e);
    if (validateOnChange && fieldName) {
      setTimeout(() => void form.validateFields([fieldName] as any[]), 0);
    }
  };

  return (
    <Input
      {...props}
      onBlur={handleBlur}
      onChange={handleChange}
    />
  );
};
// export const DebouncedTrimInput = ({ value, onChange, ...props }: any) => {
//   useEffect(() => {
//     if (typeof value === "string" && value !== value.trim()) {
//       const timer = setTimeout(() => {
//         onChange?.(value.trim());
//       }, 600);
//       return () => clearTimeout(timer);
//     }
//   }, [value, onChange]);

//   return (
//     <Input
//       value={value}
//       onChange={onChange}
//       onBlur={(e) => {
//         if (typeof value === "string" && value !== value.trim()) {
//           onChange?.(value.trim());
//         }
//         props.onBlur?.(e);
//       }}
//       {...props}
//     />
//   );
// };
export const DebouncedTrimTextArea: React.FC<TextAreaProps & { fieldName?: FieldName; validateOnChange?: boolean }> = ({
  maxLength,
  fieldName,
  validateOnChange,
  onBlur,
  onChange,
  showCount,
  ...props
}) => {
  const limit = maxLength || 3000;
  const form = Form.useFormInstance();

  const handleBlur: React.FocusEventHandler<HTMLTextAreaElement> = (e) => {
    if (fieldName) {
      const value = form.getFieldValue(fieldName);
      if (typeof value === "string") {
        const trimmed = value.replace(/[ \t]+/g, ' ').trim();
        if (trimmed !== value) {
          form.setFieldValue(fieldName, trimmed);
        }
        void form.validateFields([fieldName] as any[]);
      }
    } else {
      const trimmedValue = e.target.value.replace(/[ \t]+/g, ' ').trim();
      if (onChange && e.target.value !== trimmedValue) {
        e.target.value = trimmedValue;
        onChange(e);
      }
    }
    onBlur?.(e);
  };

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    // Guard: Ant Design's TextArea có thể gọi onChange với event không đầy đủ
    // trong quá trình paste (Ctrl+V), đặc biệt khi dùng showCount + autoSize.
    // Nếu e.target là null, việc truy cập e.target.value ở parent sẽ crash.
    if (!e?.target) return;

    onChange?.(e);
    if (validateOnChange && fieldName) {
      setTimeout(() => void form.validateFields([fieldName] as any[]), 0);
    }
  };

  return (
    <>
      <style>{`
    
        .ant-input-affix-wrapper:has(textarea),
        .ant-input-textarea-show-count,
        .ant-input-show-count {
          height: auto !important;
          margin-bottom: 22px !important;
          overflow: visible !important;
        }
        .ant-form-item-control:has([class*="show-count"]) .ant-form-item-explain-error,
        .ant-form-item-control:has([class*="showCount"]) .ant-form-item-explain-error {
          margin-top: -22px !important;
          padding-right: 80px !important;
        }
      `}</style>
      <TextArea
        styles={{textarea: {padding: 0}}}
        autoSize={props.autoSize || { minRows: 4, maxRows: 6 }}
        {...props}
        style={{
          ...(showCount === false ? { marginBottom: '10px' } : {}),
          ...props.style,
        }}
        showCount={
          showCount === false
            ? false
            : showCount !== undefined
            ? showCount
            : {
                formatter: ({ count }) => `${count}/${limit}`
              }
        }
        onBlur={handleBlur}
        onChange={handleChange}
      />
    </>
  );
};
// const TextAreaTrim: React.FC<TextAreaProps> = (props) => {
//   return (
//     <TextArea
//       showCount
//       maxLength={props.maxLength || 3000}
//       autoSize={props.autoSize || { minRows: 4, maxRows: 12 }}
//       {...props}
//       onBlur={(e) => {
//         // [ \t]+ : ủi phẳng nhiều dấu cách/tab thành 1, nhưng BẢO TỒN dấu xuống dòng (Enter)
//         const trimmedValue = e.target.value.replace(/[ \t]+/g, ' ').trim(); 

//         if (props.onChange && e.target.value !== trimmedValue) {
//           e.target.value = trimmedValue;
//           props.onChange(e); 
//         }
//         if (props.onBlur) props.onBlur(e);
//       }}
//     />
//   );
// };

export const DebouncedSearchInput = ({
  value: initialValue,
  onChange,
  debounceTimeout,
  ...props
}: any) => {
  const [value, setValue] = useState(initialValue || "");
  const [isFocused, setIsFocused] = useState(false);
  const debounce = useDebounce(debounceTimeout);

  useEffect(() => {
    if (!isFocused) {
      setValue(initialValue || "");
    }
  }, [initialValue, isFocused]);

  const handleTrigger = (val: string) => {
    const trimmedValue = typeof val === "string" ? val.trim() : val;
    if ((initialValue || "") !== trimmedValue) {
      onChange?.(trimmedValue);
    }
  };

  return (
    <Search
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        setValue(val);
        if (!val) {
          handleTrigger("");
        } else {
          debounce(() => {
            handleTrigger(val);
          });
        }
      }}
      onFocus={(e) => {
        setIsFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        handleTrigger(e.target.value);
        props.onBlur?.(e);
      }}
      onSearch={(val, e) => {
        handleTrigger(val);
        props.onSearch?.(val, e);
      }}
      {...props}
    />
  );
};

