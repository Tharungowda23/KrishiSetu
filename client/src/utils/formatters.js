/**
 * KrishiSetu Formatting Utilities
 */

// Formats currency in Indian Rupee format (e.g. ₹25,000)
export const formatRupee = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Formats number in Indian numbering system (e.g. 1,00,000)
export const formatIndianNumber = (number) => {
  if (number === undefined || number === null || isNaN(number)) return '0';
  return new Intl.NumberFormat('en-IN').format(number);
};

// Formats date into readable string (e.g. "18 Oct 2026")
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Formats relative time (e.g. "2 hours ago")
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(dateString);
};

// Normalizes unit names for display
export const formatUnit = (unit) => {
  const norm = (unit || '').toLowerCase();
  if (norm === 'quintal') return 'Quintal (100 kg)';
  if (norm === 'tonne') return 'Metric Tonne (1,000 kg)';
  if (norm === 'kg') return 'Kilogram';
  return unit || 'Quintal';
};

export const KARNATAKA_DISTRICTS = [
  'Bagalkote',
  'Ballari',
  'Belagavi',
  'Bengaluru Rural',
  'Bengaluru Urban',
  'Bidar',
  'Chamarajanagara',
  'Chikkaballapura',
  'Chikkamagaluru',
  'Chitradurga',
  'Dakshina Kannada',
  'Davanagere',
  'Dharwad',
  'Gadag',
  'Hassan',
  'Haveri',
  'Kalaburagi',
  'Kodagu',
  'Kolar',
  'Koppal',
  'Mandya',
  'Mysuru',
  'Raichur',
  'Ramanagara',
  'Shivamogga (Shimoga)',
  'Tumakuru (Tumkur)',
  'Udupi',
  'Uttara Kannada',
  'Vijayapura',
  'Yadgir',
];

export const CROP_CATEGORIES = [
  'Vegetables',
  'Grains & Cereals',
  'Pulses',
  'Oilseeds',
  'Spices',
  'Fruits',
  'Commercial Crops',
  'Other',
];
