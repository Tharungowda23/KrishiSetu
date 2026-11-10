import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState('request'); // 'request' | 'reset'
  const [loading, setLoading] = useState(false);
  const [devTokenNotice, setDevTokenNotice] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setStatusMessage('Password reset instructions generated.');
        if (res.data.devResetToken) {
          setDevTokenNotice(res.data.devResetToken);
          setToken(res.data.devResetToken);
        }
        setStep('reset');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Could not initiate reset. Check email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token,
        newPassword,
      });
      if (res.data.success) {
        setStatusMessage('Password updated successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset password. Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-forest hover:underline mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
          <h1 className="text-2xl font-bold text-agritext-main">Password Recovery</h1>
          <p className="text-xs text-agritext-secondary">
            {step === 'request'
              ? 'Enter your registered email to receive reset instructions.'
              : 'Enter your verification token and your new password.'}
          </p>
        </div>

        <div className="card p-6 sm:p-8 space-y-5 bg-white">
          {statusMessage && (
            <div className="p-3 rounded-xl bg-agrigreen-100 border border-agrigreen-200 text-xs text-forest flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-agrierror flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {devTokenNotice && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Development Token Active:</span>
              <p className="font-mono text-[11px] bg-white p-1.5 rounded border border-amber-200 break-all select-all">
                {devTokenNotice}
              </p>
              <p className="text-[10px] text-amber-800">
                (Pre-filled into the form below for instant local testing without SMTP)
              </p>
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequestToken} className="space-y-4">
              <div>
                <label className="label-text text-xs">Registered Email</label>
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

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Generating...' : 'Continue to Reset'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="label-text text-xs">Reset Token</label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste reset token here"
                  className="input-field text-xs font-mono"
                />
              </div>

              <div>
                <label className="label-text text-xs">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-agritext-secondary absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="input-field pl-9 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
