import React from 'react';
import { Sprout, Target, ShieldCheck, TrendingUp, Users, HeartHandshake } from 'lucide-react';

const AboutUsPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="badge-green">About KrishiSetu</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-agritext-main tracking-tight">
          Building a Fair, Transparent Bridge for Agricultural Commerce
        </h1>
        <p className="text-sm sm:text-base text-agritext-secondary leading-relaxed">
          In India, agriculture is the foundation of our economy. Yet millions of hardworking farmers face an information asymmetry that affects their livelihoods every harvest season.
        </p>
      </div>

      {/* The Challenge */}
      <div className="card p-8 bg-white border-agriborder space-y-4">
        <div className="flex items-center gap-2.5 text-forest">
          <Target className="w-5 h-5" />
          <h2 className="text-lg font-bold text-agritext-main">The Agricultural Dilemma</h2>
        </div>
        <p className="text-xs sm:text-sm text-agritext-secondary leading-relaxed">
          When produce is harvested, farmers receive offers from various buyers, village traders, and regional APMC brokers. A broker in a distant city might quote ₹2,700 per quintal, while a nearby distributor offers ₹2,500. Without transparent freight calculation tools, farmers frequently choose the higher gross quote, only to discover later that freight deductions, unloading charges, and travel expenses left them with less money in hand.
        </p>
        <p className="text-xs sm:text-sm text-agritext-secondary leading-relaxed">
          High gross figures frequently conceal low net margins.
        </p>
      </div>

      {/* The KrishiSetu Mission */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-gradient-to-br from-white to-agrigreen-50 border-agrigreen-200 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-agritext-main">Net Realization First</h3>
          <p className="text-xs text-agritext-secondary leading-relaxed">
            We put true net profit at the heart of our platform. Every offer is evaluated after deducting transportation and loading expenses.
          </p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-white to-agrigreen-50 border-agrigreen-200 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center mb-2">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-agritext-main">Direct Negotiation</h3>
          <p className="text-xs text-agritext-secondary leading-relaxed">
            Farmers and buyers communicate directly without unnecessary middleman suppression. Counter-offers can be submitted in seconds.
          </p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-white to-agrigreen-50 border-agrigreen-200 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-agritext-main">Logistics Clarity</h3>
          <p className="text-xs text-agritext-secondary leading-relaxed">
            Our route and payload cost estimators give both parties realistic benchmarks for commercial haulage before commitments are finalized.
          </p>
        </div>
      </div>

      {/* Future Vision */}
      <div className="card p-8 bg-cream border-agriborder space-y-3">
        <h3 className="text-base font-bold text-agritext-main">Future Platform Roadmap</h3>
        <p className="text-xs sm:text-sm text-agritext-secondary leading-relaxed">
          As KrishiSetu expands, our vision includes integration with official state mandi price APIs, direct transporter fleet bidding, digital escrow payment options, and AI-driven quality grading from crop photographs.
        </p>
      </div>
    </div>
  );
};

export default AboutUsPage;
