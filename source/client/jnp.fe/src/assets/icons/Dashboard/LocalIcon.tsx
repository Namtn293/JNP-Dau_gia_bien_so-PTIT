const LocalIcon = ({ size = 32, color = "#1447E6" }: any) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color }}
    >
      <g opacity="0.6">
        <path
          d="M8 29.3333V5.33332C8 4.62608 8.28095 3.9478 8.78105 3.4477C9.28115 2.94761 9.95942 2.66666 10.6667 2.66666H21.3333C22.0406 2.66666 22.7189 2.94761 23.219 3.4477C23.719 3.9478 24 4.62608 24 5.33332V29.3333H8Z"
          stroke={color}
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M7.99996 16H5.33329C4.62605 16 3.94777 16.281 3.44767 16.781C2.94758 17.2811 2.66663 17.9594 2.66663 18.6667V26.6667C2.66663 27.3739 2.94758 28.0522 3.44767 28.5523C3.94777 29.0524 4.62605 29.3333 5.33329 29.3333H7.99996"
          stroke={color}
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M24 12H26.6667C27.3739 12 28.0522 12.281 28.5523 12.781C29.0524 13.2811 29.3333 13.9594 29.3333 14.6667V26.6667C29.3333 27.3739 29.0524 28.0522 28.5523 28.5523C28.0522 29.0524 27.3739 29.3333 26.6667 29.3333H24"
          stroke={color}
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M13.3334 8H18.6667"
          stroke={color}
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M13.3334 13.3333H18.6667"
          stroke={color}
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M13.3334 18.6667H18.6667"
          stroke={color}
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M13.3334 24H18.6667"
          stroke={color}
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
    </svg>
  );
};
export default LocalIcon;
