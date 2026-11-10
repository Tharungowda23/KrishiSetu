import React, { useState, useEffect } from 'react';
import { X, Truck, Info, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { formatRupee, KARNATAKA_DISTRICTS } from '../../utils/formatters';
import api from '../../services/api';

const TransportEstimatorModal = ({
  isOpen,
  onClose,
  defaultOrigin = 'Mandya',
  defaultWeightKg = 1000,
}) => {
  const [pickupDistrict, setPickupDistrict] = useState(defaultOrigin);
  const [destinationDistrict, setDestinationDistrict] = useState('Bengaluru Urban');
  const [quantityKg, setQuantityKg] = useState(defaultWeightKg);
  const [vehicleType, setVehicleType] = useState('mini_truck');
  const [includeLoading, setIncludeLoading] = useState(true);
  const [includePackaging, setIncludePackaging] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/transport/estimate', {
        pickupDistrict,
        destinationDistrict,
        quantityKg: Number(quantityKg) || 1000,
        vehicleTypeChoice: vehicleType,
        includeLoading,
        includePackaging,
      });
      if (res.data.success) {
        setEstimate(res.data.estimate);
      }
    } catch (err) {
      console.error('Transport estimation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      calculate();
    }
  }, [isOpen, pickupDistrict, destinationDistrict, vehicleType, includeLoading, includePackaging]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-agriborder relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-agritext-muted hover:text-agritext-main p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-agriborder">
          <div className="w-9 h-9 rounded-xl bg-agrigreen-100 flex items-center justify-center text-forest">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-agritext-main">
              Transport Expense Estimator
            </h2>
            <p className="text-xs text-agritext-secondary">
              Indicative road freight & transit calculations
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-text text-xs">Origin (Farm District)</label>
              <select
                value={pickupDistrict}
                onChange={(e) => setPickupDistrict(e.target.value)}
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
              <label className="label-text text-xs">Destination (Market / Hub)</label>
              <select
                value={destinationDistrict}
                onChange={(e) => setDestinationDistrict(e.target.value)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-text text-xs">Payload Weight (Kilograms)</label>
              <input
                type="number"
                min="100"
                step="50"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                className="input-field text-xs font-semibold"
              />
            </div>
            <div>
              <label className="label-text text-xs">Vehicle Category</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="input-field text-xs"
              >
                <option value="mini_truck">Mini Truck / Tata Ace (≤ 1T)</option>
                <option value="pickup_truck">Pickup / Bolero (≤ 2T)</option>
                <option value="medium_canter">Medium Commercial Canter (≤ 5T)</option>
                <option value="heavy_truck">Heavy Multi-Axle Truck (≤ 16T)</option>
                <option value="tractor_trolley">Tractor Trolley (Local)</option>
              </select>
            </div>
          </div>

          {/* Additional checkboxes */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs text-agritext-main cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeLoading}
                onChange={(e) => setIncludeLoading(e.target.checked)}
                className="rounded text-forest focus:ring-forest"
              />
              <span>Include Loading/Unloading</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-agritext-main cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includePackaging}
                onChange={(e) => setIncludePackaging(e.target.checked)}
                className="rounded text-forest focus:ring-forest"
              />
              <span>Include Crate/Gunny Packaging</span>
            </label>
          </div>

          {/* Results Card */}
          {estimate && (
            <div className="mt-4 p-4 rounded-xl bg-agrigreen-50 border border-agrigreen-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-agrigreen-200/60">
                <div>
                  <span className="text-xs text-agritext-secondary font-medium block">
                    Estimated Road Distance
                  </span>
                  <span className="text-sm font-bold text-agritext-main">
                    ~{estimate.distanceKm} km (Est. {estimate.estimatedTransitHours} hrs)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-agritext-secondary font-medium block">
                    Total Estimated Freight
                  </span>
                  <span className="text-xl font-extrabold text-forest">
                    {formatRupee(estimate.costs.totalEstimatedExpenses)}
                  </span>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-white/70">
                  <span className="text-[10px] text-agritext-secondary block">Base Freight</span>
                  <span className="font-bold text-agritext-main">
                    {formatRupee(estimate.costs.baseFreight)}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white/70">
                  <span className="text-[10px] text-agritext-secondary block">Labor / Loading</span>
                  <span className="font-bold text-agritext-main">
                    {formatRupee(estimate.costs.loadingCharges)}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white/70">
                  <span className="text-[10px] text-agritext-secondary block">Freight / Quintal</span>
                  <span className="font-bold text-forest">
                    {formatRupee(estimate.costs.costPerQuintal)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-1.5 text-[10px] text-agritext-secondary leading-snug pt-1">
                <Info className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                <span>
                  <strong>Estimate Notice:</strong> Calculations are indicative regional road freight guidelines. Final haulage terms are negotiated directly with the carrier or driver.
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className="btn-primary text-xs py-2 px-4">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransportEstimatorModal;
