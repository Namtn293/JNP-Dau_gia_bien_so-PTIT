import React from "react";

export type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  crossed?: boolean;
};

const IconFilter: React.FC<IconProps> = ({
  size = 14,
  style,
  crossed = false,
  ...rest
}) => (
  <svg
    width={size}
    height={Math.round(size * 9 / 14)}
    viewBox="0 0 14 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
    {...rest}
  >
    <path
      d="M5.25 9V7.5H8.25V9H5.25ZM2.25 5.25V3.75H11.25V5.25H2.25ZM0 1.5V0H13.5V1.5H0Z"
      fill={style?.color || "currentColor"}
    />
    {crossed && (
      <line
        x1="1"
        y1="0.5"
        x2="13"
        y2="8.5"
        stroke={style?.color || "currentColor"}
        strokeWidth="1.2"
      />
    )}
  </svg>
);

export default IconFilter;
