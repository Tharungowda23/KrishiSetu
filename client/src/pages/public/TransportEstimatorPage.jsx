import React, { useState, useEffect } from 'react';
import { Truck, Calculator, ArrowRight, Info, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
import api from '../../services/api';
import { formatRupee, KARNATAKA_DISTRICTS } from '../../utils/formatters';

const TransportEstimatorPage = () => {
  const [pickupDistrict, setPickupDistrict] = useState('Mandya');
  const [destinationDistrict, setDestinationDistrict] = useState('Bengaluru Urban');
  const [quantityKg, setQuantityKg] = useState('2000');
  const [vehicleType, setVehicleType] = useState('pickup_truck');
  const [includeLoading, setIncludeLoading] = useState(true);
  const [includePackaging, setIncludePackaging] = useState(false);

  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEstimate = async () => {
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
      console.warn('Transport estimation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimate();
  }, [pickupDistrict, destinationDistrict, quantityKg, vehicleType, includeLoading, includePackaging]);

  const isOverweight =
    estimate?.vehicleType &&
    Number(quantityKg) > estimate.vehicleType.maxCapacityKg;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="badge-green">Regional Agricultural Freight</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-agritext-main tracking-tight">
          Agricultural Logistics & Freight Estimator
        </h1>
        <p className="text-xs sm:text-sm text-agritext-secondary leading-relaxed">
          Transparent freight calculations based on road distances, vehicle payload capacities, and indicative commercial haulage rates across Karnataka.
        </p>
      </div>

      {/* Main Calculator Card */}
      <div className="card p-6 sm:p-8 bg-white border-agriborder space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Origin */}
          <div>
            <label className="label-text text-xs flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-forest" />
              <span>Pickup Location (Farm District) *</span>
            </label>
            <select
              value={pickupDistrict}
              onChange={(e) => setPickupDistrict(e.target.value)}
              className="input-field text-xs font-semibold"
            >
              {KARNATAKA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="label-text text-xs flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-forest" />
              <span>Destination (Market / Processing Hub) *</span>
            </label>
            <select
              value={destinationDistrict}
              onChange={(e) => setDestinationDistrict(e.target.value)}
              className="input-field text-xs font-semibold"
            >
              {KARNATAKA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Payload weight */}
          <div>
            <label className="label-text text-xs">Total Payload Weight (kg) *</label>
            <input
              type="number"
              min="100"
              step="100"
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              className="input-field text-xs font-bold"
            />
            <span className="text-[11px] text-agritext-secondary mt-1 block">
              {(Number(quantityKg) / 100).toFixed(1)} quintals •{' '}
              {(Number(quantityKg) / 1000).toFixed(2)} metric tonnes
            </span>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="label-text text-xs">Vehicle Fleet Category *</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="input-field text-xs font-semibold"
            >
              <option value="mini_truck">Mini Truck / Tata Ace (Max 1,000 kg / 10 qtl)</option>
              <option value="pickup_truck">Pickup / Bolero Maxi (Max 2,000 kg / 20 qtl)</option>
              <option value="medium_canter">Medium Commercial Vehicle (Max 5,000 kg / 50 qtl)</option>
              <option value="heavy_truck">Heavy Multi-Axle Truck (Max 16,000 kg / 160 qtl)</option>
              <option value="tractor_trolley">Tractor Trolley (Local Mandi, Max 3,500 kg)</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-agriborder text-xs">
          <label className="flex items-center gap-2 font-semibold text-agritext-main cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeLoading}
              onChange={(e) => setIncludeLoading(e.target.checked)}
              className="rounded text-forest focus:ring-forest"
            />
            <span>Include Labor Loading & Weighing Charges (~₹25/qtl)</span>
          </label>

          <label className="flex items-center gap-2 font-semibold text-agritext-main cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includePackaging}
              onChange={(e) => setIncludePackaging(e.target.checked)}
              className="rounded text-forest focus:ring-forest"
            />
            <span>Include Crate / Gunny Bag Packaging (~₹20/qtl)</span>
          </label>
        </div>

        {/* Overweight warning */}
        {isOverweight && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            <span>
              <strong>Payload Warning:</strong> {quantityKg} kg exceeds the rated capacity of{' '}
              {estimate.vehicleType.name} ({estimate.vehicleType.maxCapacityKg} kg). Consider choosing a larger vehicle category.
            </span>
          </div>
        )}

        {/* Results Box */}
        {estimate && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-agrigreen-50 via-white to-agrigreen-50 border-2 border-agrigreen-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-agrigreen-200">
              <div>
                <span className="text-xs font-bold text-forest uppercase tracking-wider block">
                  Route Assessment
                </span>
                <span className="text-lg font-bold text-agritext-main">
                  {estimate.pickupDistrict} ➔ {estimate.destinationDistrict}
                </span>
                <span className="text-xs text-agritext-secondary block mt-0.5">
                  Approx. road distance: <strong>{estimate.distanceKm} km</strong> • Est. transit: <strong>{estimate.estimatedTransitHours} hrs</strong>
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-agritext-secondary font-medium block">
                  Total Estimated Logistics Cost
                </span>
                <span className="text-3xl font-black text-forest block">
                  {formatRupee(estimate.costs.totalEstimatedExpenses)}
                </span>
              </div>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-white border border-agriborder shadow-2xs">
                <span className="text-[11px] text-agritext-secondary block">Base Freight</span>
                <span className="text-base font-bold text-agritext-main">
                  {formatRupee(estimate.costs.baseFreight)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-agriborder shadow-2xs">
                <span className="text-[11px] text-agritext-secondary block">Labor / Loading</span>
                <span className="text-base font-bold text-agritext-main">
                  {formatRupee(estimate.costs.loadingCharges)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-agriborder shadow-2xs">
                <span className="text-[11px] text-agritext-secondary block">Cost / Quintal</span>
                <span className="text-base font-extrabold text-forest">
                  {formatRupee(estimate.costs.costPerQuintal)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-agriborder shadow-2xs">
                <span className="text-[11px] text-agritext-secondary block">Cost / Kilogram</span>
                <span className="text-base font-extrabold text-forest">
                  ₹{estimate.costs.costPerKg}
                </span>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 text-xs text-agritext-secondary bg-white/70 p-3.5 rounded-xl border border-agriborder/60">
              <Info className="w-4 h-4 text-forest shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Disclaimer:</strong> {estimate.disclaimer}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportEstimatorPage;
