import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  ShieldCheck,
  Truck,
  Heart,
  Send,
  MessageSquare,
  ArrowLeft,
  Info,
  Scale,
  Award,
  Share2,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatRupee, formatDate, formatIndianNumber, KARNATAKA_DISTRICTS } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OfferModal from '../../components/marketplace/OfferModal';
import PriceDisplay from '../../components/common/PriceDisplay';

const CropDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isBuyer } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState(null);

  // Embedded Transport Estimator state
  const [destinationDistrict, setDestinationDistrict] = useState('Bengaluru Urban');
  const [transportEstimate, setTransportEstimate] = useState(null);
  const [calculatingTransport, setCalculatingTransport] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        if (res.data.success) {
          setListing(res.data.listing);
        }
      } catch (err) {
        console.error('Error loading listing:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  // Fetch transport estimate when destination changes
  useEffect(() => {
    if (!listing) return;
    const calculateFreight = async () => {
      setCalculatingTransport(true);
      try {
        const res = await api.post('/transport/estimate', {
          pickupDistrict: listing.location?.district || 'Mandya',
          destinationDistrict,
          quantityKg: 1000,
          includeLoading: true,
        });
        if (res.data.success) {
          setTransportEstimate(res.data.estimate);
        }
      } catch (err) {
        console.warn('Freight calculation error:', err);
      } finally {
        setCalculatingTransport(false);
      }
    };
    calculateFreight();
  }, [listing, destinationDistrict]);

  const handleStartMessage = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post('/conversations', {
        recipientId: listing.farmerId._id,
        listingId: listing._id,
      });
      if (res.data.success) {
        navigate(user?.role === 'farmer' ? '/farmer/messages' : '/buyer/messages');
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
    }
  };

  const handleSaveListing = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (isSaved) {
        await api.delete(`/saved-listings/${listing._id}`);
        setIsSaved(false);
        setFeedbackToast('Removed from saved crops.');
      } else {
        await api.post(`/saved-listings/${listing._id}`);
        setIsSaved(true);
        setFeedbackToast('Listing saved to your bookmarks!');
      }
      setTimeout(() => setFeedbackToast(null), 3500);
    } catch (err) {
      console.error('Error saving listing:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Loading crop listing details..." />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center card p-8">
        <h2 className="text-xl font-bold text-agritext-main mb-2">Crop Listing Not Found</h2>
        <p className="text-sm text-agritext-secondary mb-6">
          This listing may have been sold, paused, or expired.
        </p>
        <Link to="/marketplace" className="btn-primary text-xs py-2.5 px-4">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const images =
    listing.images && listing.images.length > 0
      ? listing.images
      : ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'];

  const isVerified =
    listing.farmerId?.verificationStatus === 'verified' ||
    listing.farmerId?.verificationStatus === 'approved';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-agritext-secondary hover:text-forest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        {feedbackToast && (
          <div className="px-3 py-1.5 rounded-lg bg-agrigreen-100 border border-agrigreen-200 text-forest text-xs font-semibold animate-fade-in">
            {feedbackToast}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-cream border border-agriborder shadow-sm">
            <img
              src={images[selectedImage]}
              alt={listing.cropName}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-sm text-forest shadow-sm">
              {listing.category}
            </span>
          </div>

          {/* Additional Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === idx ? 'border-forest scale-95' : 'border-agriborder'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description & Crop Story */}
          <div className="card p-6 space-y-4">
            <h3 className="text-base font-bold text-agritext-main">Crop Specifications & Notes</h3>
            <p className="text-sm text-agritext-secondary leading-relaxed whitespace-pre-line">
              {listing.description || 'No detailed description provided by the producer.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-agriborder text-xs">
              <div>
                <span className="text-agritext-muted block font-medium">Quality Grade</span>
                <span className="font-bold text-agritext-main">{listing.qualityGrade}</span>
              </div>
              <div>
                <span className="text-agritext-muted block font-medium">Harvest Date</span>
                <span className="font-bold text-agritext-main">
                  {listing.harvestDate ? formatDate(listing.harvestDate) : 'Recently Harvested'}
                </span>
              </div>
              <div>
                <span className="text-agritext-muted block font-medium">Available From</span>
                <span className="font-bold text-agritext-main">
                  {listing.availableFrom ? formatDate(listing.availableFrom) : 'Immediate'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Pricing, Seller Info & Action Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-agritext-secondary uppercase tracking-wider">
                  Variety: {listing.variety}
                </span>
                <span className="badge-green">{listing.status}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-agritext-main">
                {listing.cropName}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-agritext-secondary mt-1">
                <MapPin className="w-3.5 h-3.5 text-forest" />
                <span>
                  {listing.location?.district}, {listing.location?.state}
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-xl bg-agrigreen-50 border border-agrigreen-200">
              <span className="text-xs font-semibold text-agritext-secondary block">
                Farmer's Asking Price
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <PriceDisplay price={listing.askingPrice} unit={listing.priceUnit} size="xl" />
              </div>
              <p className="text-[11px] text-agritext-secondary mt-1">
                *Asking price set by the farmer. Final sale price depends on agreed offer.
              </p>
            </div>

            {/* Quantities */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg border border-agriborder bg-cream/50">
                <span className="text-agritext-secondary block font-medium">Stock Available</span>
                <span className="text-base font-bold text-agritext-main">
                  {formatIndianNumber(listing.availableQuantity)} {listing.quantityUnit}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-agriborder bg-cream/50">
                <span className="text-agritext-secondary block font-medium">Min Order Quantity</span>
                <span className="text-base font-bold text-agritext-main">
                  {formatIndianNumber(listing.minimumOrderQuantity || 1)} {listing.quantityUnit}
                </span>
              </div>
            </div>

            {/* Farmer Card */}
            <div className="p-4 rounded-xl border border-agriborder bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold text-sm">
                  {listing.farmerId?.name?.charAt(0) || 'F'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-agritext-main">{listing.farmerId?.name}</h4>
                  <p className="text-[11px] text-agritext-secondary">
                    {listing.farmerId?.farmDetails?.farmName || 'Verified Farm Producer'}
                  </p>
                </div>
              </div>
              {isVerified && (
                <div className="flex items-center gap-1 text-forest text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified</span>
                </div>
              )}
            </div>

            {/* Call to Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    setOfferModalOpen(true);
                  }
                }}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Make a Purchase Offer</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSaveListing}
                  className="btn-secondary py-2.5 text-xs flex items-center justify-center gap-1.5"
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save Listing'}</span>
                </button>
                <button
                  onClick={handleStartMessage}
                  className="btn-secondary py-2.5 text-xs flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-forest" />
                  <span>Contact Seller</span>
                </button>
              </div>
            </div>
          </div>

          {/* Embedded Transport Estimator Panel */}
          <div className="card p-5 space-y-4 border-agrigreen-200 bg-white">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-forest" />
              <h3 className="text-sm font-bold text-agritext-main">
                Estimate Freight to Your Market
              </h3>
            </div>

            <div>
              <label className="label-text text-xs">Destination District</label>
              <select
                value={destinationDistrict}
                onChange={(e) => setDestinationDistrict(e.target.value)}
                className="input-field text-xs py-2"
              >
                {KARNATAKA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {calculatingTransport ? (
              <p className="text-xs text-agritext-secondary">Calculating indicative distance...</p>
            ) : transportEstimate ? (
              <div className="p-3 bg-agrigreen-50 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-agritext-secondary">Road Distance:</span>
                  <span className="font-bold text-agritext-main">
                    ~{transportEstimate.distanceKm} km
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-agritext-secondary">Est. Freight (10 quintals):</span>
                  <span className="font-extrabold text-forest text-sm">
                    {formatRupee(transportEstimate.costs.totalEstimatedExpenses)}
                  </span>
                </div>
                <div className="flex justify-between font-medium text-[11px] text-agritext-secondary">
                  <span>Rate per quintal:</span>
                  <span>{formatRupee(transportEstimate.costs.costPerQuintal)}/qtl</span>
                </div>
                <p className="text-[10px] text-agritext-muted pt-1 border-t border-agrigreen-200/60 leading-tight">
                  *Indicative commercial rate estimate. Confirmed quotation negotiated with carrier.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {offerModalOpen && (
        <OfferModal
          isOpen={offerModalOpen}
          onClose={() => setOfferModalOpen(false)}
          listing={listing}
          onSuccess={() => {
            setFeedbackToast('Offer sent to the farmer! Check My Offers to track response.');
            setTimeout(() => setFeedbackToast(null), 4000);
          }}
        />
      )}
    </div>
  );
};

export default CropDetailsPage;
