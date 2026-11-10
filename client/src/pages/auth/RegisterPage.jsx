import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sprout, Store, Lock, Mail, User, Phone, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { KARNATAKA_DISTRICTS, CROP_CATEGORIES } from '../../utils/formatters';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'buyer' ? 'buyer' : 'farmer';

  const [role, setRole] = useState(initialRole);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    state: 'Karnataka',
    district: 'Mandya',
    cityVillage: '',
    address: '',
    pincode: '',
    // Farmer fields
    farmName: '',
    totalLandAcres: '',
    produceCategories: ['Vegetables'],
    farmDescription: '',
    // Buyer fields
    businessName: '',
    businessType: 'Wholesaler',
    preferredCategories: ['Vegetables'],
    gstNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        ...formData,
        role,
      });

      if (user.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <div className="max-w-2xl w-full space-y-6">
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
          <h1 className="text-2xl font-bold text-agritext-main">
            Create Your Account
          </h1>
          <p className="text-xs text-agritext-secondary">
            Join the agricultural marketplace with true net earnings transparency.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-agrigreen-100/60 rounded-xl">
          <button
            type="button"
            onClick={() => setRole('farmer')}
            className={`py-3 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'farmer'
                ? 'bg-forest text-white shadow-sm'
                : 'text-agritext-main hover:bg-white/60'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Join as Farmer / Producer</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('buyer')}
            className={`py-3 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'buyer'
                ? 'bg-forest text-white shadow-sm'
                : 'text-agritext-main hover:bg-white/60'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Join as Commercial Buyer</span>
          </button>
        </div>

        {/* Registration Form Card */}
        <div className="card p-6 sm:p-8 space-y-5 bg-white">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-agrierror flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-text text-xs">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Gowda"
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="label-text text-xs">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-text text-xs">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 94480 12345"
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="label-text text-xs">District (Karnataka) *</label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="input-field text-xs"
                >
                  {KARNATAKA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label-text text-xs">Village / Town / APMC Market *</label>
              <input
                type="text"
                required
                value={formData.cityVillage}
                onChange={(e) => setFormData({ ...formData, cityVillage: e.target.value })}
                placeholder="e.g. Maddur Taluk or Yeshwanthpur APMC"
                className="input-field text-xs"
              />
            </div>

            {/* Role-Specific Fields */}
            {role === 'farmer' ? (
              <div className="p-4 rounded-xl bg-agrigreen-50 border border-agrigreen-200 space-y-3">
                <span className="text-xs font-bold text-forest uppercase tracking-wider block">
                  👨‍🌾 Farm Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label-text text-xs">Farm Name / Estate</label>
                    <input
                      type="text"
                      value={formData.farmName}
                      onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                      placeholder="e.g. Cauvery Organic Farms"
                      className="input-field text-xs"
                    />
                  </div>
                  <div>
                    <label className="label-text text-xs">Cultivated Land (Acres)</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.totalLandAcres}
                      onChange={(e) => setFormData({ ...formData, totalLandAcres: e.target.value })}
                      placeholder="e.g. 5.5"
                      className="input-field text-xs"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-3">
                <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
                  🛒 Business Entity Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label-text text-xs">Business / Trading Firm Name</label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="e.g. Bengaluru Fresh Wholesale Ltd"
                      className="input-field text-xs"
                    />
                  </div>
                  <div>
                    <label className="label-text text-xs">Business Type</label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="input-field text-xs"
                    >
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Retailer">Retailer / Supermarket</option>
                      <option value="Food Processor">Food Processor</option>
                      <option value="Exporter">Exporter</option>
                      <option value="Trader">Mandi Trader</option>
                      <option value="Individual">Individual / Institution</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label-text text-xs">GST Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    placeholder="29ABCDE1234F1Z5"
                    className="input-field text-xs uppercase"
                  />
                </div>
              </div>
            )}

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-text text-xs">Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="label-text text-xs">Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="input-field text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 mt-4"
            >
              <span>{loading ? 'Creating Account...' : `Complete ${role === 'farmer' ? 'Farmer' : 'Buyer'} Registration`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-agriborder text-center text-xs text-agritext-secondary">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-forest hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
