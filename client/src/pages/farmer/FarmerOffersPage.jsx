import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  GitCompare,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  Calculator,
} from 'lucide-react';
import api from '../../services/api';
import { formatRupee, formatDate, formatIndianNumber } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const FarmerOffersPage = () => {
  const [searchParams] = useSearchParams();
  const listingIdParam = searchParams.get('listingId');
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [feedbackToast, setFeedbackToast] = useState(null);

  // Counter-offer modal state
  const [counterModal, setCounterModal] = useState({
    isOpen: false,
    offer: null,
    counterPrice: '',
    message: '',
  });

  // Accept confirm modal
  const [acceptModal, setAcceptModal] = useState({
    isOpen: false,
    offer: null,
    loading: false,
  });

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const url = listingIdParam
        ? `/offers/received?listingId=${listingIdParam}`
        : '/offers/received';
      const res = await api.get(url);
      if (res.data.success) {
        setOffers(res.data.offers || []);
      }
    } catch (err) {
      console.warn('Error fetching received offers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [listingIdParam]);

  const handleAcceptOffer = async () => {
    if (!acceptModal.offer) return;
    setAcceptModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await api.patch(`/offers/${acceptModal.offer._id}/accept`);
      if (res.data.success) {
        setFeedbackToast(
          `Offer accepted! Stock reserved and Sale Order ${res.data.sale?.saleReference} created.`
        );
        setAcceptModal({ isOpen: false, offer: null, loading: false });
        fetchOffers();
      }
    } catch (err) {
      alert(err.message || 'Failed to accept offer. Stock might be insufficient.');
      setAcceptModal({ isOpen: false, offer: null, loading: false });
    }
  };

  const handleRejectOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to decline this buyer offer?')) return;
    try {
      await api.patch(`/offers/${offerId}/reject`);
      setFeedbackToast('Offer declined.');
      fetchOffers();
    } catch (err) {
      alert(err.message || 'Failed to reject offer.');
    }
  };

  const handleCounterSubmit = async (e) => {
    e.preventDefault();
    if (!counterModal.counterPrice) return;
    try {
      await api.patch(`/offers/${counterModal.offer._id}/counter`, {
        counterPrice: Number(counterModal.counterPrice),
        message: counterModal.message,
      });
      setFeedbackToast('Counter-offer sent to the buyer.');
      setCounterModal({ isOpen: false, offer: null, counterPrice: '', message: '' });
      fetchOffers();
    } catch (err) {
      alert(err.message || 'Failed to submit counter-offer.');
    }
  };

  const handleMessageBuyer = async (buyerId, listingId) => {
    try {
      const res = await api.post('/conversations', { recipientId: buyerId, listingId });
      if (res.data.success) {
        navigate('/farmer/messages');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOffers = offers.filter((o) => {
    if (statusFilter === 'All') return true;
    return o.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-agritext-main">Buyer Offers Received</h1>
          <p className="text-xs text-agritext-secondary mt-0.5">
            Review incoming proposals, compare transport expenses, and negotiate fair terms.
          </p>
        </div>
        <Link
          to={listingIdParam ? `/farmer/compare-offers?listingId=${listingIdParam}` : '/farmer/compare-offers'}
          className="btn-primary text-xs py-2 px-3.5 flex items-center gap-2"
        >
          <GitCompare className="w-4 h-4" />
          <span>Open Side-by-Side Comparison</span>
        </Link>
      </div>

      {feedbackToast && (
        <div className="p-3.5 rounded-xl bg-agrigreen-100 border border-agrigreen-200 text-forest text-xs font-semibold flex items-center justify-between">
          <span>{feedbackToast}</span>
          <button onClick={() => setFeedbackToast(null)} className="text-forest hover:opacity-75">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['All', 'Pending', 'Accepted', 'Counter-Offered', 'Rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              statusFilter === tab
                ? 'bg-forest text-white shadow-xs'
                : 'bg-white border border-agriborder text-agritext-secondary hover:bg-cream'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Offers Cards */}
      {loading ? (
        <LoadingSpinner text="Loading incoming offers..." />
      ) : filteredOffers.length > 0 ? (
        <div className="space-y-4">
          {filteredOffers.map((offer) => (
            <div
              key={offer._id}
              className={`card p-5 bg-white border transition-all ${
                offer.isHighestNetEarnings && offer.status === 'pending'
                  ? 'border-forest shadow-md'
                  : 'border-agriborder'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Buyer & Crop */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-agritext-main">
                      {offer.buyerId?.name || 'Commercial Buyer'}
                    </span>
                    {offer.buyerId?.verificationStatus === 'verified' && (
                      <span className="inline-flex items-center gap-0.5 text-forest text-[11px] font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Buyer</span>
                      </span>
                    )}
                    <StatusBadge status={offer.status} />
                    {offer.isHighestNetEarnings && offer.status === 'pending' && (
                      <span className="badge-green text-[10px] font-bold">
                        ★ Highest Estimated Net
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-agritext-secondary">
                    Offering for: <strong className="text-agritext-main">{offer.listingId?.cropName}</strong> • {offer.buyerId?.location?.district || 'Karnataka'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                    <span className="text-agritext-secondary">
                      Terms: <strong className="text-agritext-main">{offer.paymentTerms}</strong>
                    </span>
                    <span>•</span>
                    <span className="text-agritext-secondary">
                      Logistics: <strong className="text-agritext-main">{offer.deliveryPreference}</strong>
                    </span>
                  </div>

                  {offer.message && (
                    <p className="text-xs italic bg-cream/70 p-2 rounded-lg text-agritext-secondary mt-2">
                      “{offer.message}”
                    </p>
                  )}
                </div>

                {/* Middle: Financials breakdown */}
                <div className="flex items-center gap-6 lg:border-x lg:border-agriborder lg:px-6 py-2 lg:py-0">
                  <div>
                    <span className="text-[10px] font-bold text-agritext-secondary uppercase tracking-wider block">
                      Offered Price
                    </span>
                    <span className="text-base font-extrabold text-forest">
                      {formatRupee(offer.offeredPrice)}
                    </span>
                    <span className="text-xs text-agritext-secondary block">
                      for {offer.requestedQuantity} {offer.quantityUnit}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-agritext-secondary uppercase tracking-wider block">
                      Gross Value
                    </span>
                    <span className="text-base font-bold text-agritext-main">
                      {formatRupee(offer.grossOfferValue)}
                    </span>
                    <span className="text-xs text-agrierror block">
                      -
                      {formatRupee(
                        (offer.estimatedExpenses?.transportation || 0) +
                          (offer.estimatedExpenses?.packaging || 0)
                      )}{' '}
                      logistics
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-agrigreen-50 border border-agrigreen-200">
                    <span className="text-[10px] font-bold text-forest uppercase tracking-wider block">
                      Est. Net Return
                    </span>
                    <span className="text-lg font-black text-forest">
                      {formatRupee(offer.estimatedNetEarnings)}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center lg:flex-col gap-2 shrink-0">
                  {offer.status === 'pending' || offer.status === 'counter-offered' ? (
                    <>
                      <button
                        onClick={() => setAcceptModal({ isOpen: true, offer, loading: false })}
                        className="btn-primary text-xs py-2 px-3.5 w-full justify-center"
                      >
                        Accept & Reserve
                      </button>
                      <button
                        onClick={() =>
                          setCounterModal({
                            isOpen: true,
                            offer,
                            counterPrice: offer.offeredPrice,
                            message: '',
                          })
                        }
                        className="btn-secondary text-xs py-2 px-3.5 w-full justify-center"
                      >
                        Counter-Offer
                      </button>
                      <button
                        onClick={() => handleRejectOffer(offer._id)}
                        className="text-xs text-agrierror hover:underline px-2 py-1"
                      >
                        Decline
                      </button>
                    </>
                  ) : null}

                  <button
                    onClick={() =>
                      handleMessageBuyer(offer.buyerId?._id, offer.listingId?._id)
                    }
                    className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message Buyer</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title="No offers found"
          description="You haven't received any buyer proposals matching this filter."
        />
      )}

      {/* Accept Confirmation Modal */}
      {acceptModal.isOpen && acceptModal.offer && (
        <ConfirmationModal
          isOpen={acceptModal.isOpen}
          onClose={() => setAcceptModal({ isOpen: false, offer: null, loading: false })}
          onConfirm={handleAcceptOffer}
          loading={acceptModal.loading}
          title="Accept Buyer Offer & Reserve Stock"
          message={`Are you sure you want to accept this offer from ${
            acceptModal.offer.buyerId?.name
          } for ${acceptModal.offer.requestedQuantity} ${
            acceptModal.offer.quantityUnit
          } at ${formatRupee(acceptModal.offer.offeredPrice)}/${
            acceptModal.offer.priceUnit
          }? This will deduct ${acceptModal.offer.requestedQuantity} ${
            acceptModal.offer.quantityUnit
          } from your available stock and create an official sale order.`}
          confirmText="Yes, Accept Offer"
        />
      )}

      {/* Counter-Offer Modal */}
      {counterModal.isOpen && counterModal.offer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-agriborder space-y-4">
            <h3 className="text-lg font-bold text-agritext-main">
              Submit Counter-Offer
            </h3>
            <p className="text-xs text-agritext-secondary">
              Propose an alternative price for {counterModal.offer.requestedQuantity}{' '}
              {counterModal.offer.quantityUnit} of {counterModal.offer.listingId?.cropName}.
            </p>

            <form onSubmit={handleCounterSubmit} className="space-y-4">
              <div>
                <label className="label-text text-xs">
                  Your Counter Price (₹ / {counterModal.offer.priceUnit})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-agritext-secondary font-semibold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={counterModal.counterPrice}
                    onChange={(e) =>
                      setCounterModal({ ...counterModal, counterPrice: e.target.value })
                    }
                    className="input-field pl-7 text-xs font-bold text-forest"
                  />
                </div>
              </div>

              <div>
                <label className="label-text text-xs">Note / Negotiation Reason</label>
                <textarea
                  rows={3}
                  value={counterModal.message}
                  onChange={(e) =>
                    setCounterModal({ ...counterModal, message: e.target.value })
                  }
                  placeholder="Explain why this price aligns with produce quality or logistics..."
                  className="input-field text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setCounterModal({
                      isOpen: false,
                      offer: null,
                      counterPrice: '',
                      message: '',
                    })
                  }
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Send Counter-Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerOffersPage;
