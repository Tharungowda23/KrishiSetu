import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sprout,
  ArrowRight,
  TrendingUp,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Calculator,
  ChevronRight,
  Store,
  Users,
  MapPin,
  HelpCircle,
  Award,
} from 'lucide-react';
import api from '../../services/api';
import CropCard from '../../components/common/CropCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatRupee, CROP_CATEGORIES, KARNATAKA_DISTRICTS } from '../../utils/formatters';

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredCrops, setFeaturedCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick search form state
  const [searchCrop, setSearchCrop] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/listings/featured');
        if (res.data.success) {
          setFeaturedCrops(res.data.listings || []);
        }
      } catch (err) {
        console.warn('Could not fetch featured listings:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCrop.trim()) params.append('search', searchCrop.trim());
    if (searchCategory) params.append('category', searchCategory);
    if (searchDistrict) params.append('district', searchDistrict);
    navigate(`/marketplace?${params.toString()}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-agrigreen-50 via-cream to-cream pt-12 pb-20 overflow-hidden border-b border-agriborder/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-agrigreen-100 border border-agrigreen-200 text-forest text-xs font-bold tracking-wide">
                <Sprout className="w-4 h-4 text-forest" />
                <span>Next-Gen Agricultural Marketplace</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-agritext-main tracking-tight leading-[1.1]">
                Sell Smarter. Earn Better From Every Harvest.
              </h1>

              <p className="text-base sm:text-lg text-agritext-secondary leading-relaxed max-w-2xl font-normal">
                Connect directly with verified buyers, compare competitive offers, estimate transportation expenses, and discover which deal leaves you with genuine net earnings.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/marketplace" className="btn-primary py-3.5 px-6 text-sm">
                  <Store className="w-4 h-4" />
                  <span>Explore Marketplace</span>
                </Link>
                <Link to="/register?role=farmer" className="btn-secondary py-3.5 px-6 text-sm">
                  <Sprout className="w-4 h-4 text-forest" />
                  <span>Start Selling</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-agriborder/80 grid grid-cols-3 gap-4">
                <div>
                  <span className="text-xl sm:text-2xl font-black text-forest block">100%</span>
                  <span className="text-xs text-agritext-secondary font-medium">Direct Connection</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black text-forest block">â‚¹0</span>
                  <span className="text-xs text-agritext-secondary font-medium">Hidden Commissions</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black text-forest block">Realized</span>
                  <span className="text-xs text-agritext-secondary font-medium">Net Earnings Focus</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] group">
                <img
                  src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80"
                  alt="Farmer harvesting fresh crops"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/10 flex flex-col justify-end p-6 text-white">
                  <span className="badge-green mb-2 w-max text-xs font-bold">
                    Featured Harvest
                  </span>
                  <h3 className="text-xl font-bold text-white drop-shadow-lg">Tomato & Fresh Produce Corridor</h3>
                  <p className="text-xs text-gray-100 mt-1 drop-shadow-md">
                    Direct farm pickups connecting Mandya, Hassan & Kolar with wholesale markets.
                  </p>
                </div>
              </div>

              {/* Floating Insight Pill */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-card-hover border border-agriborder max-w-xs hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-agrigreen-100 flex items-center justify-center text-forest shrink-0">
                  <Calculator className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-agritext-main block">Transparent Comparison</span>
                  <span className="text-agritext-secondary">Highest price â‰  highest profit. Check transport cost first!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-28 relative z-20">
        <form
          onSubmit={handleQuickSearch}
          className="bg-white rounded-2xl shadow-xl border border-agriborder p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
        >
          {/* Crop Keyword */}
          <div>
            <label className="label-text text-xs">Crop Name / Variety</label>
            <input
              type="text"
              placeholder="e.g. Tomato, Potato, Onion..."
              value={searchCrop}
              onChange={(e) => setSearchCrop(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <label className="label-text text-xs">Category</label>
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="input-field text-sm"
            >
              <option value="">All Categories</option>
              {CROP_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location / District */}
          <div>
            <label className="label-text text-xs">District (Karnataka)</label>
            <select
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              className="input-field text-sm"
            >
              <option value="">All Districts</option>
              {KARNATAKA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search Produce</span>
            </button>
          </div>
        </form>
      </section>

      {/* CORE VALUE PROPOSITION: The Net Earnings Difference Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-6 sm:p-10 bg-gradient-to-br from-white via-agrigreen-50/50 to-agrigreen-100/30 border-agrigreen-200">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="badge-green mb-2">Core Platform Differentiator</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-agritext-main">
              Why Highest Gross Offer Isn't Always Your Best Deal
            </h2>
            <p className="text-sm text-agritext-secondary mt-2">
              Traditional mandi agents quote gross rates while farmers absorb unexpected transport, loading, and transit deductions. KrishiSetu computes your <strong>realized net earnings</strong> before you accept.
            </p>
          </div>

          {/* Side-by-side Buyer A vs Buyer B illustrative comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Buyer A Card (The Winner) */}
            <div className="bg-white rounded-2xl p-6 border-2 border-forest shadow-md relative">
              <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-forest text-white text-xs font-bold flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>+â‚¹1,000 Higher Net Profit</span>
              </div>
              <h3 className="text-lg font-bold text-forest mb-1">Buyer A (Nearby Hub)</h3>
              <p className="text-xs text-agritext-secondary mb-4">
                Local wholesale distributor with farm-gate collection.
              </p>

              <div className="space-y-2.5 text-xs text-agritext-main border-y border-agriborder py-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-agritext-secondary">Gross Offer (10 quintals @ â‚¹2,500):</span>
                  <span className="font-semibold">â‚¹25,000</span>
                </div>
                <div className="flex justify-between text-agrierror">
                  <span>Estimated Transport & Logistics:</span>
                  <span className="font-semibold">-â‚¹2,000</span>
                </div>
                <div className="flex justify-between text-agritext-secondary">
                  <span>Other Deductions:</span>
                  <span className="font-semibold">â‚¹0</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-agrigreen-100 p-3.5 rounded-xl">
                <span className="text-xs font-bold text-forest">Estimated Net Earnings</span>
                <span className="text-xl font-extrabold text-forest">â‚¹23,000</span>
              </div>
            </div>

            {/* Buyer B Card */}
            <div className="bg-white rounded-2xl p-6 border border-agriborder shadow-sm opacity-90">
              <span className="text-[11px] font-semibold text-agriwarning uppercase tracking-wide block mb-1">
                Higher Gross, Lower Return
              </span>
              <h3 className="text-lg font-bold text-agritext-main mb-1">Buyer B (Distant Mandi)</h3>
              <p className="text-xs text-agritext-secondary mb-4">
                Quotes higher price but requires farmer to pay long haul freight.
              </p>

              <div className="space-y-2.5 text-xs text-agritext-main border-y border-agriborder py-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-agritext-secondary">Gross Offer (10 quintals @ â‚¹2,700):</span>
                  <span className="font-semibold">â‚¹27,000</span>
                </div>
                <div className="flex justify-between text-agrierror">
                  <span>Estimated Transport & Logistics:</span>
                  <span className="font-semibold">-â‚¹5,000</span>
                </div>
                <div className="flex justify-between text-agritext-secondary">
                  <span>Other Deductions:</span>
                  <span className="font-semibold">â‚¹0</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-100 p-3.5 rounded-xl">
                <span className="text-xs font-bold text-agritext-secondary">Estimated Net Earnings</span>
                <span className="text-xl font-extrabold text-agritext-main">â‚¹22,000</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Crops Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="badge-green mb-1.5">Fresh Agricultural Produce</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-agritext-main">
              Recently Listed Harvests
            </h2>
            <p className="text-sm text-agritext-secondary mt-1">
              Direct from Karnataka farm gates ready for inspection and bidding.
            </p>
          </div>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-forest hover:underline"
          >
            <span>View All Produce</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading freshly listed crops..." />
        ) : featuredCrops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCrops.map((listing) => (
              <CropCard key={listing._id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 card bg-white">
            <p className="text-sm text-agritext-secondary">No crops listed yet.</p>
          </div>
        )}
      </section>

      {/* How It Works: 4 Steps */}
      <section className="bg-white py-16 border-y border-agriborder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="badge-green mb-2">Simple 4-Step Process</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-agritext-main">
              How KrishiSetu Operates
            </h2>
            <p className="text-sm text-agritext-secondary mt-1">
              A transparent, equitable bridge connecting farmers and commercial buyers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="card p-6 border-agriborder text-center relative group hover:border-forest transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-agrigreen-100 text-forest font-black text-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-forest group-hover:text-white transition-colors">
                1
              </div>
              <h3 className="text-base font-bold text-agritext-main mb-2">
                Farmers List Produce
              </h3>
              <p className="text-xs text-agritext-secondary leading-relaxed">
                Post crop varieties, quality grades, asking prices, quantities, harvest dates, and pickup locations.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card p-6 border-agriborder text-center relative group hover:border-forest transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-agrigreen-100 text-forest font-black text-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-forest group-hover:text-white transition-colors">
                2
              </div>
              <h3 className="text-base font-bold text-agritext-main mb-2">
                Buyers Submit Offers
              </h3>
              <p className="text-xs text-agritext-secondary leading-relaxed">
                Discover listings, propose prices, requested quantities, preferred payment terms, and pickup arrangements.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card p-6 border-agriborder text-center relative group hover:border-forest transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-agrigreen-100 text-forest font-black text-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-forest group-hover:text-white transition-colors">
                3
              </div>
              <h3 className="text-base font-bold text-agritext-main mb-2">
                Compare Net Earnings
              </h3>
              <p className="text-xs text-agritext-secondary leading-relaxed">
                Farmers compare side-by-side net profit after deducting transport, packing, and loading expenses.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card p-6 border-agriborder text-center relative group hover:border-forest transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-agrigreen-100 text-forest font-black text-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-forest group-hover:text-white transition-colors">
                4
              </div>
              <h3 className="text-base font-bold text-agritext-main mb-2">
                Coordinate the Sale
              </h3>
              <p className="text-xs text-agritext-secondary leading-relaxed">
                Accept the best deal, reserve stock safely, track pickup timelines, and record confirmed fulfillment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for Farmers & Buyers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Farmer Card */}
          <div className="card p-8 bg-gradient-to-br from-white to-agrigreen-50 border-agrigreen-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-agritext-main">For Farmers</h3>
            </div>
            <ul className="space-y-3 text-sm text-agritext-secondary">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                <span><strong>No distress selling:</strong> Reach buyers beyond local mandis to secure fair prices.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                <span><strong>Net earnings transparency:</strong> Compare deals considering real freight deductions.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                <span><strong>Flexible negotiations:</strong> Counter-offer prices and terms directly with verified traders.</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link to="/register?role=farmer" className="btn-primary text-xs py-2.5 px-4">
                Join as Producer
              </Link>
            </div>
          </div>

          {/* Buyer Card */}
          <div className="card p-8 bg-gradient-to-br from-white to-amber-50/50 border-amber-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-agritext-main">For Buyers</h3>
            </div>
            <ul className="space-y-3 text-sm text-agritext-secondary">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span><strong>Direct farm sourcing:</strong> Fresh harvested crops without unnecessary intermediary markups.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span><strong>Verified listings:</strong> Reliable farmer details, verified land records, and clear crop grades.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span><strong>Logistics assistance:</strong> Route distances and indicative transport rates at your fingertips.</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link to="/register?role=buyer" className="btn-secondary text-xs py-2.5 px-4">
                Join as Buyer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="badge-green mb-2">Got Questions?</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-agritext-main">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h4 className="text-sm font-bold text-agritext-main mb-1 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-forest shrink-0" />
              <span>How are estimated net earnings calculated?</span>
            </h4>
            <p className="text-xs text-agritext-secondary leading-relaxed">
              Gross sale value equals offered price per unit multiplied by accepted quantity. Estimated net earnings subtract transport costs, packaging expenses, loading fees, and applicable platform expenses from that gross value.
            </p>
          </div>

          <div className="card p-5">
            <h4 className="text-sm font-bold text-agritext-main mb-1 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-forest shrink-0" />
              <span>Are transport costs guaranteed quotations?</span>
            </h4>
            <p className="text-xs text-agritext-secondary leading-relaxed">
              No. KrishiSetu calculates indicative estimates based on road distance and commercial haulage benchmarks to help compare offers. Actual transport costs depend on the carrier hired by the buyer or farmer.
            </p>
          </div>

          <div className="card p-5">
            <h4 className="text-sm font-bold text-agritext-main mb-1 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-forest shrink-0" />
              <span>How does stock reservation prevent overselling?</span>
            </h4>
            <p className="text-xs text-agritext-secondary leading-relaxed">
              When a farmer accepts an offer, that quantity is automatically moved from available stock into reserved stock. If available stock drops to zero, the listing is marked reserved, preventing conflicting offers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

