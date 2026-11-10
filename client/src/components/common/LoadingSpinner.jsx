import React from 'react';
import { Sprout } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-agrigreen-100 border-t-forest animate-spin" />
        <Sprout className="w-5 h-5 text-forest absolute animate-pulse" />
      </div>
      {text && <p className="mt-3 text-sm font-medium text-agritext-secondary">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
