import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UnauthorizedPage = () => {
  const { user } = useAuth();

  const getRedirectLink = () => {
    if (user?.role === 'farmer') return '/farmer/dashboard';
    if (user?.role === 'buyer') return '/buyer/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-agrierror mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-agritext-main mb-2">Unauthorized Access</h1>
      <p className="text-xs text-agritext-secondary max-w-md mb-6 leading-relaxed">
        You do not have administrative or portal permissions to view this resource. Your account role ({user?.role || 'visitor'}) is restricted from accessing this area.
      </p>
      <Link to={getRedirectLink()} className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Your Portal</span>
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
