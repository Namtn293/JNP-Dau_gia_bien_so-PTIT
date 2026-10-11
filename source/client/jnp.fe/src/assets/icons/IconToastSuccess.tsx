import React from "react";

export const IconToastSuccess: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        width="18" 
        height="18" 
        viewBox="0 0 18 18" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <circle cx="8.75" cy="8.75" r="8" stroke="white" strokeWidth={1.5}/>
        <path d="M5.94922 9.15L7.54922 10.75L11.5492 6.75" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default IconToastSuccess;
