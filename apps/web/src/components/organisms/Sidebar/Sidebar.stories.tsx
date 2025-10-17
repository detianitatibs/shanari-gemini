
import type { Meta, StoryObj } from '@storybook/nextjs';
import Sidebar from './index';

const meta: Meta<typeof Sidebar> = {
  title: 'Organisms/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const mockCategories = [
  { name: '子育て', count: 12 },
  { name: 'ゲーム', count: 5 },
  { name: 'スポーツ', count: 3 },
  { name: '雑談', count: 24 },
];

const mockArchives = [
  { year: 2025, month: 10, count: 5 },
  { year: 2025, month: 8, count: 4 },
  { year: 2024, month: 12, count: 12 },
  { year: 2024, month: 11, count: 2 },
];

export const Default: Story = {
  args: {
    categories: mockCategories,
    archives: mockArchives,
  },
};
