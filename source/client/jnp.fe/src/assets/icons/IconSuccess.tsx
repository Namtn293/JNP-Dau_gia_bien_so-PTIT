import React from "react";
import type { IconProps } from "./IconFilter";

const IconSuccess: React.FC<IconProps> = ({
  size = 10,
  style,
  ...rest
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 10 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
    {...rest}
  >
    <path
      d="M3.325 7.01458L0 3.68958L0.83125 2.85833L3.325 5.35208L8.67708 0L9.50833 0.83125L3.325 7.01458Z"
      fill={style?.color || "white"}
    />
  </svg>
);

export default IconSuccess;
