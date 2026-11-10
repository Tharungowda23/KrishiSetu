import React, { useState } from 'react';
import { User, Store, ShieldCheck, MapPin, Phone, Mail, Lock, Save } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { KARNATAKA_DISTRICTS } from '../../utils/formatters';

const BuyerProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    district: user?.location?.district || 'Bengaluru Urban',
    cityVillage: user?.location?.cityVillage || '',
    address: user?.location?.address || '',
    businessName: user?.businessDetails?.businessName || '',
    businessType: user?.businessDetails?.businessType || 'Wholesaler',
    gstNumber: user?.businessDetails?.gstNumber || '',
  });

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.patch('/users/profile', {
        name: formData.name,
        phone: formData.phone,
        location: {
          state: 'Karnataka',
          district: formData.district,
          cityVillage: formData.cityVillage,
          address: formData.address,
        },
        businessDetails: {
          businessName: formData.businessName,
          businessType: formData.businessType,
          gstNumber: formData.gstNumber,
        },
      });

      if (res.data.success) {
        updateUser(res.data.user);
        setToast('Business details updated successfully.');
        setTimeout(() => setToast(null), 3500);
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmNewPassword) {
      alert('Passwords do not match.');
      return;
    }
    try {
      const res = await api.patch('/users/password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });
      if (res.data.success) {
        setToast('Password updated successfully.');
        setPassData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        setTimeout(() => setToast(null), 3500);
      }
    } catch (err) {
      alert(err.message || 'Failed to change password.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-agritext-main">Buyer Business Profile</h1>
        <p className="text-xs text-agritext-secondary mt-0.5">
          Manage your business credentials, commercial addresses, and trading preferences.
        </p>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-agrigreen-100 border border-agrigreen-200 text-forest text-xs font-semibold flex items-center justify-between">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Profile Form */}
      <div className="card p-6 sm:p-8 bg-white border-agriborder space-y-6">
        <h3 className="text-sm font-bold text-forest uppercase tracking-wider border-b border-agriborder pb-2">
          Commercial Trading Entity Details
        </h3>

        <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text text-xs">Contact Person Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="label-text text-xs">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text text-xs">Business / Trading Firm Name</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text text-xs">Operating District (Karnataka)</label>
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

            <div>
              <label className="label-text text-xs">GST Number</label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                className="input-field text-xs uppercase"
              />
            </div>
          </div>

          <div>
            <label className="label-text text-xs">Primary Delivery / Warehouse Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Plot 44, APMC Yard, Yeshwanthpur"
              className="input-field text-xs"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Business Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Form */}
      <div className="card p-6 sm:p-8 bg-white border-agriborder space-y-4">
        <h3 className="text-sm font-bold text-forest uppercase tracking-wider border-b border-agriborder pb-2">
          Security & Password
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-text text-xs">Current Password</label>
              <input
                type="password"
                required
                value={passData.currentPassword}
                onChange={(e) =>
                  setPassData({ ...passData, currentPassword: e.target.value })
                }
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="label-text text-xs">New Password</label>
              <input
                type="password"
                required
                value={passData.newPassword}
                onChange={(e) =>
                  setPassData({ ...passData, newPassword: e.target.value })
                }
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="label-text text-xs">Confirm New Password</label>
              <input
                type="password"
                required
                value={passData.confirmNewPassword}
                onChange={(e) =>
                  setPassData({ ...passData, confirmNewPassword: e.target.value })
                }
                className="input-field text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-secondary text-xs py-2 px-4">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyerProfilePage;
