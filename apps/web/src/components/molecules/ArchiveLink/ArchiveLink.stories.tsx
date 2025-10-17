
import type { Meta, StoryObj } from '@storybook/nextjs';
import ArchiveLink from './index';

const meta: Meta<typeof ArchiveLink> = {
  title: 'Molecules/ArchiveLink',
  component: ArchiveLink,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ArchiveLink>;

export const Default: Story = {
  args: {
    year: 2025,
    month: 10,
    count: 8,
  },
};
