import React, { useState } from 'react';
import { X, Send, Calculator, Truck, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatRupee, formatIndianNumber } from '../../utils/formatters';
import api from '../../services/api';

const OfferModal = ({ isOpen, onClose, listing, onSuccess }) => {
  const [offeredPrice, setOfferedPrice] = useState(listing?.askingPrice || '');
  const [requestedQuantity, setRequestedQuantity] = useState(
    listing?.minimumOrderQuantity || 1
  );
  const [deliveryPreference, setDeliveryPreference] = useState('Buyer Arranges Pickup');
  const [paymentTerms, setPaymentTerms] = useState('Payment on Pickup / Delivery');
  const [proposedPickupDate, setProposedPickupDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !listing) return null;

  const priceNum = Number(offeredPrice) || 0;
  const qtyNum = Number(requestedQuantity) || 0;
  const grossOfferValue = Math.round(priceNum * qtyNum * 100) / 100;

  // Indicative transport deduction if farmer organizes transport
  const estimatedTransport =
    deliveryPreference === 'Farmer Organizes Transport' ? 1800 : 0;
  const estimatedNetToFarmer = Math.max(0, grossOfferValue - estimatedTransport);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (qtyNum <= 0 || priceNum <= 0) {
      setError('Please enter a valid offered price and quantity.');
      return;
    }

    if (qtyNum > listing.availableQuantity) {
      setError(
        `Quantity cannot exceed currently available stock (${listing.availableQuantity} ${listing.quantityUnit}).`
      );
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/offers', {
        listingId: listing._id,
        offeredPrice: priceNum,
        priceUnit: listing.priceUnit,
        requestedQuantity: qtyNum,
        quantityUnit: listing.quantityUnit,
        deliveryPreference,
        paymentTerms,
        proposedPickupDate: proposedPickupDate || undefined,
        message,
        estimatedExpenses: {
          transportation: estimatedTransport,
          packaging: 0,
          loading: 0,
          platformFees: 0,
          otherExpenses: 0,
          isEstimated: true,
        },
      });

      if (res.data.success) {
        if (onSuccess) onSuccess(res.data.offer);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit offer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-agriborder relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-agritext-muted hover:text-agritext-main p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5 pb-4 border-b border-agriborder">
          <span className="badge-green mb-1.5">Direct Farmer Offer</span>
          <h2 className="text-xl font-bold text-agritext-main">
            Submit Offer for {listing.cropName}
          </h2>
          <p className="text-xs text-agritext-secondary mt-0.5">
            Seller: <span className="font-semibold text-agritext-main">{listing.farmerId?.name}</span> • Asking Price: {formatRupee(listing.askingPrice)}/{listing.priceUnit} • Available: {formatIndianNumber(listing.availableQuantity)} {listing.quantityUnit}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-agrierror flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Offered Price */}
            <div>
              <label className="label-text">
                Offered Price (per {listing.priceUnit}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-agritext-secondary font-semibold">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                  className="input-field pl-8 font-semibold text-forest"
                  placeholder="e.g. 2400"
                />
              </div>
            </div>

            {/* Requested Quantity */}
            <div>
              <label className="label-text">
                Requested Quantity ({listing.quantityUnit}) *
              </label>
              <input
                type="number"
                min="1"
                max={listing.availableQuantity}
                step="any"
                required
                value={requestedQuantity}
                onChange={(e) => setRequestedQuantity(e.target.value)}
                className="input-field font-semibold"
                placeholder={`Min: ${listing.minimumOrderQuantity || 1}`}
              />
            </div>
          </div>

          {/* Real-time Gross & Net Calculation Display */}
          <div className="p-4 rounded-xl bg-agrigreen-50 border border-agrigreen-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-agritext-secondary flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-forest" />
                <span>Calculated Gross Offer Value</span>
              </span>
              <span className="text-base font-extrabold text-forest">
                {formatRupee(grossOfferValue)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-agritext-secondary pt-2 border-t border-agrigreen-200/60">
              <span>Indicative Net to Farmer ({deliveryPreference})</span>
              <span className="font-bold text-agritext-main">
                {formatRupee(estimatedNetToFarmer)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Delivery arrangement */}
            <div>
              <label className="label-text">Logistics Preference</label>
              <select
                value={deliveryPreference}
                onChange={(e) => setDeliveryPreference(e.target.value)}
                className="input-field text-sm"
              >
                <option value="Buyer Arranges Pickup">Buyer Arranges Pickup (Farm Gate)</option>
                <option value="Farmer Organizes Transport">Farmer Organizes Transport</option>
                <option value="Third-Party Logistics Arranged">Third-Party Logistics Arranged</option>
              </select>
            </div>

            {/* Payment terms */}
            <div>
              <label className="label-text">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="input-field text-sm"
              >
                <option value="Payment on Pickup / Delivery">Payment on Pickup / Delivery</option>
                <option value="Advance Payment">Advance Payment</option>
                <option value="Escrow / Platform Verified">Escrow / Platform Verified</option>
                <option value="Net 7 Days">Net 7 Days</option>
                <option value="Net 15 Days">Net 15 Days</option>
              </select>
            </div>
          </div>

          {/* Proposed Pickup Date */}
          <div>
            <label className="label-text">Proposed Pickup / Delivery Date</label>
            <input
              type="date"
              value={proposedPickupDate}
              onChange={(e) => setProposedPickupDate(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          {/* Message to Farmer */}
          <div>
            <label className="label-text">Message / Delivery Notes</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide pickup vehicle details, timing preferences, or specific quality requirements..."
              className="input-field text-sm"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting Offer...' : 'Send Offer to Farmer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferModal;
