
import React from 'react';
import * as HIcons from '@heroicons/react/24/outline';

export type IconName = keyof typeof HIcons;

type IconProps = {
  name: IconName;
  className?: string;
};

const Icon: React.FC<IconProps> = ({ name, className, ...props }) => {
  const HeroIcon = HIcons[name];

  if (!HeroIcon) {
    // Optionally, return a default icon or null if the icon name is invalid
    return null;
  }

  return <HeroIcon className={`h-6 w-6 ${className}`} {...props} />;
};

export default Icon;
