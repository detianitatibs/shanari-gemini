import React from 'react';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => {
  const baseStyle =
    'border-zinc-300 rounded-md shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400';

  return <textarea className={`${baseStyle} ${className}`} {...props} />;
};

export default Textarea;
