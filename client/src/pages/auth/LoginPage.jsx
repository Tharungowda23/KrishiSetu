import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Sprout, Store, ShieldCheck, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname;

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      // Redirect according to user role or origin
      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else if (loggedUser.role === 'buyer') {
        navigate('/buyer/dashboard');
      } else if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo Login Helper
  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-agrigreen-100 flex items-center justify-center p-2">
              <img src="/logo.svg" alt="KrishiSetu Logo" className="w-full h-full" />
            </div>
            <span className="text-2xl font-extrabold text-forest tracking-tight">
              Krishi<span className="text-agrigreen-500">Setu</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-agritext-main">Welcome Back</h1>
          <p className="text-xs text-agritext-secondary">
            Sign in to access your listings, offers, and sale orders.
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="p-3 bg-white rounded-xl border border-agriborder space-y-2">
          <span className="text-[11px] font-bold text-agritext-secondary uppercase tracking-wider block text-center">
            ⚡ Quick 1-Click Demo Accounts
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('farmer@krishisetu.com', 'password123')}
              className="py-1.5 px-2 rounded-lg bg-agrigreen-50 hover:bg-agrigreen-100 border border-agrigreen-200 text-forest text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Farmer</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('buyer@krishisetu.com', 'password123')}
              className="py-1.5 px-2 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Buyer</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@krishisetu.com', 'adminpass123')}
              className="py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="card p-6 sm:p-8 space-y-5 bg-white">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-agrierror flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="label-text text-xs">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-agritext-secondary absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. farmer@krishisetu.com"
                  className="input-field pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label-text text-xs mb-0">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-forest hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-agritext-secondary absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-9 pr-10 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-agritext-muted hover:text-agritext-main"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-agriborder text-center text-xs text-agritext-secondary space-y-2">
            <p>
              Don't have an account yet?{' '}
              <Link to="/register?role=farmer" className="font-bold text-forest hover:underline">
                Register as Farmer
              </Link>{' '}
              or{' '}
              <Link to="/register?role=buyer" className="font-bold text-forest hover:underline">
                Buyer
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
