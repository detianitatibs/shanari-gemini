
import type { Meta, StoryObj } from '@storybook/nextjs';
import CategoryLink from './index';

const meta: Meta<typeof CategoryLink> = {
  title: 'Molecules/CategoryLink',
  component: CategoryLink,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CategoryLink>;

export const Default: Story = {
  args: {
    name: '子育て',
    count: 12,
  },
};
