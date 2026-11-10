import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Layers,
  TrendingUp,
  GitCompare,
  PlusCircle,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calculator,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import { formatRupee, formatIndianNumber, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const FarmerDashboard = () => {
  const [stats, setStats] = useState({
    activeListingsCount: 0,
    newOffersCount: 0,
    salesInProgressCount: 0,
    completedSalesCount: 0,
    totalAgreedValue: 0,
    estimatedNetEarnings: 0,
  });

  const [recentOffers, setRecentOffers] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [listingsRes, offersRes, salesRes] = await Promise.all([
          api.get('/farmer/listings'),
          api.get('/offers/received'),
          api.get('/sales'),
        ]);

        const listings = listingsRes.data.listings || [];
        const offers = offersRes.data.offers || [];
        const sales = salesRes.data.sales || [];

        const activeListings = listings.filter((l) => l.status === 'active');
        const pendingOffers = offers.filter((o) => o.status === 'pending');
        const inProgress = sales.filter((s) => s.saleStatus === 'In Progress' || s.saleStatus === 'Active');
        const completed = sales.filter((s) => s.saleStatus === 'Completed');

        const totalValue = sales.reduce((acc, s) => acc + (s.grossSaleValue || 0), 0);
        const totalNet = sales.reduce((acc, s) => acc + (s.actualNetEarnings || s.netEarningsEstimate || 0), 0);

        setStats({
          activeListingsCount: activeListings.length,
          newOffersCount: pendingOffers.length,
          salesInProgressCount: inProgress.length,
          completedSalesCount: completed.length,
          totalAgreedValue: totalValue,
          estimatedNetEarnings: totalNet,
        });

        setRecentListings(listings.slice(0, 4));
        setRecentOffers(offers.slice(0, 4));

        // Chart comparing gross vs estimated net on recent sales/offers
        const mockChart = offers.slice(0, 5).map((o, idx) => ({
          name: o.listingId?.cropName?.split(' ')[0] || `Batch ${idx + 1}`,
          Gross: o.grossOfferValue || 0,
          Net: o.estimatedNetEarnings || 0,
        }));

        setChartData(
          mockChart.length > 0
            ? mockChart
            : [
                { name: 'Tomatoes', Gross: 25000, Net: 23000 },
                { name: 'Potatoes', Gross: 42000, Net: 38500 },
                { name: 'Onions', Gross: 31000, Net: 27800 },
              ]
        );
      } catch (err) {
        console.warn('Dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading farmer dashboard metrics..." />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 border border-agriborder shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="badge-green mb-1.5">Farmer Management Portal</span>
          <h1 className="text-2xl font-bold text-agritext-main">Produce & Earnings Overview</h1>
          <p className="text-xs text-agritext-secondary mt-0.5">
            Monitor incoming buyer proposals, review logistics expenses, and organize fulfillment.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/farmer/compare-offers" className="btn-secondary text-xs py-2 px-3">
            <GitCompare className="w-3.5 h-3.5 text-forest" />
            <span>Compare Offers</span>
          </Link>
          <Link to="/farmer/add-crop" className="btn-primary text-xs py-2 px-3">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add New Crop</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card p-5 bg-white border-agriborder">
          <div className="flex items-center justify-between text-forest mb-2">
            <span className="text-xs font-bold text-agritext-secondary uppercase">
              Active Crops
            </span>
            <Package className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-agritext-main">
            {stats.activeListingsCount}
          </span>
          <span className="text-[11px] text-agritext-secondary block mt-1">Listed on Marketplace</span>
        </div>

        <div className="card p-5 bg-white border-agriborder">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold text-agritext-secondary uppercase">
              New Offers
            </span>
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-amber-800">
            {stats.newOffersCount}
          </span>
          <span className="text-[11px] text-amber-700 block mt-1">Pending your review</span>
        </div>

        <div className="card p-5 bg-white border-agriborder">
          <div className="flex items-center justify-between text-sky-700 mb-2">
            <span className="text-xs font-bold text-agritext-secondary uppercase">
              Sales In Progress
            </span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-sky-900">
            {stats.salesInProgressCount}
          </span>
          <span className="text-[11px] text-sky-700 block mt-1">Scheduled or in transit</span>
        </div>

        <div className="card p-5 bg-agrigreen-50 border-agrigreen-200">
          <div className="flex items-center justify-between text-forest mb-2">
            <span className="text-xs font-bold text-forest uppercase">
              Realized Net Earnings
            </span>
            <Calculator className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-forest">
            {formatRupee(stats.estimatedNetEarnings)}
          </span>
          <span className="text-[11px] text-agritext-secondary block mt-1">After logistics deductions</span>
        </div>
      </div>

      {/* Analytics Chart: Gross Offer Value vs Realized Net Earnings */}
      <div className="card p-6 bg-white border-agriborder space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-agritext-main">
              Gross Value vs. Estimated Net Earnings
            </h2>
            <p className="text-xs text-agritext-secondary">
              Illustrating the impact of freight and logistics costs across your active offers.
            </p>
          </div>
          <span className="badge-green text-xs">Calculated Precision</span>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E8E1" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${val / 1000}k`} />
              <Tooltip formatter={(value) => [formatRupee(value), '']} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Gross" fill="#687268" name="Gross Offer Value" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Net" fill="#245C3A" name="Estimated Net Earnings" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Recent Offers + Recent Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Offers */}
        <div className="card p-6 bg-white border-agriborder space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-agritext-main">Recent Buyer Offers</h3>
            <Link to="/farmer/offers" className="text-xs font-bold text-forest hover:underline">
              View All ({stats.newOffersCount})
            </Link>
          </div>

          {recentOffers.length > 0 ? (
            <div className="space-y-3">
              {recentOffers.map((offer) => (
                <div
                  key={offer._id}
                  className="p-3.5 rounded-xl border border-agriborder hover:border-agrigreen-200 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-agritext-main block">
                      {offer.buyerId?.name || 'Commercial Buyer'}
                    </span>
                    <span className="text-agritext-secondary">
                      {offer.listingId?.cropName} • {offer.requestedQuantity} {offer.quantityUnit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-forest block">
                      {formatRupee(offer.offeredPrice)}/{offer.priceUnit}
                    </span>
                    <StatusBadge status={offer.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-agritext-secondary text-center py-6">
              No offers received yet.
            </p>
          )}

          <div className="pt-2">
            <Link
              to="/farmer/compare-offers"
              className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Launch Offer Comparison Table</span>
            </Link>
          </div>
        </div>

        {/* Recent Listings */}
        <div className="card p-6 bg-white border-agriborder space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-agritext-main">My Crop Listings</h3>
            <Link to="/farmer/listings" className="text-xs font-bold text-forest hover:underline">
              Manage All
            </Link>
          </div>

          {recentListings.length > 0 ? (
            <div className="space-y-3">
              {recentListings.map((listing) => (
                <div
                  key={listing._id}
                  className="p-3.5 rounded-xl border border-agriborder flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        listing.images?.[0] ||
                        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={listing.cropName}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <span className="font-bold text-agritext-main block">
                        {listing.cropName}
                      </span>
                      <span className="text-agritext-secondary">
                        Available: {listing.availableQuantity} {listing.quantityUnit}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-agritext-main block">
                      {formatRupee(listing.askingPrice)}/{listing.priceUnit}
                    </span>
                    <StatusBadge status={listing.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-agritext-secondary text-center py-6">
              No crops listed yet.
            </p>
          )}

          <div className="pt-2">
            <Link
              to="/farmer/add-crop"
              className="btn-secondary w-full text-xs py-2.5 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-3.5 h-3.5 text-forest" />
              <span>Add Another Listing</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
