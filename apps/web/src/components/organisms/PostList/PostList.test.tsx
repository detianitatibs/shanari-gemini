
import React from 'react';
import { render, screen } from '@testing-library/react';
import PostList from './index';

// Mock the PostCard component to isolate the PostList test
jest.mock('@/components/molecules/PostCard', () => {
  return function DummyPostCard(props: { title: string }) {
    return <div data-testid="postcard">{props.title}</div>;
  };
});

describe('PostList', () => {
  const mockPosts = [
    {
      slug: 'post-1',
      title: 'First Post',
      published_at: '2025-10-01T00:00:00Z',
      categories: [{ id: 1, name: 'Tech' }],
    },
    {
      slug: 'post-2',
      title: 'Second Post',
      published_at: '2025-10-02T00:00:00Z',
      categories: [{ id: 2, name: 'Life' }],
    },
  ];

  it('renders a list of PostCards', () => {
    render(<PostList posts={mockPosts} />);

    const postCards = screen.getAllByTestId('postcard');
    expect(postCards).toHaveLength(2);
    expect(postCards[0]).toHaveTextContent('First Post');
    expect(postCards[1]).toHaveTextContent('Second Post');
  });

  it('renders nothing when the posts array is empty', () => {
    render(<PostList posts={[]} />);
    const postCards = screen.queryAllByTestId('postcard');
    expect(postCards).toHaveLength(0);
  });
});
