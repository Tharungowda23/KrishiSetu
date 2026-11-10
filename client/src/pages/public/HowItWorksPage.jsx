import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  Store,
  Layers,
  Calculator,
  Truck,
  CheckCircle2,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

const HowItWorksPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="badge-green">Platform Architecture & Workflows</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-agritext-main tracking-tight">
          How KrishiSetu Empowers Transparent Agricultural Trade
        </h1>
        <p className="text-sm sm:text-base text-agritext-secondary leading-relaxed">
          Unlike opaque mandi intermediaries or simple classified boards, KrishiSetu enables structured offer negotiation with full visibility into transportation and loading expenses.
        </p>
      </div>

      {/* Farmer Workflow Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-agriborder">
          <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-agritext-main">Farmer Workflow</h2>
            <p className="text-xs text-agritext-secondary">From farm-gate listing to confirmed bank payment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-5 space-y-2 border-agriborder">
            <span className="text-xs font-bold text-forest">Step 1</span>
            <h3 className="text-sm font-bold text-agritext-main">Register & List Harvest</h3>
            <p className="text-xs text-agritext-secondary leading-relaxed">
              Upload photos, select crop category, specify variety, quality grade, quantity, and your asking price per quintal or tonne.
            </p>
          </div>

          <div className="card p-5 space-y-2 border-agriborder">
            <span className="text-xs font-bold text-forest">Step 2</span>
            <h3 className="text-sm font-bold text-agritext-main">Receive & Compare Offers</h3>
            <p className="text-xs text-agritext-secondary leading-relaxed">
              View all buyer proposals side by side. KrishiSetu automatically deducts estimated logistics to show your true net earnings.
            </p>
          </div>

          <div className="card p-5 space-y-2 border-agriborder">
            <span className="text-xs font-bold text-forest">Step 3</span>
            <h3 className="text-sm font-bold text-agritext-main">Accept, Reserve & Fulfill</h3>
            <p className="text-xs text-agritext-secondary leading-relaxed">
              Accept the best offer to safely reserve stock. Coordinate vehicle pickup dates, track in transit, and confirm payment.
            </p>
          </div>
        </div>
      </div>

      {/* Buyer Workflow Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-agriborder">
          <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-agritext-main">Buyer Workflow</h2>
            <p className="text-xs text-agritext-secondary">For wholesalers, food processors, exporters, and retailers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-5 space-y-2 border-agriborder">
            <span className="text-xs font-bold text-amber-700">Step 1</span>
            <h3 className="text-sm font-bold text-agritext-main">Discover Farm Produce</h3>
            <p className="text-xs text-agritext-secondary leading-relaxed">
              Filter crops by Karnataka district, variety, quantity, harvest timeline, and verified farmer credentials.
            </p>
          </div>

          <div className="card p-5 space-y-2 border-agriborder">
            <span className="text-xs font-bold text-amber-700">Step 2</span>
            <h3 className="text-sm font-bold text-agritext-main">Estimate Transport & Bid</h3>
            <p className="text-xs text-agritext-secondary leading-relaxed">
              Use the built-in road distance estimator to check logistics expenses, then submit your custom price, volume, and payment terms.
            </p>
          </div>

          <div className="card p-5 space-y-2 border-agriborder">
            <span className="text-xs font-bold text-amber-700">Step 3</span>
            <h3 className="text-sm font-bold text-agritext-main">Confirm Purchase & Dispatch</h3>
            <p className="text-xs text-agritext-secondary leading-relaxed">
              Upon farmer acceptance, receive farm gate coordinates, arrange truck dispatch, inspect quality upon loading, and track delivery.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed FAQ */}
      <div className="space-y-4 pt-6">
        <h2 className="text-xl font-bold text-agritext-main mb-4">Common Questions</h2>

        <div className="card p-5 space-y-1">
          <h4 className="text-sm font-bold text-agritext-main">How does offer negotiation work?</h4>
          <p className="text-xs text-agritext-secondary leading-relaxed">
            If a farmer considers a buyer's offer too low, they can propose a counter-offer price. Both parties retain full negotiation history until terms are accepted.
          </p>
        </div>

        <div className="card p-5 space-y-1">
          <h4 className="text-sm font-bold text-agritext-main">What happens if a buyer requests more than available stock?</h4>
          <p className="text-xs text-agritext-secondary leading-relaxed">
            Our system strictly validates available stock at offer submission and acceptance time. Stock is reserved atomically, preventing overselling.
          </p>
        </div>

        <div className="card p-5 space-y-1">
          <h4 className="text-sm font-bold text-agritext-main">Are payments handled directly or on platform?</h4>
          <p className="text-xs text-agritext-secondary leading-relaxed">
            Payment records on KrishiSetu track agreed payment milestones (e.g. advance received, payment on pickup, or net terms). In development mode, payment confirmations are recorded manually for transparent audit logs.
          </p>
        </div>
      </div>

      {/* CTA Bottom */}
      <div className="card p-8 bg-forest text-white text-center space-y-4">
        <h3 className="text-2xl font-bold">Ready to Trade with Full Earnings Clarity?</h3>
        <p className="text-xs text-gray-200 max-w-xl mx-auto">
          Join hundreds of progressive farmers and commercial buyers already utilizing KrishiSetu's net earnings comparison platform.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/register?role=farmer" className="btn-secondary text-forest text-xs py-2.5 px-4">
            Join as Farmer
          </Link>
          <Link to="/marketplace" className="btn-primary bg-agrigreen-500 hover:bg-agrigreen-600 text-xs py-2.5 px-4">
            Explore Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
