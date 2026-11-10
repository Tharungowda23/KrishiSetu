import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-forest-dark text-white pt-14 pb-8 border-t border-forest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-agrigreen-100 flex items-center justify-center p-2">
                <img src="/logo.svg" alt="KrishiSetu Logo" className="w-full h-full" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Krishi<span className="text-agrigreen-200">Setu</span>
              </span>
            </Link>
            <p className="text-sm text-gray-300 font-medium">
              “Connect. Compare. Sell Smarter.”
            </p>
            <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
              Empowering farmers with transparent net earnings calculation, direct buyer connections, and intelligent freight estimations across India.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-agrigreen-200">
              <ShieldCheck className="w-4 h-4" />
              <span>Supporting Fair Trade & Transparent Realized Pricing</span>
            </div>
          </div>

          {/* Marketplace links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-agrigreen-200 mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <Link to="/marketplace" className="hover:text-white transition-colors">
                  All Crop Listings
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=Vegetables" className="hover:text-white transition-colors">
                  Fresh Vegetables
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=Grains%20%26%20Cereals" className="hover:text-white transition-colors">
                  Grains & Cereals
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=Spices" className="hover:text-white transition-colors">
                  Spices & Condiments
                </Link>
              </li>
              <li>
                <Link to="/transport-estimator" className="hover:text-white transition-colors">
                  Logistics & Transport Estimator
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals & Workflows */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-agrigreen-200 mb-4">
              Portals & Tools
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <Link to="/register?role=farmer" className="hover:text-white transition-colors">
                  Join as Farmer
                </Link>
              </li>
              <li>
                <Link to="/register?role=buyer" className="hover:text-white transition-colors">
                  Join as Buyer
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How Net Comparison Works
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Help */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-agrigreen-200 mb-4">
              Help & Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Support Desk
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Our Mission & Story
                </Link>
              </li>
              <li className="flex items-start gap-2 pt-1 text-xs">
                <MapPin className="w-3.5 h-3.5 text-agrigreen-200 shrink-0 mt-0.5" />
                <span>Agricultural Trade Corridor, Bengaluru, Karnataka</span>
              </li>
              <li className="flex items-center gap-2 text-xs">
                <Mail className="w-3.5 h-3.5 text-agrigreen-200 shrink-0" />
                <span>support@krishisetu.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} KrishiSetu. All rights reserved. Built with MERN Stack.
          </p>
          <p className="text-[11px] text-gray-400 max-w-xl text-center md:text-right">
            Disclaimer: Transport charges and earnings shown on KrishiSetu are indicative calculations to assist decision making. Confirmed freight quotations and prices are finalized directly between negotiating parties.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
