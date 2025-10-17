import React from 'react';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => {
  const defaultClass = 'w-24 h-auto';
  return (
    <svg 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 1155 1000" 
      className={`${defaultClass} ${className}`}
      {...props}
    >
      <path d="m577.3 0 577.4 1000H0z" fill="#000"/>
    </svg>
  );
};

export default Logo;