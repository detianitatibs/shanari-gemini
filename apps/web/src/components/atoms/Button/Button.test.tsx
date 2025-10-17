
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrimaryButton, SecondaryButton } from './index';

describe('Button', () => {
  it('PrimaryButton renders correctly', () => {
    render(<PrimaryButton>Click Me</PrimaryButton>);
    const button = screen.getByRole('button', { name: /Click Me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-indigo-400');
  });

  it('SecondaryButton renders correctly', () => {
    render(<SecondaryButton>Click Me</SecondaryButton>);
    const button = screen.getByRole('button', { name: /Click Me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('border-indigo-400');
  });

  it('handles onClick event', async () => {
    const handleClick = jest.fn();
    render(<PrimaryButton onClick={handleClick}>Click Me</PrimaryButton>);
    const button = screen.getByRole('button', { name: /Click Me/i });
    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when the disabled prop is true', () => {
    render(<PrimaryButton disabled>Click Me</PrimaryButton>);
    const button = screen.getByRole('button', { name: /Click Me/i });
    expect(button).toBeDisabled();
  });
});
