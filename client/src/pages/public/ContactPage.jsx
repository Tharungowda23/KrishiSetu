import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ContactPage = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    userRole: user?.role || 'visitor',
    category: 'General Inquiry',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage('Please fill in your name, email, and message.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/support', formData);
      if (res.data.success) {
        setSuccessMessage(res.data.message);
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          userRole: user?.role || 'visitor',
          category: 'General Inquiry',
          subject: '',
          message: '',
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="badge-green">Platform Support</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-agritext-main tracking-tight">
          Contact & Help Desk
        </h1>
        <p className="text-sm text-agritext-secondary leading-relaxed">
          Need assistance listing produce, verifying your account, or resolving a transaction query? Our agricultural support team is here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6 space-y-4 bg-gradient-to-br from-white to-agrigreen-50 border-agrigreen-200">
            <h3 className="text-base font-bold text-agritext-main">Contact Channels</h3>

            <div className="space-y-4 text-xs text-agritext-secondary pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-agrigreen-100 text-forest flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-agritext-main block">Email Support</span>
                  <span>support@krishisetu.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-agrigreen-100 text-forest flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-agritext-main block">Helpline (Mon - Sat)</span>
                  <span>+91 94480 12345 (8:00 AM - 7:00 PM)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-agrigreen-100 text-forest flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-agritext-main block">Headquarters</span>
                  <span>Agricultural Technology Corridor, Yeshwanthpur, Bengaluru, Karnataka - 560022</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5 bg-white border-agriborder space-y-2">
            <h4 className="text-xs font-bold text-agritext-main flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-forest" />
              <span>Identity Verification Support</span>
            </h4>
            <p className="text-xs text-agritext-secondary leading-relaxed">
              Farmers requesting credential verification can submit their RTC / Pahani land records or Kisan Credit Card from their account profile.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="card p-6 sm:p-8 space-y-5">
            <h2 className="text-xl font-bold text-agritext-main">Send an Inquiry</h2>

            {successMessage && (
              <div className="p-4 rounded-xl bg-agrigreen-100 border border-agrigreen-200 text-forest text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div>
                  <span className="font-bold block">Inquiry Registered Successfully!</span>
                  <span>{successMessage}</span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-agrierror text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text text-xs">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field text-xs"
                    placeholder="e.g. Ramesh Gowda"
                  />
                </div>
                <div>
                  <label className="label-text text-xs">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field text-xs"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text text-xs">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field text-xs"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="label-text text-xs">User Role</label>
                  <select
                    value={formData.userRole}
                    onChange={(e) => setFormData({ ...formData, userRole: e.target.value })}
                    className="input-field text-xs"
                  >
                    <option value="farmer">Farmer / Producer</option>
                    <option value="buyer">Commercial Buyer / Trader</option>
                    <option value="visitor">Visitor / Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text text-xs">Issue Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field text-xs"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Listing Issue">Listing Issue</option>
                    <option value="Offer & Bidding">Offer & Bidding</option>
                    <option value="Transport & Delivery">Transport & Delivery</option>
                    <option value="Payments & Earnings">Payments & Earnings</option>
                    <option value="Account Verification">Account Verification</option>
                    <option value="Bug Report">Technical Bug Report</option>
                  </select>
                </div>
                <div>
                  <label className="label-text text-xs">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input-field text-xs"
                    placeholder="Brief summary of inquiry"
                  />
                </div>
              </div>

              <div>
                <label className="label-text text-xs">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input-field text-xs"
                  placeholder="Describe your question or transaction reference in detail..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting...' : 'Submit Support Ticket'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
