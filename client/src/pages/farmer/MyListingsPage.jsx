import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  Pause,
  Play,
  Layers,
  Edit,
  ExternalLink,
  Trash2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import api from '../../services/api';
import { formatRupee, formatDate, formatIndianNumber } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const MyListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    listingId: null,
    action: null,
    title: '',
    message: '',
  });

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/farmer/listings');
      if (res.data.success) {
        setListings(res.data.listings || []);
      }
    } catch (err) {
      console.warn('Error loading farmer listings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await api.patch(`/listings/${id}`, { status: newStatus });
      fetchListings();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const filteredListings = listings.filter((l) => {
    if (statusFilter === 'All') return true;
    return l.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-agritext-main">My Crop Listings</h1>
          <p className="text-xs text-agritext-secondary mt-0.5">
            Manage your harvest listings, pause visibility, and check incoming buyer interest.
          </p>
        </div>
        <Link to="/farmer/add-crop" className="btn-primary text-xs py-2 px-3.5 flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          <span>Add New Produce</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['All', 'Active', 'Draft', 'Paused', 'Reserved', 'Sold'].map((tab) => (
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

      {/* Listings Table / Cards */}
      {loading ? (
        <LoadingSpinner text="Loading your listings..." />
      ) : filteredListings.length > 0 ? (
        <div className="card overflow-hidden bg-white border-agriborder">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream/60 border-b border-agriborder text-agritext-secondary uppercase font-bold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Produce</th>
                  <th className="py-3.5 px-4">Asking Price</th>
                  <th className="py-3.5 px-4">Stock (Available / Total)</th>
                  <th className="py-3.5 px-4">Offers</th>
                  <th className="py-3.5 px-4">Listed Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agriborder/60">
                {filteredListings.map((listing) => (
                  <tr key={listing._id} className="hover:bg-cream/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            listing.images?.[0] ||
                            'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80'
                          }
                          alt={listing.cropName}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <span className="font-bold text-agritext-main block text-sm">
                            {listing.cropName}
                          </span>
                          <span className="text-[11px] text-agritext-secondary">
                            {listing.variety} • {listing.location?.district}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-forest">
                      {formatRupee(listing.askingPrice)} / {listing.priceUnit}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-agritext-main">
                        {formatIndianNumber(listing.availableQuantity)}
                      </span>{' '}
                      <span className="text-agritext-secondary">
                        / {formatIndianNumber(listing.originalQuantity)} {listing.quantityUnit}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        to={`/farmer/offers?listingId=${listing._id}`}
                        className="inline-flex items-center gap-1 font-bold text-forest hover:underline"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>{listing.offersCount || 0} offers</span>
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-agritext-secondary">
                      {formatDate(listing.createdAt)}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={listing.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/crops/${listing._id}`}
                          className="p-1.5 rounded-lg text-agritext-secondary hover:text-forest hover:bg-agrigreen-50"
                          title="View on Marketplace"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {listing.status === 'active' ? (
                          <button
                            onClick={() => handleToggleStatus(listing._id, 'active')}
                            className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50"
                            title="Pause Listing"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        ) : listing.status === 'paused' ? (
                          <button
                            onClick={() => handleToggleStatus(listing._id, 'paused')}
                            className="p-1.5 rounded-lg text-forest hover:bg-agrigreen-50"
                            title="Resume Listing"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        ) : null}

                        <Link
                          to={`/farmer/compare-offers?listingId=${listing._id}`}
                          className="px-2.5 py-1 rounded-lg bg-agrigreen-100 text-forest font-semibold hover:bg-forest hover:text-white transition-colors"
                        >
                          Compare
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No listings in this category"
          description="You haven't posted any produce matching this status filter."
          actionLabel="Add Crop"
          actionLink="/farmer/add-crop"
        />
      )}
    </div>
  );
};

export default MyListingsPage;
