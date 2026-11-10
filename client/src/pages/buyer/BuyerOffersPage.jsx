import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertTriangle,
  Clock,
  PackageCheck,
  Ban,
  Undo2,
  ShieldCheck,
  MapPin,
  Truck,
  CreditCard,
  MessageSquare,
  Tag,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import { formatRupee, formatIndianNumber } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmationModal from '../../components/common/ConfirmationModal';

/* ── Status pill config ───────────────────────────────────────── */
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  'counter-offered': {
    label: 'Counter-Offered',
    icon: RefreshCw,
    cls: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  accepted: {
    label: 'Accepted',
    icon: PackageCheck,
    cls: 'bg-agrigreen-50 text-forest border-agrigreen-200',
  },
  rejected: {
    label: 'Rejected',
    icon: Ban,
    cls: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  withdrawn: {
    label: 'Withdrawn',
    icon: Undo2,
    cls: 'bg-gray-100 text-gray-500 border-gray-200',
  },
};

const StatusPill = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['pending'];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

/* ── Main Page ────────────────────────────────────────────────── */
const BuyerOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [acceptModal, setAcceptModal] = useState({ isOpen: false, offer: null, loading: false });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/offers/sent');
      if (res.data.success) setOffers(res.data.offers || []);
    } catch (err) {
      console.warn('Error loading offers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOffers(); }, []);

  const handleWithdraw = async (offerId) => {
    if (!window.confirm('Withdraw this offer? The farmer will be notified.')) return;
    try {
      await api.patch(`/offers/${offerId}/withdraw`);
      showToast('Offer withdrawn successfully.');
      fetchOffers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to withdraw.', 'error');
    }
  };

  const handleAcceptCounter = async () => {
    if (!acceptModal.offer) return;
    setAcceptModal((p) => ({ ...p, loading: true }));
    try {
      const res = await api.patch(`/offers/${acceptModal.offer._id}/accept-counter`);
      showToast(`✅ Counter-offer accepted! Order: ${res.data.sale?.saleReference}`);
      setAcceptModal({ isOpen: false, offer: null, loading: false });
      fetchOffers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to accept.', 'error');
      setAcceptModal({ isOpen: false, offer: null, loading: false });
    }
  };

  const TABS = [
    { key: 'all', label: 'All Offers' },
    { key: 'pending', label: 'Pending' },
    { key: 'counter-offered', label: 'Counter-Offered' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'withdrawn', label: 'Withdrawn' },
  ];

  const filtered = offers.filter((o) =>
    statusFilter === 'all' ? true : o.status === statusFilter
  );

  /* counts for tab badges */
  const counts = offers.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-16">

      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-agritext-main">My Purchase Offers</h1>
          <p className="text-sm text-agritext-secondary mt-1">
            Track and respond to all offers you've submitted to farmers.
          </p>
        </div>
        <Link
          to="/marketplace"
          className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shrink-0"
        >
          <Tag className="w-3.5 h-3.5" />
          Browse More
        </Link>
      </div>

      {/* ── Toast ─────────────────────────────────────────── */}
      {toast && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-agrigreen-50 border-agrigreen-200 text-forest'
          }`}
        >
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="text-xs underline opacity-70 hover:opacity-100 shrink-0">
            Dismiss
          </button>
        </div>
      )}

      {/* ── Filter Tabs ───────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const count = tab.key === 'all' ? offers.length : (counts[tab.key] || 0);
          const active = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? 'bg-forest text-white shadow-sm'
                  : 'bg-white border border-agriborder text-agritext-secondary hover:bg-cream hover:border-forest/30'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-agrigreen-100 text-forest'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Offers List ───────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner text="Loading your offers..." />
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((offer) => {
            const isCounter = offer.status === 'counter-offered';
            const isPending = offer.status === 'pending';
            const isAccepted = offer.status === 'accepted';

            return (
              <div
                key={offer._id}
                className={`rounded-2xl border bg-white overflow-hidden shadow-sm transition-shadow hover:shadow-md ${
                  isCounter ? 'border-orange-300' : 'border-agriborder'
                }`}
              >
                {/* Counter-offer alert strip */}
                {isCounter && (
                  <div className="flex items-center gap-2.5 px-5 py-2.5 bg-orange-50 border-b border-orange-200">
                    <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                    <p className="text-xs font-semibold text-orange-700">
                      The farmer has submitted a counter-offer on this listing. Please accept or withdraw below.
                    </p>
                  </div>
                )}

                <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-5">

                  {/* ── Left: Crop & Details ──────────────── */}
                  <div className="flex-1 min-w-0 space-y-3">

                    {/* Title row */}
                    <div className="flex items-start gap-3">
                      {/* Crop icon placeholder */}
                      <div className="w-11 h-11 rounded-xl bg-agrigreen-50 border border-agrigreen-200 flex items-center justify-center shrink-0">
                        <Layers className="w-5 h-5 text-forest" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-agritext-main leading-tight">
                            {offer.listingId?.cropName || 'Produce Batch'}
                          </h3>
                          <StatusPill status={offer.status} />
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-agritext-secondary">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>
                            <strong className="text-agritext-main">{offer.farmerId?.name}</strong>
                            {' • '}
                            {offer.farmerId?.location?.district || 'Karnataka'}
                          </span>
                          {offer.farmerId?.verificationStatus === 'verified' && (
                            <span className="inline-flex items-center gap-0.5 text-forest font-semibold">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Meta chips */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream border border-agriborder text-xs text-agritext-secondary">
                        <PackageCheck className="w-3 h-3 text-forest" />
                        <span>
                          <strong className="text-agritext-main">
                            {formatIndianNumber(offer.requestedQuantity)} {offer.quantityUnit}
                          </strong>{' '}
                          requested
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream border border-agriborder text-xs text-agritext-secondary">
                        <Truck className="w-3 h-3 text-forest" />
                        {offer.deliveryPreference}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream border border-agriborder text-xs text-agritext-secondary">
                        <CreditCard className="w-3 h-3 text-forest" />
                        {offer.paymentTerms}
                      </span>
                    </div>

                    {/* Buyer's message */}
                    {offer.message && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-cream border border-agriborder">
                        <MessageSquare className="w-3.5 h-3.5 text-agritext-secondary shrink-0 mt-0.5" />
                        <p className="text-xs italic text-agritext-secondary leading-relaxed">
                          "{offer.message}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ── Right: Financials + Actions ──────── */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 lg:gap-5 shrink-0 lg:min-w-[200px]">

                    {/* Price block */}
                    <div className="flex gap-5 lg:gap-4 lg:w-full">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] font-bold text-agritext-secondary uppercase tracking-wider block mb-0.5">
                          Offered Rate
                        </span>
                        <span className="text-xl font-extrabold text-forest block leading-tight">
                          {formatRupee(offer.offeredPrice)}
                        </span>
                        <span className="text-[11px] text-agritext-secondary">
                          per {offer.priceUnit}
                        </span>
                      </div>

                      <div className="w-px bg-agriborder hidden lg:block" />

                      <div className="text-left lg:text-right">
                        <span className="text-[10px] font-bold text-agritext-secondary uppercase tracking-wider block mb-0.5">
                          Total Value
                        </span>
                        <span className="text-xl font-extrabold text-agritext-main block leading-tight">
                          {formatRupee(offer.grossOfferValue)}
                        </span>
                        <span className="text-[11px] text-agritext-secondary">gross value</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 w-full lg:min-w-[160px]">
                      {isCounter && (
                        <>
                          <button
                            onClick={() => setAcceptModal({ isOpen: true, offer, loading: false })}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-light transition-colors shadow-sm"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Accept Offer
                          </button>
                          <button
                            onClick={() => handleWithdraw(offer._id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Withdraw Offer
                          </button>
                        </>
                      )}

                      {isPending && (
                        <button
                          onClick={() => handleWithdraw(offer._id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Withdraw Offer
                        </button>
                      )}

                      {isAccepted && (
                        <Link
                          to="/buyer/purchases"
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-light transition-colors shadow-sm"
                        >
                          <ArrowRight className="w-4 h-4" />
                          View Purchase
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title="No offers found"
          description={
            statusFilter === 'all'
              ? "You haven't submitted any offers yet. Browse the marketplace to find produce."
              : `No offers with status "${statusFilter}" found.`
          }
          actionLabel="Browse Marketplace"
          actionLink="/marketplace"
        />
      )}

      {/* ── Accept Counter-Offer Modal ─────────────────── */}
      {acceptModal.isOpen && acceptModal.offer && (
        <ConfirmationModal
          isOpen={acceptModal.isOpen}
          onClose={() => setAcceptModal({ isOpen: false, offer: null, loading: false })}
          onConfirm={handleAcceptCounter}
          loading={acceptModal.loading}
          title="Accept Farmer's Counter-Offer"
          message={`You are agreeing to purchase ${acceptModal.offer.requestedQuantity} ${acceptModal.offer.quantityUnit} of ${
            acceptModal.offer.listingId?.cropName || 'produce'
          } at ${formatRupee(acceptModal.offer.offeredPrice)}/${acceptModal.offer.priceUnit} — Total: ${formatRupee(
            acceptModal.offer.grossOfferValue
          )}. Stock will be reserved and a sale order will be created immediately.`}
          confirmText="Confirm & Accept Counter-Offer"
        />
      )}
    </div>
  );
};

export default BuyerOffersPage;
