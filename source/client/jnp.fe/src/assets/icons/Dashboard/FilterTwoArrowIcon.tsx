import type { CSSProperties } from "react";

type Props = {
  size?: number;
  color?: string;
  style?: CSSProperties;
};

export default function FilterTwoArrowIcon({
  size = 16,
  style,
}: Props) {
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
        d="M14 10.6667L11.3334 13.3334L8.66669 10.6667"
        stroke="#0A0A0A"
        stroke-width="1.33333"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M11.3333 13.3334V2.66669"
        stroke="#0A0A0A"
        stroke-width="1.33333"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M2 5.33335L4.66667 2.66669L7.33333 5.33335"
        stroke="#0A0A0A"
        stroke-width="1.33333"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M4.66669 2.66669V13.3334"
        stroke="#0A0A0A"
        stroke-width="1.33333"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
