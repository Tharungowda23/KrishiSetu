import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid,
  List,
  RotateCcw,
  SlidersHorizontal,
  X,
  Store,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api';
import CropCard from '../../components/common/CropCard';
import FilterSidebar from '../../components/marketplace/FilterSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const MarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    district: searchParams.get('district') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    verifiedOnly: searchParams.get('verifiedOnly') || 'false',
    sortBy: searchParams.get('sortBy') || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10),
  });

  const [listings, setListings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const fetchListings = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.set('search', filters.search);
      if (filters.category) queryParams.set('category', filters.category);
      if (filters.district) queryParams.set('district', filters.district);
      if (filters.minPrice) queryParams.set('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice);
      if (filters.verifiedOnly === 'true') queryParams.set('verifiedOnly', 'true');
      if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);
      queryParams.set('page', filters.page);
      queryParams.set('limit', '12');

      setSearchParams(queryParams, { replace: true });

      const res = await api.get(`/listings?${queryParams.toString()}`);
      if (res.data.success) {
        setListings(res.data.listings || []);
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.warn('Failed to load listings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [
    filters.search,
    filters.category,
    filters.district,
    filters.minPrice,
    filters.maxPrice,
    filters.verifiedOnly,
    filters.sortBy,
    filters.page,
  ]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      district: '',
      minPrice: '',
      maxPrice: '',
      verifiedOnly: 'false',
      sortBy: 'newest',
      page: 1,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-forest to-forest-light rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl space-y-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
            Open Agricultural Exchange
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Agricultural Produce Marketplace
          </h1>
          <p className="text-sm text-green-100 leading-relaxed">
            Browse fresh harvests directly from verified farms across Karnataka. Submit direct purchase offers or calculate transport estimates.
          </p>
        </div>
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Field */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-agritext-secondary absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search crop name, variety, district..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))
            }
            className="input-field pl-9 py-2 text-xs"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '', page: 1 }))}
              className="absolute right-2.5 top-2.5 text-agritext-muted hover:text-agritext-main"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Drawer Toggle & Sorting */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="btn-secondary text-xs py-2 px-3 md:hidden flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-agritext-secondary font-medium hidden sm:inline">
              Sort by:
            </span>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value, page: 1 }))
              }
              className="input-field text-xs py-2 w-44"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="quantity-desc">Quantity: High to Low</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="hidden lg:flex items-center gap-1 border border-agriborder rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${
                viewMode === 'grid' ? 'bg-forest text-white' : 'text-agritext-secondary'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${
                viewMode === 'list' ? 'bg-forest text-white' : 'text-agritext-secondary'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Filter Sidebar + Produce Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden md:block md:col-span-1 sticky top-24">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            onReset={handleResetFilters}
            totalCount={totalCount}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex md:hidden">
            <div className="w-4/5 max-w-sm bg-white h-full p-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-agriborder mb-4">
                <h3 className="font-bold text-sm">Filter Marketplace</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-agritext-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                onReset={handleResetFilters}
                totalCount={totalCount}
              />
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="btn-primary w-full mt-4 text-xs py-2.5"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Crops Grid */}
        <div className="md:col-span-3 space-y-6">
          {loading ? (
            <div className="card py-16 flex items-center justify-center">
              <LoadingSpinner text="Searching produce listings..." />
            </div>
          ) : listings.length > 0 ? (
            <>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {listings.map((listing) => (
                  <CropCard key={listing._id} listing={listing} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-agriborder">
                  <span className="text-xs text-agritext-secondary">
                    Page <span className="font-bold text-agritext-main">{filters.page}</span> of{' '}
                    <span className="font-bold text-agritext-main">{totalPages}</span> ({totalCount}{' '}
                    items)
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={filters.page <= 1}
                      className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: Math.min(totalPages, prev.page + 1),
                        }))
                      }
                      disabled={filters.page >= totalPages}
                      className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={Store}
              title="No crops found"
              description="No produce matches your chosen search criteria and filters. Try clearing your filters or exploring another category."
              actionLabel="Reset All Filters"
              onAction={handleResetFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;

