import type { Meta, StoryObj } from '@storybook/react';
import Text from './index';

const meta: Meta<typeof Text> = {
  title: 'Atoms/Text',
  component: Text,
  tags: ['autodocs'],
  argTypes: {
    as: {
      control: { type: 'select' },
      options: ['h1', 'h2', 'h3', 'p', 'span', 'a'],
    },
    children: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    children: 'This is a paragraph.',
    as: 'p',
  },
};

export const Heading1: Story = {
  args: {
    children: 'This is a Heading 1',
    as: 'h1',
  },
};

export const Heading2: Story = {
  args: {
    children: 'This is a Heading 2',
    as: 'h2',
  },
};

export const Heading3: Story = {
  args: {
    children: 'This is a Heading 3',
    as: 'h3',
  },
};

export const Link: Story = {
  args: {
    children: 'This is a link',
    as: 'a',
  },
};
