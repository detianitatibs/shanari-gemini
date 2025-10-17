
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from './index';

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Test Input" />);
    const input = screen.getByPlaceholderText('Test Input');
    expect(input).toBeInTheDocument();
  });

  it('allows user to type', async () => {
    render(<Input placeholder="Test Input" />);
    const input = screen.getByPlaceholderText('Test Input') as HTMLInputElement;
    await userEvent.type(input, 'Hello, world!');
    expect(input.value).toBe('Hello, world!');
  });

  it('is disabled when the disabled prop is true', () => {
    render(<Input placeholder="Test Input" disabled />);
    const input = screen.getByPlaceholderText('Test Input');
    expect(input).toBeDisabled();
  });
});
