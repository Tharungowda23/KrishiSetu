import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Layers,
  ShoppingBag,
  Bookmark,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import api from '../../services/api';
import { formatRupee, formatIndianNumber, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const BuyerDashboard = () => {
  const [stats, setStats] = useState({
    activeOffersCount: 0,
    acceptedOffersCount: 0,
    ordersInProgressCount: 0,
    completedPurchasesCount: 0,
    totalAgreedPurchaseValue: 0,
  });

  const [sentOffers, setSentOffers] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuyerData = async () => {
      try {
        const [offersRes, salesRes, savedRes] = await Promise.all([
          api.get('/offers/sent'),
          api.get('/sales'),
          api.get('/saved-listings'),
        ]);

        const offers = offersRes.data.offers || [];
        const sales = salesRes.data.sales || [];
        const saved = savedRes.data.savedListings || [];

        const activeOffers = offers.filter((o) => o.status === 'pending' || o.status === 'counter-offered');
        const acceptedOffers = offers.filter((o) => o.status === 'accepted');
        const inProgress = sales.filter((s) => s.saleStatus === 'In Progress' || s.saleStatus === 'Active');
        const completed = sales.filter((s) => s.saleStatus === 'Completed');

        const totalValue = sales.reduce((acc, s) => acc + (s.grossSaleValue || 0), 0);

        setStats({
          activeOffersCount: activeOffers.length,
          acceptedOffersCount: acceptedOffers.length,
          ordersInProgressCount: inProgress.length,
          completedPurchasesCount: completed.length,
          totalAgreedPurchaseValue: totalValue,
        });

        setSentOffers(offers.slice(0, 5));
        setSavedCount(saved.length);
      } catch (err) {
        console.warn('Buyer dashboard data error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyerData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading commercial buyer dashboard..." />;

  return (
    <div className="space-y-8 pb-12">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-agriborder shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="badge-blue mb-1.5">Commercial Buyer Portal</span>
          <h1 className="text-2xl font-bold text-agritext-main">Procurement & Sourcing Hub</h1>
          <p className="text-xs text-agritext-secondary mt-0.5">
            Monitor farm proposals, manage pending negotiation counter-offers, and track dispatches.
          </p>
        </div>
        <Link to="/marketplace" className="btn-primary text-xs py-2 px-4 flex items-center gap-2">
          <Store className="w-4 h-4" />
          <span>Browse Fresh Harvests</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card p-5 bg-white border-agriborder">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold text-agritext-secondary uppercase">
              Pending Offers
            </span>
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-amber-800">{stats.activeOffersCount}</span>
          <span className="text-[11px] text-agritext-secondary block mt-1">Awaiting response</span>
        </div>

        <div className="card p-5 bg-white border-agriborder">
          <div className="flex items-center justify-between text-forest mb-2">
            <span className="text-xs font-bold text-agritext-secondary uppercase">
              Accepted Orders
            </span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-forest">{stats.acceptedOffersCount}</span>
          <span className="text-[11px] text-forest block mt-1">Ready for fulfillment</span>
        </div>

        <div className="card p-5 bg-white border-agriborder">
          <div className="flex items-center justify-between text-sky-700 mb-2">
            <span className="text-xs font-bold text-agritext-secondary uppercase">
              In Transit
            </span>
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-sky-900">{stats.ordersInProgressCount}</span>
          <span className="text-[11px] text-sky-700 block mt-1">Haulage in progress</span>
        </div>

        <div className="card p-5 bg-white border-agriborder">
          <div className="flex items-center justify-between text-forest mb-2">
            <span className="text-xs font-bold text-agritext-secondary uppercase">
              Agreed Purchase GMV
            </span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-agritext-main">
            {formatRupee(stats.totalAgreedPurchaseValue)}
          </span>
          <span className="text-[11px] text-agritext-secondary block mt-1">Across all confirmed sales</span>
        </div>
      </div>

      {/* Grid: Pending Offers & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sent Offers Table */}
        <div className="lg:col-span-8 card p-6 bg-white border-agriborder space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-agritext-main">Recent Purchase Proposals</h3>
            <Link to="/buyer/offers" className="text-xs font-bold text-forest hover:underline">
              View All ({stats.activeOffersCount})
            </Link>
          </div>

          {sentOffers.length > 0 ? (
            <div className="divide-y divide-agriborder/60">
              {sentOffers.map((offer) => (
                <div
                  key={offer._id}
                  className="py-3.5 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm text-agritext-main block">
                      {offer.listingId?.cropName || 'Crop Listing'}
                    </span>
                    <p className="text-agritext-secondary">
                      Producer: <strong className="text-agritext-main">{offer.farmerId?.name}</strong> • {offer.farmerId?.location?.district}
                    </p>
                    <span className="text-[11px] text-agritext-muted">
                      Requested: {offer.requestedQuantity} {offer.quantityUnit} @ {formatRupee(offer.offeredPrice)}/{offer.priceUnit}
                    </span>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="font-extrabold text-forest text-sm block">
                      {formatRupee(offer.grossOfferValue)}
                    </span>
                    <StatusBadge status={offer.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-agritext-secondary text-center py-8">
              You haven't submitted any offers yet. Explore the marketplace to bid directly on farm produce!
            </p>
          )}
        </div>

        {/* Saved & Quick Tools */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-6 bg-agrigreen-50 border border-agrigreen-200 space-y-4">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-forest" />
              <h3 className="text-base font-bold text-agritext-main">Saved Crops</h3>
            </div>
            <p className="text-xs text-agritext-secondary">
              You have <strong className="text-forest font-bold">{savedCount} produce listings</strong> saved for tracking price developments.
            </p>
            <Link to="/buyer/saved" className="btn-secondary w-full text-xs py-2 justify-center">
              View Bookmarked Produce
            </Link>
          </div>

          <div className="card p-6 bg-white border border-agriborder space-y-3">
            <h4 className="text-xs font-bold text-agritext-main uppercase tracking-wider">
              Logistics & Freight Tools
            </h4>
            <p className="text-xs text-agritext-secondary">
              Calculate road distances and check commercial vehicle freight charges across Karnataka.
            </p>
            <Link
              to="/transport-estimator"
              className="btn-primary w-full text-xs py-2 justify-center flex items-center gap-2"
            >
              <span>Launch Freight Calculator</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
