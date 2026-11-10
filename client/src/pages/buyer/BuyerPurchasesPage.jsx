import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { formatRupee, formatDate, formatIndianNumber } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';

const BuyerPurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sales');
      if (res.data.success) {
        setPurchases(res.data.sales || []);
      }
    } catch (err) {
      console.warn('Error loading buyer purchases:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const filteredPurchases = purchases.filter((p) => {
    if (statusFilter === 'All') return true;
    return (
      p.deliveryStatus?.toLowerCase() === statusFilter.toLowerCase() ||
      p.saleStatus?.toLowerCase() === statusFilter.toLowerCase()
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-agritext-main">My Purchases & Orders</h1>
        <p className="text-xs text-agritext-secondary mt-0.5">
          Track pickup vehicle dispatches, transit progress, and order receipts.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['All', 'Awaiting Pickup', 'In Transit', 'Delivered', 'Completed'].map((tab) => (
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

      {loading ? (
        <LoadingSpinner text="Loading your purchase orders..." />
      ) : filteredPurchases.length > 0 ? (
        <div className="space-y-4">
          {filteredPurchases.map((sale) => (
            <div
              key={sale._id}
              className="card p-5 bg-white border border-agriborder hover:border-agrigreen-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-forest bg-agrigreen-50 px-2.5 py-0.5 rounded border border-agrigreen-200">
                    {sale.saleReference}
                  </span>
                  <StatusBadge status={sale.deliveryStatus} />
                  <StatusBadge status={sale.paymentStatus} />
                </div>

                <h3 className="font-bold text-base text-agritext-main">
                  {sale.listingId?.cropName || 'Produce Batch'}
                </h3>

                <p className="text-xs text-agritext-secondary">
                  Producer: <strong className="text-agritext-main">{sale.farmerId?.name}</strong> • {sale.pickupLocation?.district || 'Karnataka'}
                </p>

                <div className="flex items-center gap-3 text-xs text-agritext-secondary pt-1">
                  <span>
                    Volume: <strong>{formatIndianNumber(sale.agreedQuantity)} {sale.quantityUnit}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Price: <strong>{formatRupee(sale.agreedPrice)}/{sale.priceUnit}</strong>
                  </span>
                </div>
              </div>

              {/* Financials & Detail Link */}
              <div className="flex items-center gap-6 md:border-l md:border-agriborder md:pl-6 py-2 md:py-0">
                <div>
                  <span className="text-[10px] font-bold text-agritext-secondary uppercase tracking-wider block">
                    Total Order Value
                  </span>
                  <span className="text-lg font-black text-agritext-main">
                    {formatRupee(sale.grossSaleValue)}
                  </span>
                </div>

                <Link
                  to={`/buyer/purchases/${sale._id}`}
                  className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shrink-0"
                >
                  <span>Track Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="No purchase orders"
          description="You haven't completed any crop purchases yet. Browse the marketplace and make an offer on farm produce!"
          actionLabel="Browse Produce"
          actionLink="/marketplace"
        />
      )}
    </div>
  );
};

export default BuyerPurchasesPage;
