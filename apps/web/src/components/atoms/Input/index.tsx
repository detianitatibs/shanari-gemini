
import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<InputProps> = ({ className, ...props }) => {
  const baseStyle =
    'border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400';

  return <input className={`${baseStyle} ${className}`} {...props} />;
};

export default Input;
