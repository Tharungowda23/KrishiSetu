import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  PlusCircle,
  Save,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  ArrowLeft,
  Truck,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CROP_CATEGORIES, KARNATAKA_DISTRICTS } from '../../utils/formatters';

const AddCropPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    cropName: '',
    category: 'Vegetables',
    variety: '',
    qualityGrade: 'Grade A (Export / Premium)',
    description: '',
    askingPrice: '',
    priceUnit: 'quintal',
    originalQuantity: '',
    quantityUnit: 'quintal',
    minimumOrderQuantity: '1',
    state: user?.location?.state || 'Karnataka',
    district: user?.location?.district || 'Mandya',
    villageLocation: user?.location?.cityVillage || '',
    harvestDate: '',
    availableFrom: '',
    pickupAvailable: true,
    deliveryAvailable: false,
    notes: '',
    images: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (status = 'active') => {
    setError(null);

    if (!formData.cropName || !formData.askingPrice || !formData.originalQuantity || !formData.district) {
      setError('Crop name, asking price, quantity, and district location are mandatory.');
      return;
    }

    setLoading(true);
    try {
      // Split images string if multiple URLs provided
      const imageList = formData.images
        ? formData.images.split(',').map((url) => url.trim()).filter(Boolean)
        : [];

      const res = await api.post('/listings', {
        ...formData,
        askingPrice: Number(formData.askingPrice),
        originalQuantity: Number(formData.originalQuantity),
        minimumOrderQuantity: Number(formData.minimumOrderQuantity) || 1,
        images: imageList,
        status,
      });

      if (res.data.success) {
        navigate('/farmer/listings');
      }
    } catch (err) {
      setError(err.message || 'Failed to publish crop listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-agritext-main">Add New Crop Listing</h1>
          <p className="text-xs text-agritext-secondary mt-0.5">
            List your harvest details with accurate units and pricing for buyer discovery.
          </p>
        </div>
        <button
          onClick={() => navigate('/farmer/listings')}
          className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>My Listings</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-agrierror flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <div className="card p-6 sm:p-8 space-y-8 bg-white">
        {/* Section 1: Crop Basics */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-forest uppercase tracking-wider border-b border-agriborder pb-2">
            1. Produce Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text text-xs">Crop Name *</label>
              <input
                type="text"
                required
                value={formData.cropName}
                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                placeholder="e.g. Tomato, Red Onion, Sona Masoori Rice"
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="label-text text-xs">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field text-xs"
              >
                {CROP_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text text-xs">Crop Variety / Cultivar</label>
              <input
                type="text"
                value={formData.variety}
                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                placeholder="e.g. Shivam Round Red, Kufri Jyoti, Byadgi"
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="label-text text-xs">Quality Grade *</label>
              <select
                value={formData.qualityGrade}
                onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                className="input-field text-xs"
              >
                <option value="Grade A (Export / Premium)">Grade A (Export / Premium)</option>
                <option value="Grade B (Standard Market)">Grade B (Standard Market)</option>
                <option value="Grade C (Fair Average)">Grade C (Fair Average)</option>
                <option value="Organic Certified">Organic Certified</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label-text text-xs">Description & Characteristics</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe produce condition, moisture level, color, skin quality, packaging ready, etc."
              className="input-field text-xs"
            />
          </div>

          <div>
            <label className="label-text text-xs">Photograph URLs (Comma separated)</label>
            <input
              type="text"
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
              className="input-field text-xs"
            />
            <span className="text-[11px] text-agritext-secondary mt-1 block">
              Leave empty to use high quality representative produce photography automatically.
            </span>
          </div>
        </div>

        {/* Section 2: Quantities & Pricing */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-forest uppercase tracking-wider border-b border-agriborder pb-2">
            2. Quantity & Pricing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-text text-xs">Total Available Quantity *</label>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={formData.originalQuantity}
                onChange={(e) => setFormData({ ...formData, originalQuantity: e.target.value })}
                placeholder="e.g. 50"
                className="input-field text-xs font-semibold"
              />
            </div>

            <div>
              <label className="label-text text-xs">Measurement Unit *</label>
              <select
                value={formData.quantityUnit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantityUnit: e.target.value,
                    priceUnit: e.target.value,
                  })
                }
                className="input-field text-xs font-semibold"
              >
                <option value="quintal">Quintal (100 kg)</option>
                <option value="tonne">Metric Tonne (1,000 kg)</option>
                <option value="kg">Kilogram (kg)</option>
              </select>
            </div>

            <div>
              <label className="label-text text-xs">Asking Price (₹ / unit) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-agritext-secondary font-semibold">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={formData.askingPrice}
                  onChange={(e) => setFormData({ ...formData, askingPrice: e.target.value })}
                  placeholder="e.g. 2400"
                  className="input-field pl-7 text-xs font-bold text-forest"
                />
              </div>
            </div>
          </div>

          <div className="w-full sm:w-1/3">
            <label className="label-text text-xs">Minimum Order Quantity ({formData.quantityUnit})</label>
            <input
              type="number"
              min="1"
              value={formData.minimumOrderQuantity}
              onChange={(e) => setFormData({ ...formData, minimumOrderQuantity: e.target.value })}
              className="input-field text-xs"
            />
          </div>
        </div>

        {/* Section 3: Farm Location & Logistics */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-forest uppercase tracking-wider border-b border-agriborder pb-2">
            3. Farm Location & Logistics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div>
              <label className="label-text text-xs">Village / Pickup Point *</label>
              <input
                type="text"
                value={formData.villageLocation}
                onChange={(e) => setFormData({ ...formData, villageLocation: e.target.value })}
                placeholder="e.g. Maddur APMC link road"
                className="input-field text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text text-xs">Harvest Date</label>
              <input
                type="date"
                value={formData.harvestDate}
                onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="label-text text-xs">Available From Date</label>
              <input
                type="date"
                value={formData.availableFrom}
                onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                className="input-field text-xs"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-agritext-main cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.pickupAvailable}
                onChange={(e) => setFormData({ ...formData, pickupAvailable: e.target.checked })}
                className="rounded text-forest focus:ring-forest"
              />
              <span>Farm Gate Pickup Available</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-agritext-main cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.deliveryAvailable}
                onChange={(e) => setFormData({ ...formData, deliveryAvailable: e.target.checked })}
                className="rounded text-forest focus:ring-forest"
              />
              <span>Can Arrange Local Transporter</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-agriborder flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit('draft')}
            className="btn-secondary text-xs py-2.5 px-4"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit('active')}
            className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? 'Publishing...' : 'Publish Produce Listing'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCropPage;
