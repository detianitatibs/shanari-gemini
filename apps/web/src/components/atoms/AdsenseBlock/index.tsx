import React from 'react';

const AdsenseBlock: React.FC = () => {
  // In a real application, this component would render a Google AdSense ad unit.
  // For development and storybook, we show a placeholder.
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div className="flex items-center justify-center w-full h-48 bg-gray-200 border-2 border-dashed border-gray-400">
        <p className="text-gray-500">Adsense Block</p>
      </div>
    );
  }

  // Return null or the actual ad script in production
  // For now, we'll return null to avoid breaking the build.
  return null;
};

export default AdsenseBlock;
