import React from "react";

export type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

const IconCheckCircle: React.FC<IconProps> = ({
  size = 24,
  style,
  ...rest
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    fill={style?.color || "currentColor"}
    style={style}
    {...rest}
  >
    {/* Vòng tròn */}
    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />

    {/* Dấu check */}
    <path d="M464 688a32 32 0 0 1-22.6-9.4l-144-144a32 32 0 0 1 45.2-45.2L464 610.8l217.4-217.4a32 32 0 1 1 45.2 45.2l-240 240A32 32 0 0 1 464 688z" />
  </svg>
);

export default IconCheckCircle;
