
import type { Meta, StoryObj } from '@storybook/nextjs';
import Icon, { IconName } from './index';
import * as HIcons from '@heroicons/react/24/outline';

const iconNames = Object.keys(HIcons) as IconName[];

const meta: Meta<typeof Icon> = {
  title: 'Atoms/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: { type: 'select' },
      options: iconNames,
    },
    className: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: {
    name: 'AcademicCapIcon',
  },
};

export const CustomColor: Story = {
  args: {
    name: 'AdjustmentsHorizontalIcon',
    className: 'text-indigo-400',
  },
};

export const CustomSize: Story = {
  args: {
    name: 'ArchiveBoxIcon',
    className: 'h-12 w-12',
  },
};
