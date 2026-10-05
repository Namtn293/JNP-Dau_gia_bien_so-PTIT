const TimeIcon = ({ size = 16 }: any) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.6">
        <path
          d="M16 29.3333C23.3638 29.3333 29.3333 23.3638 29.3333 16C29.3333 8.63619 23.3638 2.66666 16 2.66666C8.6362 2.66666 2.66667 8.63619 2.66667 16C2.66667 23.3638 8.6362 29.3333 16 29.3333Z"
          stroke="#CA3500"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M16 8V16L21.3333 18.6667"
          stroke="#CA3500"
          stroke-width="2.66667"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
    </svg>
  );
};
export default TimeIcon;
