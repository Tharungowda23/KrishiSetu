import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Truck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import api from '../../services/api';
import { formatRupee, formatDate, formatIndianNumber } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';

const FarmerSalesPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState('All');

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sales');
      if (res.data.success) {
        setSales(res.data.sales || []);
      }
    } catch (err) {
      console.warn('Error loading sales:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const filteredSales = sales.filter((s) => {
    if (tabFilter === 'All') return true;
    return (
      s.deliveryStatus?.toLowerCase() === tabFilter.toLowerCase() ||
      s.saleStatus?.toLowerCase() === tabFilter.toLowerCase()
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-agritext-main">My Sales & Orders</h1>
        <p className="text-xs text-agritext-secondary mt-0.5">
          Track pickup scheduling, transport transit, and finalized expense records.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['All', 'Awaiting Pickup', 'In Transit', 'Delivered', 'Completed', 'Disputed'].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setTabFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                tabFilter === tab
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-white border border-agriborder text-agritext-secondary hover:bg-cream'
              }`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading sales orders..." />
      ) : filteredSales.length > 0 ? (
        <div className="space-y-4">
          {filteredSales.map((sale) => (
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
                  <StatusBadge status={sale.saleStatus} />
                </div>

                <h3 className="font-bold text-base text-agritext-main">
                  {sale.listingId?.cropName || 'Produce Batch'}
                </h3>

                <p className="text-xs text-agritext-secondary">
                  Buyer: <strong className="text-agritext-main">{sale.buyerId?.name}</strong> • Agreed: {formatIndianNumber(sale.agreedQuantity)} {sale.quantityUnit} @ {formatRupee(sale.agreedPrice)}/{sale.priceUnit}
                </p>

                <div className="flex items-center gap-3 text-xs text-agritext-secondary pt-1">
                  <span>Created: {formatDate(sale.createdAt)}</span>
                  <span>•</span>
                  <span>
                    Payment: <strong>{sale.paymentStatus}</strong>
                  </span>
                </div>
              </div>

              {/* Financials Column */}
              <div className="flex items-center gap-6 md:border-l md:border-agriborder md:pl-6 py-2 md:py-0">
                <div>
                  <span className="text-[10px] font-bold text-agritext-secondary uppercase tracking-wider block">
                    Agreed Sale Value
                  </span>
                  <span className="text-base font-extrabold text-agritext-main">
                    {formatRupee(sale.grossSaleValue)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-agrigreen-50 border border-agrigreen-200">
                  <span className="text-[10px] font-bold text-forest uppercase tracking-wider block">
                    {sale.actualExpenses?.isFinalized ? 'Actual Net' : 'Est. Net'}
                  </span>
                  <span className="text-lg font-black text-forest">
                    {formatRupee(
                      sale.actualNetEarnings !== null
                        ? sale.actualNetEarnings
                        : sale.netEarningsEstimate
                    )}
                  </span>
                </div>

                <Link
                  to={`/farmer/sales/${sale._id}`}
                  className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shrink-0"
                >
                  <span>Order Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={TrendingUp}
          title="No sales orders found"
          description="You do not have any accepted sales orders matching this status filter."
        />
      )}
    </div>
  );
};

export default FarmerSalesPage;
