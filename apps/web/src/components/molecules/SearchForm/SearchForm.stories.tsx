
import type { Meta, StoryObj } from '@storybook/nextjs';
import SearchForm from './index';

const meta: Meta<typeof SearchForm> = {
  title: 'Molecules/SearchForm',
  component: SearchForm,
  tags: ['autodocs'],
  args: {
    onSearch: (query: string) => console.log('Search query:', query),
  },
};

export default meta;
type Story = StoryObj<typeof SearchForm>;

export const Default: Story = {};
