import React from 'react';
import { Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = Sprout,
  title = 'No items found',
  description = 'There are no records matching your current filter criteria.',
  actionLabel,
  actionLink,
  onAction,
}) => {
  return (
    <div className="card p-10 flex flex-col items-center justify-center text-center max-w-lg mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-agrigreen-100 flex items-center justify-center text-forest mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-agritext-main mb-2">{title}</h3>
      <p className="text-sm text-agritext-secondary mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn-primary">
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionLink && (
        <button onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
