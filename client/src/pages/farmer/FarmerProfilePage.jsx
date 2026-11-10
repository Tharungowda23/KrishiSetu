import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Lock,
  Sprout,
  Save,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { KARNATAKA_DISTRICTS } from '../../utils/formatters';

const FarmerProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    district: user?.location?.district || 'Mandya',
    cityVillage: user?.location?.cityVillage || '',
    address: user?.location?.address || '',
    farmName: user?.farmDetails?.farmName || '',
    totalLandAcres: user?.farmDetails?.totalLandAcres || '',
    description: user?.farmDetails?.description || '',
  });

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  // Verification request state
  const [verifyModal, setVerifyModal] = useState(false);
  const [docType, setDocType] = useState('Kisan Credit Card / Land Records (RTC/Pahani)');
  const [docNumber, setDocNumber] = useState('');
  const [docNotes, setDocNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
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
        farmDetails: {
          farmName: formData.farmName,
          totalLandAcres: Number(formData.totalLandAcres) || 0,
          description: formData.description,
        },
      });

      if (res.data.success) {
        updateUser(res.data.user);
        setToast('Profile details updated successfully.');
        setTimeout(() => setToast(null), 3500);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmNewPassword) {
      alert('New passwords do not match.');
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

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/verify', {
        documentType: docType,
        documentNumber: docNumber,
        submittedDetails: { notes: docNotes },
      });
      if (res.data.success) {
        updateUser({ verificationStatus: 'pending' });
        setToast('Verification request submitted for admin review!');
        setVerifyModal(false);
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit verification.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-agritext-main">Farmer Profile & Settings</h1>
        <p className="text-xs text-agritext-secondary mt-0.5">
          Manage your agricultural details, contact preferences, and official farmer verification.
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

      {/* Verification Status Card */}
      <div className="card p-6 bg-white border-agriborder flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-agrigreen-100 flex items-center justify-center text-forest">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-agritext-main">Farmer Verification Status</h3>
              <span className="badge-green capitalize">
                {user?.verificationStatus || 'Unverified'}
              </span>
            </div>
            <p className="text-xs text-agritext-secondary mt-0.5">
              Verified farmers earn a trust badge on all crop listings and achieve higher offer acceptance rates.
            </p>
          </div>
        </div>

        {user?.verificationStatus !== 'verified' && (
          <button
            onClick={() => setVerifyModal(true)}
            className="btn-primary text-xs py-2 px-3.5 shrink-0"
          >
            {user?.verificationStatus === 'pending'
              ? 'Update Verification Docs'
              : 'Submit Verification'}
          </button>
        )}
      </div>

      {/* Main Profile Edit Form */}
      <div className="card p-6 sm:p-8 bg-white border-agriborder space-y-6">
        <h3 className="text-sm font-bold text-forest uppercase tracking-wider border-b border-agriborder pb-2">
          Personal & Farm Information
        </h3>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text text-xs">Full Name</label>
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
              <label className="label-text text-xs">Farm Name / Estate</label>
              <input
                type="text"
                value={formData.farmName}
                onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="label-text text-xs">Total Cultivated Land (Acres)</label>
              <input
                type="number"
                step="any"
                value={formData.totalLandAcres}
                onChange={(e) => setFormData({ ...formData, totalLandAcres: e.target.value })}
                className="input-field text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text text-xs">District (Karnataka)</label>
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
              <label className="label-text text-xs">Village / Taluk</label>
              <input
                type="text"
                value={formData.cityVillage}
                onChange={(e) => setFormData({ ...formData, cityVillage: e.target.value })}
                className="input-field text-xs"
              />
            </div>
          </div>

          <div>
            <label className="label-text text-xs">Farm Description & Crops Cultivated</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Card */}
      <div className="card p-6 sm:p-8 bg-white border-agriborder space-y-4">
        <h3 className="text-sm font-bold text-forest uppercase tracking-wider border-b border-agriborder pb-2">
          Security & Password
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4">
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

      {/* Verification Submission Modal */}
      {verifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-agriborder space-y-4">
            <h3 className="text-lg font-bold text-agritext-main">
              Submit Farmer Identity Verification
            </h3>
            <p className="text-xs text-agritext-secondary">
              Provide your government agricultural credential details for platform verification.
            </p>

            <form onSubmit={handleSubmitVerification} className="space-y-3 text-xs">
              <div>
                <label className="label-text text-xs">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="input-field text-xs"
                >
                  <option value="Kisan Credit Card / Land Records (RTC/Pahani)">
                    Kisan Credit Card / Land Records (RTC/Pahani)
                  </option>
                  <option value="Aadhaar / Voter ID">Aadhaar / Voter ID</option>
                  <option value="Trade License / GSTIN">Trade License / GSTIN</option>
                  <option value="Other Official ID">Other Official ID</option>
                </select>
              </div>

              <div>
                <label className="label-text text-xs">Document / Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KCC-KA-571428-XXXX"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="label-text text-xs">Verification Notes / Survey No.</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Survey No. 44/2, Maddur Taluk"
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setVerifyModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Submit Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerProfilePage;
