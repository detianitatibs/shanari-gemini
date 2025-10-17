import React from 'react';

type TextProps = {
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'a';
  children: React.ReactNode;
  className?: string;
};

const Text: React.FC<TextProps> = ({ as: Component = 'p', children, className, ...props }) => {
  const baseStyle = 'text-zinc-800'; // 基本のテキストカラー

  const styles = {
    h1: `${baseStyle} text-4xl font-bold`,
    h2: `${baseStyle} text-3xl font-bold`,
    h3: `${baseStyle} text-2xl font-bold`,
    p: `${baseStyle} text-base`,
    span: `${baseStyle} text-base`,
    a: 'text-blue-700 underline visited:text-purple-700 hover:text-blue-800 font-medium',
  };

  return (
    <Component className={`${styles[Component]} ${className || ''}`} {...props}>
      {children}
    </Component>
  );
};

export default Text;
