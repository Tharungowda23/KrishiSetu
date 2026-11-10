import React from 'react';
import { Filter, RotateCcw, ShieldCheck, Search, Tag, MapPin } from 'lucide-react';
import { CROP_CATEGORIES, KARNATAKA_DISTRICTS } from '../../utils/formatters';

const FilterSidebar = ({ filters, setFilters, onReset, totalCount = 0 }) => {
  const handleCategoryClick = (cat) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === cat ? '' : cat,
      page: 1,
    }));
  };

  return (
    <div className="card p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-agriborder">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-forest" />
          <h3 className="text-sm font-bold text-agritext-main uppercase tracking-wider">
            Filters
          </h3>
          {totalCount !== undefined && (
            <span className="text-xs text-agritext-secondary font-medium">
              ({totalCount} items)
            </span>
          )}
        </div>
        <button
          onClick={onReset}
          className="text-xs text-forest hover:underline font-semibold flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Categories */}
      <div>
        <label className="label-text flex items-center gap-1.5 text-xs">
          <Tag className="w-3.5 h-3.5 text-forest" />
          <span>Crop Category</span>
        </label>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <button
            onClick={() => handleCategoryClick('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !filters.category
                ? 'bg-forest text-white shadow-xs'
                : 'bg-cream text-agritext-secondary hover:bg-agrigreen-100'
            }`}
          >
            All Categories
          </button>
          {CROP_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filters.category === cat
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-cream text-agritext-secondary hover:bg-agrigreen-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* District / Location */}
      <div>
        <label className="label-text flex items-center gap-1.5 text-xs">
          <MapPin className="w-3.5 h-3.5 text-forest" />
          <span>District Location (Karnataka)</span>
        </label>
        <select
          value={filters.district || ''}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, district: e.target.value, page: 1 }))
          }
          className="input-field text-xs mt-1.5"
        >
          <option value="">All Karnataka Districts</option>
          {KARNATAKA_DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="label-text text-xs">Asking Price (₹ / unit)</label>
        <div className="grid grid-cols-2 gap-2 mt-1.5">
          <input
            type="number"
            placeholder="Min ₹"
            value={filters.minPrice || ''}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, minPrice: e.target.value, page: 1 }))
            }
            className="input-field text-xs py-2"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={filters.maxPrice || ''}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, maxPrice: e.target.value, page: 1 }))
            }
            className="input-field text-xs py-2"
          />
        </div>
      </div>

      {/* Verified Sellers Toggle */}
      <div className="pt-2 border-t border-agriborder/60">
        <label className="flex items-center gap-2.5 text-xs font-semibold text-agritext-main cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.verifiedOnly === 'true'}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                verifiedOnly: e.target.checked ? 'true' : 'false',
                page: 1,
              }))
            }
            className="rounded text-forest focus:ring-forest w-4 h-4"
          />
          <span className="flex items-center gap-1 text-forest">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Farmers Only</span>
          </span>
        </label>
      </div>
    </div>
  );
};

export default FilterSidebar;
