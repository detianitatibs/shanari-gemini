
import type { Meta, StoryObj } from '@storybook/nextjs';
import PostList from './index';

const meta: Meta<typeof PostList> = {
  title: 'Organisms/PostList',
  component: PostList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PostList>;

const mockPosts = [
  {
    slug: 'post-1',
    title: 'First Post',
    published_at: new Date('2025-10-01').toISOString(),
    categories: [{ id: 1, name: 'Tech' }],
    thumbnail_url: 'https://via.placeholder.com/300x200?text=Post+1',
  },
  {
    slug: 'post-2',
    title: 'Second Post',
    published_at: new Date('2025-10-02').toISOString(),
    categories: [{ id: 2, name: 'Life' }],
    thumbnail_url: 'https://via.placeholder.com/300x200?text=Post+2',
  },
  {
    slug: 'post-3',
    title: 'Third Post',
    published_at: new Date('2025-10-03').toISOString(),
    categories: [{ id: 1, name: 'Tech' }],
  },
  {
    slug: 'post-4',
    title: 'Fourth Post',
    published_at: new Date('2025-10-04').toISOString(),
    categories: [
      { id: 1, name: 'Tech' },
      { id: 3, name: 'Hobby' },
    ],
    thumbnail_url: 'https://via.placeholder.com/300x200?text=Post+4',
  },
];

export const Default: Story = {
  args: {
    posts: mockPosts,
  },
};

export const Empty: Story = {
  args: {
    posts: [],
  },
};
