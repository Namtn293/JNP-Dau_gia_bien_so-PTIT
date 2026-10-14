import React, { useState, useCallback } from "react";
import { Input } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import type { InputProps } from "antd";

type PasswordInputProps = Omit<InputProps, "type" | "suffix">;

const PasswordInput: React.FC<PasswordInputProps> = (props) => {
  const [visible, setVisible] = useState<boolean>(false);

  const toggle = useCallback(() => setVisible((v) => !v), []);

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      suffix={
        visible ? (
          <EyeOutlined onClick={toggle} style={{ cursor: "pointer" }} />
        ) : (
          <EyeInvisibleOutlined
            onClick={toggle}
            style={{ cursor: "pointer" }}
          />
        )
      }
      autoComplete={props.autoComplete ?? "new-password"}
      spellCheck={false}
      style={props.style}
    />
  );
};

export default React.memo(PasswordInput);
