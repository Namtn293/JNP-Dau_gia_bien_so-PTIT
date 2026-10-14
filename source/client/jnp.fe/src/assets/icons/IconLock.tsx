import React from "react";

export type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

const IconLock: React.FC<IconProps> = ({ size = 24, style, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    fill={style?.color}
    style={style}
    {...rest}
  >
    <path d="M768 448h-32V320c0-123.7-100.3-224-224-224S288 196.3 288 320v128h-32c-35.3 0-64 28.7-64 64v352c0 35.3 28.7 64 64 64h512c35.3 0 64-28.7 64-64V512c0-35.3-28.7-64-64-64zm-352-128c0-53 43-96 96-96s96 43 96 96v128H416V320zm96 384c-35.3 0-64-28.7-64-64s28.7-64 64-64 64 28.7 64 64-28.7 64-64 64z" />
  </svg>
);

export default IconLock;
