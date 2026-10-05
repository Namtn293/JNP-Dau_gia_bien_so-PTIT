import React from "react";

export const IconToastError: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        width="18" 
        height="18" 
        viewBox="0 0 18 18" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <circle cx="8.75" cy="8.75" r="8" stroke="white" strokeWidth={1.5}/>
        <path d="M8.75 4.75V9.55" stroke="white" strokeWidth={1.5} strokeLinecap="round"/>
        <circle cx="8.74922" cy="11.9501" r="0.5" stroke="white" strokeWidth={0.6}/>
    </svg>
);

export default IconToastError;
