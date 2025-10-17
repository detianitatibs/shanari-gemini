import type { Meta, StoryObj } from '@storybook/nextjs';
import AdsenseBlock from './index';

const meta: Meta<typeof AdsenseBlock> = {
  title: 'Atoms/AdsenseBlock',
  component: AdsenseBlock,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AdsenseBlock>;

export const Default: Story = {};
