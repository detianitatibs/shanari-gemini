
import type { Meta, StoryObj } from '@storybook/nextjs';
import PostCard from './index';

const meta: Meta<typeof PostCard> = {
  title: 'Molecules/PostCard',
  component: PostCard,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    published_at: { control: 'date' },
    thumbnail_url: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof PostCard>;

export const Default: Story = {
  args: {
    slug: 'example-post',
    title: 'This is a Sample Post Title',
    published_at: new Date('2025-10-18').toISOString(),
    categories: [{ id: 1, name: '子育て' }],
    thumbnail_url: 'https://via.placeholder.com/300x200',
  },
};

export const MultipleCategories: Story = {
  args: {
    ...Default.args,
    categories: [
      { id: 1, name: '子育て' },
      { id: 2, name: 'ゲーム' },
    ],
  },
};

export const NoImage: Story = {
  args: {
    ...Default.args,
    thumbnail_url: undefined,
  },
};
