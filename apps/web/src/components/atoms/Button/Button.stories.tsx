
import type { Meta, StoryObj } from '@storybook/nextjs';
import Button, { PrimaryButton, SecondaryButton } from './index';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: ['primary', 'secondary'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Primary: Story = {
  render: () => <PrimaryButton>Primary Button</PrimaryButton>,
};

export const Secondary: Story = {
  render: () => <SecondaryButton>Secondary Button</SecondaryButton>,
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};
