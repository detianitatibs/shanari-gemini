
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from './index';

// Mock child components
jest.mock('@/components/molecules/CategoryLink', () => {
  return function DummyCategoryLink({ name, count }: { name: string; count: number }) {
    return <div data-testid="category-link">{name} ({count})</div>;
  };
});

jest.mock('@/components/molecules/ArchiveLink', () => {
  return function DummyArchiveLink({ year, month, count }: { year: number; month: number; count: number }) {
    return <div data-testid="archive-link">{year}-{month} ({count})</div>;
  };
});

describe('Sidebar', () => {
  const mockCategories = [
    { name: '子育て', count: 12 },
    { name: 'ゲーム', count: 5 },
  ];
  const mockArchives = [
    { year: 2025, month: 10, count: 5 },
    { year: 2024, month: 12, count: 12 },
  ];

  it('renders categories and archives', () => {
    render(<Sidebar categories={mockCategories} archives={mockArchives} />);

    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getAllByTestId('category-link')).toHaveLength(2);

    expect(screen.getByText('Archives')).toBeInTheDocument();
    expect(screen.getByText('2025年')).toBeInTheDocument();
    expect(screen.getByText('2024年')).toBeInTheDocument();
  });

  it('toggles archive year visibility on click', async () => {
    render(<Sidebar categories={[]} archives={mockArchives} />);

    const year2025Button = screen.getByText('2025年');

    // Initially, archives are hidden
    expect(screen.queryByTestId('archive-link')).not.toBeInTheDocument();

    // Click to show
    await userEvent.click(year2025Button);
    expect(await screen.findByTestId('archive-link')).toBeInTheDocument();
    expect(screen.getByText('2025-10 (5)')).toBeInTheDocument();

    // Click to hide
    await userEvent.click(year2025Button);
    expect(screen.queryByTestId('archive-link')).not.toBeInTheDocument();
  });
});
