import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  GitCompare,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calculator,
  Truck,
  Edit2,
  RefreshCw,
  Send,
  MessageSquare,
  Sparkles,
  Info,
} from 'lucide-react';
import api from '../../services/api';
import { formatRupee, formatIndianNumber } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';

const CompareOffersPage = () => {
  const [searchParams] = useSearchParams();
  const listingIdParam = searchParams.get('listingId');
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState(listingIdParam || '');
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editableExpenses, setEditableExpenses] = useState({});
  const [feedbackToast, setFeedbackToast] = useState(null);

  // Accept modal state
  const [acceptModal, setAcceptModal] = useState({
    isOpen: false,
    offer: null,
    loading: false,
  });

  // Load farmer listings for dropdown
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await api.get('/listings/farmer/mine');
        if (res.data.success) {
          const list = res.data.listings || [];
          setListings(list);
          if (!selectedListingId && list.length > 0) {
            setSelectedListingId(list[0]._id);
          }
        }
      } catch (err) {
        console.warn('Error loading listings for comparison:', err.message);
      }
    };
    fetchListings();
  }, []);

  // Fetch offers for chosen listing
  const fetchOffers = async () => {
    if (!selectedListingId) return;
    setLoading(true);
    try {
      const res = await api.get(`/offers/received?listingId=${selectedListingId}`);
      if (res.data.success) {
        const rawOffers = res.data.offers || [];
        setOffers(rawOffers);

        // Prepopulate editable expenses map
        const initialMap = {};
        rawOffers.forEach((o) => {
          initialMap[o._id] = {
            transportation: o.estimatedExpenses?.transportation || 0,
            packaging: o.estimatedExpenses?.packaging || 0,
            loading: o.estimatedExpenses?.loading || 0,
            platformFees: o.estimatedExpenses?.platformFees || 0,
            otherExpenses: o.estimatedExpenses?.otherExpenses || 0,
          };
        });
        setEditableExpenses(initialMap);
      }
    } catch (err) {
      console.warn('Error loading offers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [selectedListingId]);

  // Compute live recalculated financials for an offer based on local editable expenses
  const getOfferFinancials = (offer) => {
    const exp = editableExpenses[offer._id] || offer.estimatedExpenses || {};
    const totalExpenses =
      Number(exp.transportation || 0) +
      Number(exp.packaging || 0) +
      Number(exp.loading || 0) +
      Number(exp.platformFees || 0) +
      Number(exp.otherExpenses || 0);

    const gross = offer.grossOfferValue || 0;
    const netEarnings = Math.max(0, gross - totalExpenses);

    return {
      gross,
      expenses: exp,
      totalExpenses,
      netEarnings,
    };
  };

  // Find the offer with the highest recalculated net earnings
  const rankedOffers = [...offers].map((o) => ({
    ...o,
    calculated: getOfferFinancials(o),
  }));

  rankedOffers.sort((a, b) => b.calculated.netEarnings - a.calculated.netEarnings);
  const highestNetOfferId = rankedOffers[0]?._id;

  const handleExpenseChange = (offerId, field, value) => {
    setEditableExpenses((prev) => ({
      ...prev,
      [offerId]: {
        ...prev[offerId],
        [field]: Number(value) || 0,
      },
    }));
  };

  const handleAcceptOffer = async () => {
    if (!acceptModal.offer) return;
    setAcceptModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await api.patch(`/offers/${acceptModal.offer._id}/accept`);
      if (res.data.success) {
        setFeedbackToast(
          `Offer accepted! Stock reserved. Order Reference: ${res.data.sale?.saleReference}`
        );
        setAcceptModal({ isOpen: false, offer: null, loading: false });
        fetchOffers();
      }
    } catch (err) {
      alert(err.message || 'Error accepting offer.');
      setAcceptModal({ isOpen: false, offer: null, loading: false });
    }
  };

  const currentListing = listings.find((l) => l._id === selectedListingId);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-forest to-forest-light text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KrishiSetu Proprietary Comparison Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Compare Buyer Offers & Net Realized Earnings
          </h1>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
            Don't accept based on gross bid alone. Our engine evaluates transportation burdens, packaging, and loading expenses side-by-side so you clearly discover which deal keeps the most cash in your pocket.
          </p>
        </div>
      </div>

      {feedbackToast && (
        <div className="p-4 rounded-xl bg-agrigreen-100 border border-agrigreen-200 text-forest text-xs font-semibold flex items-center justify-between">
          <span>{feedbackToast}</span>
          <button onClick={() => setFeedbackToast(null)} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Listing Selector Bar */}
      <div className="card p-4 sm:p-6 bg-white border-agriborder flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-agrigreen-100 flex items-center justify-center text-forest shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <label className="label-text text-xs mb-0">Select Crop to Compare Offers</label>
            <p className="text-[11px] text-agritext-secondary">
              Viewing competing offers received for this harvest
            </p>
          </div>
        </div>

        <select
          value={selectedListingId}
          onChange={(e) => setSelectedListingId(e.target.value)}
          className="input-field text-xs font-bold sm:w-80"
        >
          {listings.map((l) => (
            <option key={l._id} value={l._id}>
              {l.cropName} ({formatRupee(l.askingPrice)}/{l.priceUnit}) â€” {l.offersCount || 0} offers
            </option>
          ))}
        </select>
      </div>

      {/* Comparison Engine View */}
      {loading ? (
        <LoadingSpinner text="Computing net earnings comparisons across offers..." />
      ) : rankedOffers.length > 0 ? (
        <div className="space-y-8">
          {/* Side-by-Side Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {rankedOffers.map((offer, index) => {
              const isBest = offer._id === highestNetOfferId;
              const isEditing = editingExpenseId === offer._id;
              const { gross, expenses, totalExpenses, netEarnings } = offer.calculated;

              return (
                <div
                  key={offer._id}
                  className={`card flex flex-col p-6 transition-all duration-200 relative ${
                    isBest
                      ? 'border-2 border-forest shadow-xl bg-gradient-to-b from-agrigreen-50/40 via-white to-white'
                      : 'border border-agriborder bg-white shadow-sm'
                  }`}
                >
                  {/* Best Deal Crown Pill */}
                  {isBest && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-forest text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>â˜… Highest Estimated Net Return</span>
                    </div>
                  )}

                  {/* Buyer Header */}
                  <div className="flex items-start justify-between gap-2 mb-4 pt-1">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base text-agritext-main">
                          {offer.buyerId?.name || 'Commercial Buyer'}
                        </h3>
                      </div>
                      <p className="text-xs text-agritext-secondary mt-0.5">
                        {offer.buyerId?.location?.district || 'Karnataka'} â€¢ {offer.buyerId?.businessDetails?.businessType || 'Trader'}
                      </p>
                      {offer.buyerId?.verificationStatus === 'verified' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-forest mt-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified Buyer</span>
                        </span>
                      )}
                    </div>
                    <span className="badge-gray text-[10px] font-semibold">
                      Rank #{index + 1}
                    </span>
                  </div>

                  {/* Key Bid Stats */}
                  <div className="p-3 rounded-xl bg-cream/70 border border-agriborder/80 space-y-1 mb-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-agritext-secondary">Offered Price:</span>
                      <span className="font-extrabold text-forest">
                        {formatRupee(offer.offeredPrice)} / {offer.priceUnit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-agritext-secondary">Requested Volume:</span>
                      <span className="font-bold text-agritext-main">
                        {formatIndianNumber(offer.requestedQuantity)} {offer.quantityUnit}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-agriborder/60">
                      <span className="text-agritext-secondary font-semibold">
                        Gross Sale Value:
                      </span>
                      <span className="font-bold text-agritext-main">
                        {formatRupee(gross)}
                      </span>
                    </div>
                  </div>

                  {/* Deductions & Expenses Breakdown */}
                  <div className="space-y-2 text-xs mb-6">
                    <div className="flex items-center justify-between pb-1 border-b border-agriborder">
                      <span className="font-bold text-agritext-main flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-forest" />
                        <span>Estimated Sale Expenses</span>
                      </span>
                      <button
                        onClick={() =>
                          setEditingExpenseId(isEditing ? null : offer._id)
                        }
                        className="text-[11px] text-forest font-semibold hover:underline flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>{isEditing ? 'Done Editing' : 'Edit Estimates'}</span>
                      </button>
                    </div>

                    {isEditing ? (
                      /* Live Interactive Expense Adjuster */
                      <div className="p-3 bg-agrigreen-50 rounded-xl space-y-2 text-xs">
                        <div>
                          <label className="text-[10px] text-agritext-secondary font-medium">
                            Transportation Freight (â‚¹)
                          </label>
                          <input
                            type="number"
                            value={expenses.transportation}
                            onChange={(e) =>
                              handleExpenseChange(offer._id, 'transportation', e.target.value)
                            }
                            className="input-field py-1 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-agritext-secondary font-medium">
                            Packaging / Crates (â‚¹)
                          </label>
                          <input
                            type="number"
                            value={expenses.packaging}
                            onChange={(e) =>
                              handleExpenseChange(offer._id, 'packaging', e.target.value)
                            }
                            className="input-field py-1 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-agritext-secondary font-medium">
                            Labor Loading / Weighing (â‚¹)
                          </label>
                          <input
                            type="number"
                            value={expenses.loading}
                            onChange={(e) =>
                              handleExpenseChange(offer._id, 'loading', e.target.value)
                            }
                            className="input-field py-1 text-xs font-semibold"
                          />
                        </div>
                      </div>
                    ) : (
                      /* Readout of expenses */
                      <div className="space-y-1.5 text-agritext-secondary">
                        <div className="flex justify-between text-agrierror">
                          <span>Freight & Transport:</span>
                          <span className="font-medium">
                            -{formatRupee(expenses.transportation)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Packaging / Crates:</span>
                          <span className="font-medium">
                            -{formatRupee(expenses.packaging)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Loading / Unloading:</span>
                          <span className="font-medium">
                            -{formatRupee(expenses.loading)}
                          </span>
                        </div>
                        <div className="flex justify-between text-agritext-main font-semibold pt-1 border-t border-agriborder/60">
                          <span>Total Deductions:</span>
                          <span className="text-agrierror">
                            -{formatRupee(totalExpenses)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Net Realized Earnings Highlight Box */}
                  <div className="mt-auto p-4 rounded-xl bg-forest text-white space-y-1 mb-5 shadow-xs">
                    <span className="text-[11px] font-semibold text-agrigreen-200 block uppercase tracking-wider">
                      Estimated Net Realized Earnings
                    </span>
                    <span className="text-2xl font-black block">
                      {formatRupee(netEarnings)}
                    </span>
                    <span className="text-[10px] text-agrigreen-200/90 block">
                      Formula: {formatRupee(gross)} gross âˆ’ {formatRupee(totalExpenses)} expenses
                    </span>
                  </div>

                  {/* Non-financial Nuances & Logistics */}
                  <div className="text-[11px] text-agritext-secondary space-y-1 mb-5">
                    <p>
                      <strong>Logistics:</strong> {offer.deliveryPreference}
                    </p>
                    <p>
                      <strong>Payment Terms:</strong> {offer.paymentTerms}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {offer.status === 'pending' || offer.status === 'counter-offered' ? (
                      <button
                        onClick={() => setAcceptModal({ isOpen: true, offer, loading: false })}
                        className="btn-primary w-full text-xs py-2.5 font-bold justify-center"
                      >
                        Accept This Offer
                      </button>
                    ) : (
                      <div className="text-center py-2 text-xs font-semibold text-agritext-secondary bg-cream rounded-lg">
                        Status: <StatusBadge status={offer.status} />
                      </div>
                    )}

                    <Link
                      to={`/farmer/offers?listingId=${offer.listingId?._id}`}
                      className="btn-secondary w-full text-xs py-2 justify-center flex items-center gap-1.5"
                    >
                      <span>Counter-Offer or Details</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Educational Comparison Breakdown Banner */}
          <div className="card p-6 bg-agrigreen-50 border border-agrigreen-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-forest shrink-0 mt-0.5" />
            <div className="text-xs text-agritext-secondary leading-relaxed">
              <strong className="text-agritext-main block mb-1">
                Understanding Offer Comparison Nuances:
              </strong>
              While net earnings highlight the highest monetary return, consider payment security (e.g. advance vs net days) and buyer verification status alongside pure numbers before finalizing.
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={GitCompare}
          title="No offers to compare yet"
          description="You haven't received competing offers for this harvest listing. Once buyers submit bids, side-by-side net profit rankings will appear here automatically."
          actionLabel="View Public Marketplace"
          actionLink="/marketplace"
        />
      )}

      {/* Accept Confirmation Modal */}
      {acceptModal.isOpen && acceptModal.offer && (
        <ConfirmationModal
          isOpen={acceptModal.isOpen}
          onClose={() => setAcceptModal({ isOpen: false, offer: null, loading: false })}
          onConfirm={handleAcceptOffer}
          loading={acceptModal.loading}
          title="Accept Winning Offer & Reserve Produce"
          message={`Confirm accepting offer from ${acceptModal.offer.buyerId?.name} for ${acceptModal.offer.requestedQuantity} ${acceptModal.offer.quantityUnit} at ${formatRupee(acceptModal.offer.offeredPrice)}/${acceptModal.offer.priceUnit}? Stock will be reserved and an active sale timeline established.`}
          confirmText="Confirm & Reserve Stock"
        />
      )}
    </div>
  );
};

export default CompareOffersPage;

