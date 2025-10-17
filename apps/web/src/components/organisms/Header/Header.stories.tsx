
import type { Meta, StoryObj } from '@storybook/react';
import Header from './';

const meta: Meta<typeof Header> = {
  component: Header,
  title: 'Organisms/Header',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {};
