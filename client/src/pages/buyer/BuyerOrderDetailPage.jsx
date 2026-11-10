import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Calendar,
  Send,
  MessageSquare,
  FileText,
} from 'lucide-react';
import api from '../../services/api';
import { formatRupee, formatDate, formatIndianNumber } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const BuyerOrderDetailPage = () => {
  const { id } = useParams();

  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disputeModal, setDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState(null);

  const fetchSale = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/sales/${id}`);
      if (res.data.success) {
        setSale(res.data.sale);
      }
    } catch (err) {
      console.warn('Error fetching order details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSale();
  }, [id]);

  const handleReportIssue = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;

    setSubmittingDispute(true);
    try {
      const res = await api.post(`/sales/${id}/report-issue`, {
        reason: disputeReason.trim(),
      });
      if (res.data.success) {
        setFeedbackToast('Issue reported. KrishiSetu administration has been notified.');
        setDisputeModal(false);
        setDisputeReason('');
        fetchSale();
      }
    } catch (err) {
      alert(err.message || 'Failed to submit report.');
    } finally {
      setSubmittingDispute(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading order tracking details..." />;
  if (!sale) return <div className="p-8 text-center">Order not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Back button & Header */}
      <div>
        <Link
          to="/buyer/purchases"
          className="inline-flex items-center gap-1.5 text-xs text-agritext-secondary hover:text-forest font-semibold mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Purchases</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-agritext-main">
              Order: {sale.saleReference}
            </h1>
            <StatusBadge status={sale.deliveryStatus} />
            <StatusBadge status={sale.paymentStatus} />
          </div>

          {sale.saleStatus !== 'Disputed' && (
            <button
              onClick={() => setDisputeModal(true)}
              className="btn-secondary text-xs py-2 px-3 text-agrierror hover:bg-rose-50 flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report an Issue</span>
            </button>
          )}
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

      {/* Order Summary Card */}
      <div className="card p-6 bg-white border-agriborder space-y-4">
        <h3 className="text-sm font-bold text-agritext-main border-b border-agriborder pb-2 uppercase tracking-wider">
          Produce & Seller Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-agritext-secondary block">Produce Batch</span>
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
            <span className="text-agritext-secondary block">Agreed Price</span>
            <span className="font-bold text-sm text-forest">
              {formatRupee(sale.agreedPrice)} / {sale.priceUnit}
            </span>
          </div>

          <div>
            <span className="text-agritext-secondary block">Total Agreed Value</span>
            <span className="font-extrabold text-sm text-agritext-main">
              {formatRupee(sale.grossSaleValue)}
            </span>
          </div>
        </div>

        {/* Farmer Information */}
        <div className="pt-4 border-t border-agriborder flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-agritext-secondary block">Producer / Farm:</span>
            <span className="font-bold text-agritext-main">
              {sale.farmerId?.name} ({sale.farmerId?.farmDetails?.farmName || 'Verified Farm'})
            </span>
          </div>
          <div>
            <span className="text-agritext-secondary block">Farm Gate Pickup Location:</span>
            <span className="font-bold text-agritext-main">
              {sale.pickupLocation?.address || `${sale.pickupLocation?.district}, Karnataka`}
            </span>
          </div>
          <div>
            <span className="text-agritext-secondary block">Producer Phone:</span>
            <span className="font-bold text-agritext-main">
              {sale.farmerId?.phone || 'Contact via message'}
            </span>
          </div>
        </div>
      </div>

      {/* Logistics & Carrier Card */}
      <div className="card p-6 bg-white border-agriborder space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-forest" />
          <h3 className="font-bold text-sm text-agritext-main">
            Assigned Transport & Dispatch Details
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3 rounded-lg bg-cream/60 border border-agriborder">
            <span className="text-agritext-secondary block">Carrier / Fleet</span>
            <span className="font-bold text-agritext-main">
              {sale.transportDetails?.carrierName || 'Self-Pickup / To Be Assigned'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-cream/60 border border-agriborder">
            <span className="text-agritext-secondary block">Vehicle Registration</span>
            <span className="font-bold text-agritext-main uppercase">
              {sale.transportDetails?.vehicleNumber || 'Pending Assignment'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-cream/60 border border-agriborder">
            <span className="text-agritext-secondary block">Driver Contact</span>
            <span className="font-bold text-agritext-main">
              {sale.transportDetails?.driverPhone || 'Shared upon dispatch'}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Card */}
      <div className="card p-6 bg-white border-agriborder space-y-4">
        <h3 className="text-sm font-bold text-agritext-main uppercase tracking-wider">
          Delivery Progress Log
        </h3>

        <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-agriborder">
          {sale.statusHistory?.map((hist, idx) => (
            <div key={idx} className="flex items-start gap-4 relative text-xs">
              <div className="w-7 h-7 rounded-full bg-agrigreen-100 border-2 border-forest flex items-center justify-center shrink-0 z-10 text-forest">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-agritext-main block">{hist.status}</span>
                <span className="text-[11px] text-agritext-muted block">
                  {formatDate(hist.timestamp)}
                </span>
                {hist.notes && <p className="text-agritext-secondary">{hist.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dispute Modal */}
      {disputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-agriborder space-y-4">
            <h3 className="text-lg font-bold text-agritext-main">
              Report an Issue or Raise a Dispute
            </h3>
            <p className="text-xs text-agritext-secondary">
              If produce quantity or quality differs from agreed terms, submit details for KrishiSetu administration review.
            </p>

            <form onSubmit={handleReportIssue} className="space-y-3 text-xs">
              <div>
                <label className="label-text text-xs">Describe the Dispute Reason *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail discrepancies in weight, delay in pickup, damage, or payment terms..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setDisputeModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  className="btn-primary bg-agrierror hover:bg-red-700 text-xs"
                >
                  {submittingDispute ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerOrderDetailPage;
