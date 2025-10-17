
import React from 'react';
import { render, screen } from '@testing-library/react';
import PostCard from './index';

describe('PostCard', () => {
  const mockProps = {
    slug: 'test-post',
    title: 'Test Post Title',
    published_at: '2025-10-18T12:00:00Z',
    categories: [{ id: 1, name: 'Testing' }],
    thumbnail_url: 'https://via.placeholder.com/150',
  };

  it('renders all elements correctly', () => {
    render(<PostCard {...mockProps} />);

    // Check if the link points to the correct slug
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/blog/test-post');

    // Check for the image
    const image = screen.getByRole('img', { name: mockProps.title });
    expect(image).toBeInTheDocument();

    // Check for the category
    expect(screen.getByText('Testing')).toBeInTheDocument();

    // Check for the title
    expect(screen.getByRole('heading', { name: mockProps.title })).toBeInTheDocument();

    // Check for the formatted date
    expect(screen.getByText('2025年10月18日')).toBeInTheDocument();
  });

  it('renders placeholder image when thumbnail_url is not provided', () => {
    const propsWithoutImage = { ...mockProps, thumbnail_url: undefined };
    render(<PostCard {...propsWithoutImage} />);
    const image = screen.getByRole('img');
    expect(image.getAttribute('src')).toContain('placeholder.svg');
  });
});
