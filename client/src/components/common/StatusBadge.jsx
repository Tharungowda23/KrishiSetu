import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

const StatusBadge = ({ status, type = 'general' }) => {
  if (!status) return null;

  const s = String(status).toLowerCase();

  // Active / Verified / Accepted / Delivered / Completed
  if (
    s === 'active' ||
    s === 'verified' ||
    s === 'accepted' ||
    s === 'delivered' ||
    s === 'completed' ||
    s === 'approved'
  ) {
    return (
      <span className="badge-green">
        <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
        <span className="capitalize">{status}</span>
      </span>
    );
  }

  // Pending / In Transit / Counter-Offered / Pickup Scheduled / In Progress
  if (
    s === 'pending' ||
    s === 'in transit' ||
    s === 'counter-offered' ||
    s === 'pickup scheduled' ||
    s === 'in progress' ||
    s === 'awaiting pickup'
  ) {
    return (
      <span className="badge-yellow">
        <Clock className="w-3.5 h-3.5 text-amber-700" />
        <span className="capitalize">{status}</span>
      </span>
    );
  }

  // Paused / Draft / Withdrawn / Expired / Unverified
  if (s === 'paused' || s === 'draft' || s === 'withdrawn' || s === 'expired' || s === 'unverified') {
    return (
      <span className="badge-gray">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        <span className="capitalize">{status}</span>
      </span>
    );
  }

  // Rejected / Cancelled / Suspended / Disputed
  if (s === 'rejected' || s === 'cancelled' || s === 'suspended' || s === 'disputed' || s === 'failed') {
    return (
      <span className="badge-red">
        <XCircle className="w-3.5 h-3.5 text-agrierror" />
        <span className="capitalize">{status}</span>
      </span>
    );
  }

  // Default neutral badge
  return (
    <span className="badge-blue">
      <span className="capitalize">{status}</span>
    </span>
  );
};

export default StatusBadge;
