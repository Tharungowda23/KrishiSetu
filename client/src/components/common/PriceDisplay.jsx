import React from 'react';
import { formatRupee } from '../../utils/formatters';

const PriceDisplay = ({ price, unit = 'quintal', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-sm font-semibold',
    md: 'text-lg font-bold',
    lg: 'text-2xl font-extrabold',
    xl: 'text-3xl font-extrabold',
  };

  return (
    <div className={`inline-flex items-baseline gap-1 text-forest ${className}`}>
      <span className={sizeClasses[size] || sizeClasses.md}>
        {formatRupee(price)}
      </span>
      {unit && (
        <span className="text-xs font-medium text-agritext-secondary">
          / {unit}
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;
