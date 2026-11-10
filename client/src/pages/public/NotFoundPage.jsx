import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-agrigreen-100 flex items-center justify-center text-forest mb-4">
        <Sprout className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-agritext-main mb-2">404</h1>
      <h2 className="text-xl font-bold text-agritext-main mb-3">Page Not Found</h2>
      <p className="text-xs text-agritext-secondary max-w-sm mb-6 leading-relaxed">
        The agricultural page or crop listing you are looking for does not exist or has been relocated.
      </p>
      <Link to="/" className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
