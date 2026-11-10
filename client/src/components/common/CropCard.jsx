import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import PriceDisplay from './PriceDisplay';
import { formatIndianNumber } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const defaultImages = {
  Vegetables: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
  'Grains & Cereals': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
  Spices: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80',
  Fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
};

const CropCard = ({ listing, isSaved: initialIsSaved = false, onSaveToggle }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [saving, setSaving] = useState(false);

  if (!listing) return null;

  const imageUrl =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : defaultImages[listing.category] ||
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';

  const isVerified =
    listing.farmerId?.verificationStatus === 'verified' ||
    listing.farmerId?.verificationStatus === 'approved';

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || user.role !== 'buyer') {
      return;
    }
    setSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/saved-listings/${listing._id}`);
        setIsSaved(false);
        if (onSaveToggle) onSaveToggle(listing._id, false);
      } else {
        await api.post(`/saved-listings/${listing._id}`);
        setIsSaved(true);
        if (onSaveToggle) onSaveToggle(listing._id, true);
      }
    } catch (err) {
      console.error('Error bookmarking listing:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card card-hover flex flex-col h-full overflow-hidden group">
      {/* Thumbnail Container */}
      <div className="relative aspect-[4/3] bg-cream overflow-hidden">
        <img
          src={imageUrl}
          alt={listing.cropName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Category Pill */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-forest shadow-sm">
          {listing.category || 'Produce'}
        </span>

        {/* Bookmark Heart (Buyer only) */}
        {user?.role === 'buyer' && (
          <button
            onClick={handleBookmark}
            disabled={saving}
            title={isSaved ? 'Remove from saved' : 'Save listing'}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-sm backdrop-blur-sm transition-all duration-150 ${
              isSaved
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 text-agritext-secondary hover:text-rose-500 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        )}

        {/* Quality Grade */}
        {listing.qualityGrade && (
          <div className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded text-[11px] font-medium bg-black/60 text-white backdrop-blur-xs">
            {listing.qualityGrade}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Title and Variety */}
        <div className="mb-2">
          <h3 className="text-base font-bold text-agritext-main line-clamp-1 group-hover:text-forest transition-colors">
            {listing.cropName}
          </h3>
          <p className="text-xs text-agritext-secondary line-clamp-1 mt-0.5">
            Variety: <span className="font-medium text-agritext-main">{listing.variety || 'Desi'}</span>
          </p>
        </div>

        {/* Location & Farmer */}
        <div className="flex items-center gap-1.5 text-xs text-agritext-secondary mb-3">
          <MapPin className="w-3.5 h-3.5 text-forest shrink-0" />
          <span className="truncate">
            {listing.location?.district || 'Karnataka'}, {listing.location?.state || 'India'}
          </span>
          {isVerified && (
            <span className="inline-flex items-center gap-0.5 text-forest font-medium shrink-0 ml-auto" title="Verified Producer">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" />
              <span className="text-[10px]">Verified</span>
            </span>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-agriborder/60">
          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="text-[11px] text-agritext-muted block font-medium uppercase tracking-wider">
                Asking Price
              </span>
              <PriceDisplay price={listing.askingPrice} unit={listing.priceUnit} size="md" />
            </div>
            <div className="text-right">
              <span className="text-[11px] text-agritext-muted block font-medium uppercase tracking-wider">
                Available
              </span>
              <span className="text-sm font-bold text-agritext-main">
                {formatIndianNumber(listing.availableQuantity)}{' '}
                <span className="text-xs font-normal text-agritext-secondary">
                  {listing.quantityUnit}
                </span>
              </span>
            </div>
          </div>

          <Link
            to={`/crops/${listing._id}`}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-agrigreen-100 hover:bg-forest text-forest hover:text-white text-xs font-semibold transition-all duration-150"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CropCard;
