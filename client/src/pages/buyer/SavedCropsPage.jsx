import React, { useState, useEffect } from 'react';
import { Bookmark, Store } from 'lucide-react';
import api from '../../services/api';
import CropCard from '../../components/common/CropCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const SavedCropsPage = () => {
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await api.get('/saved-listings');
      if (res.data.success) {
        setSavedListings(res.data.savedListings || []);
      }
    } catch (err) {
      console.warn('Error loading saved crops:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = (listingId) => {
    setSavedListings((prev) => prev.filter((item) => item._id !== listingId));
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-agritext-main">Saved Produce Listings</h1>
        <p className="text-xs text-agritext-secondary mt-0.5">
          Quickly monitor prices and submit offers for your bookmarked agricultural harvests.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading your bookmarked produce..." />
      ) : savedListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedListings.map((listing) => (
            <CropCard
              key={listing._id}
              listing={listing}
              isSaved={true}
              onSaveToggle={handleRemove}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No saved crops"
          description="You haven't bookmarked any produce listings yet. Click the heart icon on any crop card to save it here for fast access."
          actionLabel="Explore Marketplace"
          actionLink="/marketplace"
        />
      )}
    </div>
  );
};

export default SavedCropsPage;
