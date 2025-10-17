
import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className,
  children,
  ...props
}) => {
  const baseStyle =
    'px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300';
  const styles = {
    primary: `bg-indigo-400 text-white hover:border-yellow-300 border-2 border-transparent disabled:bg-indigo-300 disabled:cursor-not-allowed disabled:hover:border-transparent`,
    secondary:
      'border-2 border-indigo-400 text-indigo-400 bg-transparent hover:bg-indigo-50 disabled:border-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed disabled:hover:bg-transparent',
  };

  return (
    <button
      className={`${baseStyle} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const PrimaryButton: React.FC<
  Omit<ButtonProps, 'variant'>
> = props => <Button {...props} variant="primary" />;

export const SecondaryButton: React.FC<
  Omit<ButtonProps, 'variant'>
> = props => <Button {...props} variant="secondary" />;

export default Button;
