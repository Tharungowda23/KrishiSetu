import React, { useState, useEffect } from 'react';
import { Package, Pause, Play, Trash2, Eye, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { formatRupee, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const AdminListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchListings = async () => {
    setLoading(true);
    try {
      const url = statusFilter !== 'All' ? `/admin/listings?status=${statusFilter}` : '/admin/listings';
      const res = await api.get(url);
      if (res.data.success) {
        setListings(res.data.listings || []);
      }
    } catch (err) {
      console.warn('Error loading admin listings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const handleModerate = async (listingId, status) => {
    try {
      await api.patch(`/admin/listings/${listingId}/moderation`, {
        status,
        reason: 'Administrative moderation review',
      });
      fetchListings();
    } catch (err) {
      alert(err.message || 'Failed to moderate listing.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-agritext-main">Crop Listing Moderation</h1>
          <p className="text-xs text-agritext-secondary mt-0.5">
            Inspect all produce listings published across the platform.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['All', 'active', 'paused', 'draft', 'sold'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
                statusFilter === st
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-white border border-agriborder text-agritext-secondary hover:bg-cream'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading listings for moderation..." />
      ) : (
        <div className="card overflow-hidden bg-white border-agriborder">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream/60 border-b border-agriborder uppercase text-agritext-secondary text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Produce</th>
                  <th className="py-3 px-4">Farmer</th>
                  <th className="py-3 px-4">Asking Price</th>
                  <th className="py-3 px-4">Available</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agriborder/60">
                {listings.map((l) => (
                  <tr key={l._id} className="hover:bg-cream/30">
                    <td className="py-3 px-4">
                      <span className="font-bold text-agritext-main block">{l.cropName}</span>
                      <span className="text-[11px] text-agritext-secondary">{l.variety}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-agritext-main block">{l.farmerId?.name}</span>
                      <span className="text-[11px] text-agritext-secondary">{l.location?.district}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-forest">
                      {formatRupee(l.askingPrice)} / {l.priceUnit}
                    </td>
                    <td className="py-3 px-4">
                      {l.availableQuantity} {l.quantityUnit}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {l.status === 'active' ? (
                        <button
                          onClick={() => handleModerate(l._id, 'paused')}
                          className="px-2 py-1 rounded bg-amber-50 text-amber-800 font-semibold hover:bg-amber-100"
                        >
                          Hide / Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => handleModerate(l._id, 'active')}
                          className="px-2 py-1 rounded bg-agrigreen-50 text-forest font-semibold hover:bg-agrigreen-100"
                        >
                          Restore
                        </button>
                      )}
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

export default AdminListingsPage;
