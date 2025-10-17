import React from 'react';

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

const Checkbox: React.FC<CheckboxProps> = ({ className, label, ...props }) => {
  const baseStyle =
    'h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500';

  return (
    <label className="flex items-center space-x-2">
      <input type="checkbox" className={`${baseStyle} ${className}`} {...props} />
      <span className="text-zinc-800">{label}</span>
    </label>
  );
};

export default Checkbox;
