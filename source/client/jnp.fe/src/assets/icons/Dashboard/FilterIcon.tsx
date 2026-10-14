import type { CSSProperties } from "react";

type Props = {
  size?: number;
  color?: string;
  style?: CSSProperties;
};

export default function FilterIcon({ size = 16, color = "#667085", style }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      <path
        d="M2.5 3.5H13.5L9.25 8.25V12.5L6.75 11.25V8.25L2.5 3.5Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

