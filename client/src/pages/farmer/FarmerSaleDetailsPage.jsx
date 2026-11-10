import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Edit2,
  AlertCircle,
  FileText,
  MapPin,
  Calendar,
  Send,
  MessageSquare,
  DollarSign,
} from 'lucide-react';
import api from '../../services/api';
import { formatRupee, formatDate, formatIndianNumber } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const FarmerSaleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackToast, setFeedbackToast] = useState(null);

  // Status update state
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Actual expense editing state
  const [editExpensesModal, setEditExpensesModal] = useState(false);
  const [expensesData, setExpensesData] = useState({
    transportation: 0,
    packaging: 0,
    loading: 0,
    platformFees: 0,
    otherExpenses: 0,
  });

  const fetchSale = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/sales/${id}`);
      if (res.data.success) {
        const s = res.data.sale;
        setSale(s);
        setDeliveryStatus(s.deliveryStatus);
        setPaymentStatus(s.paymentStatus);
        setVehicleNumber(s.transportDetails?.vehicleNumber || '');
        setDriverPhone(s.transportDetails?.driverPhone || '');
        setCarrierName(s.transportDetails?.carrierName || '');

        setExpensesData({
          transportation: s.actualExpenses?.transportation || s.estimatedExpenses?.transportation || 0,
          packaging: s.actualExpenses?.packaging || s.estimatedExpenses?.packaging || 0,
          loading: s.actualExpenses?.loading || s.estimatedExpenses?.loading || 0,
          platformFees: s.actualExpenses?.platformFees || s.estimatedExpenses?.platformFees || 0,
          otherExpenses: s.actualExpenses?.otherExpenses || s.estimatedExpenses?.otherExpenses || 0,
        });
      }
    } catch (err) {
      console.warn('Error loading sale details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSale();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      const res = await api.patch(`/sales/${id}/status`, {
        deliveryStatus,
        paymentStatus,
        transportDetails: {
          carrierName,
          vehicleNumber,
          driverPhone,
        },
        notes: statusNotes,
      });

      if (res.data.success) {
        setFeedbackToast('Sale status and transport details updated successfully.');
        setStatusNotes('');
        fetchSale();
      }
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveActualExpenses = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/sales/${id}/expenses`, {
        ...expensesData,
        isFinalized: true,
      });

      if (res.data.success) {
        setFeedbackToast('Actual expenses finalized and actual net earnings recorded.');
        setEditExpensesModal(false);
        fetchSale();
      }
    } catch (err) {
      alert(err.message || 'Failed to save actual expenses.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading sale transaction..." />;
  if (!sale) return <div className="p-8 text-center">Order not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Back link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/farmer/sales"
            className="inline-flex items-center gap-1.5 text-xs text-agritext-secondary hover:text-forest font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Sales</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-agritext-main">
              Sale Order: {sale.saleReference}
            </h1>
            <StatusBadge status={sale.deliveryStatus} />
            <StatusBadge status={sale.saleStatus} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditExpensesModal(true)}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5 text-forest" />
            <span>Record Actual Expenses</span>
          </button>
        </div>
      </div>

      {feedbackToast && (
        <div className="p-3.5 rounded-xl bg-agrigreen-100 border border-agrigreen-200 text-forest text-xs font-semibold flex items-center justify-between">
          <span>{feedbackToast}</span>
          <button onClick={() => setFeedbackToast(null)} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Agreed Produce & Financial Summary */}
      <div className="card p-6 bg-white border-agriborder space-y-6">
        <h2 className="text-base font-bold text-agritext-main border-b border-agriborder pb-2">
          Agreed Transaction Terms
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-agritext-secondary block">Produce & Variety</span>
            <span className="font-bold text-sm text-agritext-main">
              {sale.listingId?.cropName}
            </span>
          </div>

          <div>
            <span className="text-agritext-secondary block">Agreed Volume</span>
            <span className="font-bold text-sm text-agritext-main">
              {formatIndianNumber(sale.agreedQuantity)} {sale.quantityUnit}
            </span>
          </div>

          <div>
            <span className="text-agritext-secondary block">Agreed Unit Rate</span>
            <span className="font-bold text-sm text-forest">
              {formatRupee(sale.agreedPrice)} / {sale.priceUnit}
            </span>
          </div>

          <div>
            <span className="text-agritext-secondary block">Gross Sale Value</span>
            <span className="font-extrabold text-sm text-agritext-main">
              {formatRupee(sale.grossSaleValue)}
            </span>
          </div>
        </div>
      </div>

      {/* CORE DIFFERENTIATOR: Estimated vs Actual Expenses Breakdown Table */}
      <div className="card p-6 bg-white border-agriborder space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-agritext-main">
              Estimated vs. Actual Logistics Expenses
            </h3>
            <p className="text-xs text-agritext-secondary">
              Separation of pre-sale estimated expenses from verified post-sale actual costs.
            </p>
          </div>
          <span className="badge-green text-xs">
            {sale.actualExpenses?.isFinalized ? 'Expenses Finalized' : 'Initial Estimates'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-cream/60 border-b border-agriborder text-agritext-secondary uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-3">Expense Category</th>
                <th className="py-2.5 px-3">Initial Estimate</th>
                <th className="py-2.5 px-3">Actual Incurred Cost</th>
                <th className="py-2.5 px-3">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-agriborder/50">
              <tr>
                <td className="py-2.5 px-3 font-medium">Road Freight & Transportation</td>
                <td className="py-2.5 px-3 text-agritext-secondary">
                  {formatRupee(sale.estimatedExpenses?.transportation)}
                </td>
                <td className="py-2.5 px-3 font-semibold text-agritext-main">
                  {formatRupee(sale.actualExpenses?.transportation)}
                </td>
                <td className="py-2.5 px-3 text-agritext-secondary">
                  {formatRupee(
                    (sale.actualExpenses?.transportation || 0) -
                      (sale.estimatedExpenses?.transportation || 0)
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Packaging & Crates</td>
                <td className="py-2.5 px-3 text-agritext-secondary">
                  {formatRupee(sale.estimatedExpenses?.packaging)}
                </td>
                <td className="py-2.5 px-3 font-semibold text-agritext-main">
                  {formatRupee(sale.actualExpenses?.packaging)}
                </td>
                <td className="py-2.5 px-3 text-agritext-secondary">
                  {formatRupee(
                    (sale.actualExpenses?.packaging || 0) -
                      (sale.estimatedExpenses?.packaging || 0)
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Labor Loading & Weighing</td>
                <td className="py-2.5 px-3 text-agritext-secondary">
                  {formatRupee(sale.estimatedExpenses?.loading)}
                </td>
                <td className="py-2.5 px-3 font-semibold text-agritext-main">
                  {formatRupee(sale.actualExpenses?.loading)}
                </td>
                <td className="py-2.5 px-3 text-agritext-secondary">
                  {formatRupee(
                    (sale.actualExpenses?.loading || 0) -
                      (sale.estimatedExpenses?.loading || 0)
                  )}
                </td>
              </tr>
              <tr className="bg-agrigreen-50/50 font-bold">
                <td className="py-3 px-3">Total Deductions:</td>
                <td className="py-3 px-3 text-agrierror">
                  -{formatRupee(sale.estimatedExpenses?.total)}
                </td>
                <td className="py-3 px-3 text-agrierror">
                  -{formatRupee(sale.actualExpenses?.total)}
                </td>
                <td className="py-3 px-3"></td>
              </tr>
              <tr className="bg-agrigreen-100 font-extrabold text-sm text-forest">
                <td className="py-3 px-3">Net Realized Earnings:</td>
                <td className="py-3 px-3">{formatRupee(sale.netEarningsEstimate)}</td>
                <td className="py-3 px-3">
                  {formatRupee(
                    sale.actualNetEarnings !== null
                      ? sale.actualNetEarnings
                      : sale.netEarningsEstimate
                  )}
                </td>
                <td className="py-3 px-3 text-xs font-semibold">
                  {sale.actualExpenses?.isFinalized ? 'Confirmed' : 'Estimate'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline & Status Updates Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Timeline Log */}
        <div className="lg:col-span-6 card p-6 bg-white border-agriborder space-y-4">
          <h3 className="text-base font-bold text-agritext-main">Order Fulfillment Timeline</h3>

          <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-agriborder">
            {sale.statusHistory?.map((hist, idx) => (
              <div key={idx} className="flex items-start gap-4 relative">
                <div className="w-7 h-7 rounded-full bg-agrigreen-100 border-2 border-forest flex items-center justify-center shrink-0 z-10 text-forest">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-agritext-main block">{hist.status}</span>
                  <span className="text-[11px] text-agritext-muted block">
                    {formatDate(hist.timestamp)} • Updated by {hist.updatedBy?.name || 'Party'}
                  </span>
                  {hist.notes && (
                    <p className="text-agritext-secondary pt-0.5">{hist.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Update Status Form */}
        <div className="lg:col-span-6 card p-6 bg-white border-agriborder space-y-4">
          <h3 className="text-base font-bold text-agritext-main">Update Delivery & Transport</h3>

          <form onSubmit={handleStatusUpdate} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-text text-xs">Fulfillment Status</label>
                <select
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value)}
                  className="input-field text-xs"
                >
                  <option value="Awaiting Pickup">Awaiting Pickup</option>
                  <option value="Pickup Scheduled">Pickup Scheduled</option>
                  <option value="Picked Up">Picked Up</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div>
                <label className="label-text text-xs">Payment Milestone</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="input-field text-xs"
                >
                  <option value="Pending">Pending</option>
                  <option value="Advance Received">Advance Received</option>
                  <option value="Paid on Delivery">Paid on Delivery</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-text text-xs">Vehicle Number</label>
                <input
                  type="text"
                  placeholder="e.g. KA-11-B-8421"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="input-field text-xs uppercase"
                />
              </div>
              <div>
                <label className="label-text text-xs">Driver Phone</label>
                <input
                  type="text"
                  placeholder="+91 94481 00000"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div>
              <label className="label-text text-xs">Transporter / Carrier Company</label>
              <input
                type="text"
                placeholder="e.g. Kaveri Roadways Logistics"
                value={carrierName}
                onChange={(e) => setCarrierName(e.target.value)}
                className="input-field text-xs"
              />
            </div>

            <div>
              <label className="label-text text-xs">Status Update Note</label>
              <input
                type="text"
                placeholder="e.g. 10 quintals produce loaded on vehicle at farm gate."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="input-field text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={updatingStatus}
              className="btn-primary w-full py-2.5 text-xs font-semibold"
            >
              {updatingStatus ? 'Updating Order...' : 'Record Status Progression'}
            </button>
          </form>
        </div>
      </div>

      {/* Modal to record actual incurred expenses */}
      {editExpensesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-agriborder space-y-4">
            <h3 className="text-lg font-bold text-agritext-main">
              Record Actual Incurred Expenses
            </h3>
            <p className="text-xs text-agritext-secondary">
              Enter the true receipted expenses after produce weighment and dispatch to calculate finalized actual net earnings.
            </p>

            <form onSubmit={handleSaveActualExpenses} className="space-y-3 text-xs">
              <div>
                <label className="label-text text-xs">Actual Transport Freight (₹)</label>
                <input
                  type="number"
                  value={expensesData.transportation}
                  onChange={(e) =>
                    setExpensesData({ ...expensesData, transportation: e.target.value })
                  }
                  className="input-field text-xs font-semibold"
                />
              </div>
              <div>
                <label className="label-text text-xs">Actual Packaging Costs (₹)</label>
                <input
                  type="number"
                  value={expensesData.packaging}
                  onChange={(e) =>
                    setExpensesData({ ...expensesData, packaging: e.target.value })
                  }
                  className="input-field text-xs font-semibold"
                />
              </div>
              <div>
                <label className="label-text text-xs">Actual Loading & Weighing Charges (₹)</label>
                <input
                  type="number"
                  value={expensesData.loading}
                  onChange={(e) =>
                    setExpensesData({ ...expensesData, loading: e.target.value })
                  }
                  className="input-field text-xs font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditExpensesModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Save Finalized Expenses
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerSaleDetailsPage;
