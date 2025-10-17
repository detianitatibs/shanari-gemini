
import React from 'react';
import { render, screen } from '@testing-library/react';
import CategoryLink from './index';

describe('CategoryLink', () => {
  it('renders the category name and count', () => {
    render(<CategoryLink name="子育て" count={12} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/blog/category/%E5%AD%90%E8%82%B2%E3%81%A6');

    expect(screen.getByText('子育て')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});
