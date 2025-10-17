
import React from 'react';
import { render, screen } from '@testing-library/react';
import ArchiveLink from './index';

describe('ArchiveLink', () => {
  it('renders the year, month, and count', () => {
    render(<ArchiveLink year={2025} month={10} count={8} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/blog/archive/2025/10');

    expect(screen.getByText('2025年 10月')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });
});
