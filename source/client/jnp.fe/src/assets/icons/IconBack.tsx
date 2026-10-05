import React from "react";

export type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

const IconBack: React.FC<IconProps> = ({
  size = 28,
  style,
  ...rest
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
    {...rest}
  >
    <g clipPath="url(#clip0_643_771)">
      <path
        d="M6.69375 15.75L16.4937 25.55L14 28L0 14L14 0L16.4937 2.45L6.69375 12.25H28V15.75H6.69375Z"
        fill={style?.color || "currentColor"}
      />
    </g>
    <defs>
      <clipPath id="clip0_643_771">
        <rect width="28" height="28" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default IconBack;
