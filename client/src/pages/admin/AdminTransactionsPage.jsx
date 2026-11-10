import React, { useState, useEffect } from 'react';
import { ShoppingBag, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { formatRupee, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const AdminTransactionsPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sales');
      if (res.data.success) {
        setSales(res.data.sales || []);
      }
    } catch (err) {
      console.warn('Error loading platform sales:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-agritext-main">Platform Orders & Transactions</h1>
        <p className="text-xs text-agritext-secondary mt-0.5">
          Auditing trade fulfillment, reported disputes, and payments.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading transaction records..." />
      ) : (
        <div className="card overflow-hidden bg-white border-agriborder">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream/60 border-b border-agriborder uppercase text-agritext-secondary text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Produce</th>
                  <th className="py-3 px-4">Farmer</th>
                  <th className="py-3 px-4">Buyer</th>
                  <th className="py-3 px-4">Gross Value</th>
                  <th className="py-3 px-4">Delivery Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Sale Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agriborder/60">
                {sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-cream/30">
                    <td className="py-3 px-4 font-mono font-bold text-forest">
                      {sale.saleReference}
                    </td>
                    <td className="py-3 px-4 font-semibold text-agritext-main">
                      {sale.listingId?.cropName}
                    </td>
                    <td className="py-3 px-4">{sale.farmerId?.name}</td>
                    <td className="py-3 px-4">{sale.buyerId?.name}</td>
                    <td className="py-3 px-4 font-bold text-forest">
                      {formatRupee(sale.grossSaleValue)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={sale.deliveryStatus} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={sale.paymentStatus} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={sale.saleStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactionsPage;
