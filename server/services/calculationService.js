/**
 * KrishiSetu Core Calculation Service
 * Handles decimal-safe arithmetic for agricultural marketplace transactions,
 * unit conversions, gross sale calculation, expense breakdowns, and offer rankings.
 */

// Supported agricultural units
const UNITS = {
  KG: 'kg',
  QUINTAL: 'quintal',
  TONNE: 'tonne',
};

// Conversion factors to base unit: Kilograms (kg)
const TO_KG_FACTORS = {
  kg: 1,
  quintal: 100, // 1 quintal = 100 kg
  tonne: 1000, // 1 metric tonne = 1,000 kg
};

/**
 * Normalizes any quantity into kilograms.
 * @param {number} quantity - Quantity value
 * @param {string} unit - 'kg' | 'quintal' | 'tonne'
 * @returns {number} Quantity in kilograms
 */
function convertToKg(quantity, unit = 'quintal') {
  const normUnit = (unit || '').toLowerCase().trim();
  const factor = TO_KG_FACTORS[normUnit];
  if (!factor) {
    throw new Error(`Unsupported unit: "${unit}". Supported units are kg, quintal, tonne.`);
  }
  const qty = Number(quantity);
  if (isNaN(qty) || qty < 0) {
    throw new Error(`Invalid non-negative quantity: ${quantity}`);
  }
  return Math.round(qty * factor * 1000) / 1000;
}

/**
 * Converts a quantity from kilograms to target unit.
 * @param {number} quantityInKg - Quantity in kg
 * @param {string} targetUnit - 'kg' | 'quintal' | 'tonne'
 * @returns {number}
 */
function convertFromKg(quantityInKg, targetUnit = 'quintal') {
  const normUnit = (targetUnit || '').toLowerCase().trim();
  const factor = TO_KG_FACTORS[normUnit];
  if (!factor) {
    throw new Error(`Unsupported unit: "${targetUnit}".`);
  }
  return Math.round((Number(quantityInKg) / factor) * 1000) / 1000;
}

/**
 * Converts price from one unit to another (e.g. ₹25/kg -> ₹2500/quintal).
 * @param {number} price - Price per fromUnit
 * @param {string} fromUnit - source unit
 * @param {string} toUnit - destination unit
 * @returns {number} Price per toUnit
 */
function convertPricePerUnit(price, fromUnit, toUnit) {
  const p = Number(price);
  if (isNaN(p) || p < 0) {
    throw new Error(`Invalid price: ${price}`);
  }
  if (fromUnit === toUnit) return p;
  // Convert price per fromUnit into price per kg
  const fromFactor = TO_KG_FACTORS[fromUnit.toLowerCase()];
  const toFactor = TO_KG_FACTORS[toUnit.toLowerCase()];
  if (!fromFactor || !toFactor) {
    throw new Error('Unsupported unit in price conversion');
  }
  const pricePerKg = p / fromFactor;
  const priceInTarget = pricePerKg * toFactor;
  return Math.round(priceInTarget * 100) / 100;
}

/**
 * Calculates gross sale value:
 * Gross Sale Value = Offered Price Per Unit * Accepted Quantity
 * (Ensuring price unit and quantity unit are aligned)
 */
function calculateGrossSaleValue(pricePerUnit, priceUnit, quantity, quantityUnit) {
  const p = Number(pricePerUnit);
  const q = Number(quantity);
  if (isNaN(p) || isNaN(q) || p <= 0 || q <= 0) {
    return 0;
  }

  // Convert quantity to match the price unit
  const qtyInKg = convertToKg(q, quantityUnit);
  const qtyInPriceUnit = convertFromKg(qtyInKg, priceUnit);

  const gross = Math.round(p * qtyInPriceUnit * 100) / 100;
  return gross;
}

/**
 * Sums all expenses with precision.
 */
function calculateTotalExpenses(expenses = {}) {
  const {
    transportation = 0,
    packaging = 0,
    loading = 0,
    platformFees = 0,
    otherExpenses = 0,
  } = expenses;

  const total =
    Number(transportation || 0) +
    Number(packaging || 0) +
    Number(loading || 0) +
    Number(platformFees || 0) +
    Number(otherExpenses || 0);

  return Math.round(total * 100) / 100;
}

/**
 * Calculates Estimated Net Earnings:
 * Net Earnings = Gross Sale Value - Total Expenses
 */
function calculateNetEarnings(grossSaleValue, expenses = {}) {
  const gross = Number(grossSaleValue || 0);
  const totalExp = calculateTotalExpenses(expenses);
  const net = Math.round((gross - totalExp) * 100) / 100;
  return {
    grossSaleValue: gross,
    totalExpenses: totalExp,
    netEarnings: net,
    expensesBreakdown: {
      transportation: Number(expenses.transportation || 0),
      packaging: Number(expenses.packaging || 0),
      loading: Number(expenses.loading || 0),
      platformFees: Number(expenses.platformFees || 0),
      otherExpenses: Number(expenses.otherExpenses || 0),
    },
  };
}

/**
 * Compares multiple offers for a crop listing.
 * Ranks offers based on:
 * 1. Estimated Net Earnings
 * 2. Net earnings per kg (for comparable rate efficiency)
 * 3. Highlights key nuances (Buyer verification, transport responsibility, payment terms)
 */
function compareOffers(offers = []) {
  if (!offers || offers.length === 0) return [];

  const analyzedOffers = offers.map((offer) => {
    const rawOffer = offer.toObject ? offer.toObject() : offer;
    const gross =
      rawOffer.grossOfferValue ||
      calculateGrossSaleValue(
        rawOffer.offeredPrice,
        rawOffer.priceUnit || 'quintal',
        rawOffer.requestedQuantity,
        rawOffer.quantityUnit || 'quintal'
      );

    const expenses = rawOffer.estimatedExpenses || {};
    const hasTransportEstimate =
      expenses.transportation !== undefined && expenses.transportation !== null;

    const { totalExpenses, netEarnings } = calculateNetEarnings(gross, expenses);
    const quantityKg = convertToKg(
      rawOffer.requestedQuantity,
      rawOffer.quantityUnit || 'quintal'
    );
    const netPerKg = quantityKg > 0 ? Math.round((netEarnings / quantityKg) * 100) / 100 : 0;
    const grossPerKg = quantityKg > 0 ? Math.round((gross / quantityKg) * 100) / 100 : 0;

    return {
      ...rawOffer,
      grossOfferValue: gross,
      totalExpenses,
      estimatedNetEarnings: netEarnings,
      quantityKg,
      netPerKg,
      grossPerKg,
      hasTransportEstimate,
      // Flag if transport is farmer's burden or buyer arranges pickup
      transportBorneBy:
        rawOffer.deliveryPreference === 'Buyer Arranges Pickup' ? 'Buyer' : 'Farmer',
    };
  });

  // Rank primarily by netEarnings descending
  analyzedOffers.sort((a, b) => b.estimatedNetEarnings - a.estimatedNetEarnings);

  // Mark the highest net offer
  if (analyzedOffers.length > 0) {
    analyzedOffers[0].isHighestNetEarnings = true;
  }

  return analyzedOffers;
}

module.exports = {
  UNITS,
  TO_KG_FACTORS,
  convertToKg,
  convertFromKg,
  convertPricePerUnit,
  calculateGrossSaleValue,
  calculateTotalExpenses,
  calculateNetEarnings,
  compareOffers,
};
