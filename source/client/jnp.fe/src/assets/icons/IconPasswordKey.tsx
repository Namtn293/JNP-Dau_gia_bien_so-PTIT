import React from "react";

export type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

const IconPasswordKey: React.FC<IconProps> = ({
  size = 24,
  style,
  ...rest
}) => {
  const color = style?.color || "currentColor";
  const strokeWidth = 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      {...rest}
    >
      {/* Đầu chìa khóa */}
      <circle cx="14" cy="10" r="6" stroke={color} strokeWidth={strokeWidth} />

      {/* Thân chìa khóa */}
      <path
        d="M10 14L4 20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Răng chìa khóa */}
      <path
        d="M6 18L7.5 19.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M8 16L9.5 17.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default IconPasswordKey;
