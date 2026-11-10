/**
 * KrishiSetu Transport Estimation Service
 * Provides transparent transportation cost calculations for agricultural freight.
 * All outputs clearly labeled as estimates.
 */

// Road distance matrix between key Karnataka agricultural hubs & consumption centers (in km)
const KARNATAKA_DISTANCES = {
  'Bengaluru-Mandya': 100,
  'Bengaluru-Mysuru': 145,
  'Bengaluru-Hassan': 182,
  'Bengaluru-Tumakuru': 70,
  'Bengaluru-Kolar': 72,
  'Bengaluru-Chikkaballapura': 65,
  'Bengaluru-Davanagere': 260,
  'Bengaluru-Shimoga': 300,
  'Bengaluru-Belagavi': 505,
  'Bengaluru-Hubballi': 410,
  'Mandya-Mysuru': 45,
  'Mandya-Hassan': 115,
  'Mysuru-Hassan': 120,
  'Hassan-Shimoga': 140,
  'Tumakuru-Davanagere': 195,
  'Kolar-Chikkaballapura': 55,
};

// Vehicle fleet categories and indicative base rates
const VEHICLE_TYPES = {
  mini_truck: {
    name: 'Mini Truck / Tata Ace',
    maxCapacityKg: 1000, // 10 quintals
    basePrice: 600, // Base minimum hire
    ratePerKm: 22, // Rs per km
    averageSpeedKmph: 40,
  },
  pickup_truck: {
    name: 'Pickup / Bolero Maxi',
    maxCapacityKg: 2000, // 20 quintals
    basePrice: 900,
    ratePerKm: 28,
    averageSpeedKmph: 45,
  },
  medium_canter: {
    name: 'Medium Commercial Vehicle (Canter 14ft)',
    maxCapacityKg: 5000, // 50 quintals
    basePrice: 1800,
    ratePerKm: 42,
    averageSpeedKmph: 40,
  },
  heavy_truck: {
    name: 'Heavy Truck (6-10 Wheeler)',
    maxCapacityKg: 16000, // 160 quintals
    basePrice: 3500,
    ratePerKm: 65,
    averageSpeedKmph: 35,
  },
  tractor_trolley: {
    name: 'Tractor Trolley (Local Farm-to-Mandi)',
    maxCapacityKg: 3500,
    basePrice: 500,
    ratePerKm: 25,
    averageSpeedKmph: 25,
  },
};

/**
 * Calculates road distance between two locations.
 */
function getEstimatedDistance(origin, destination) {
  const normOrigin = (origin || '').trim();
  const normDest = (destination || '').trim();

  if (normOrigin.toLowerCase() === normDest.toLowerCase()) {
    return 15; // Local district/taluk transit within 15 km
  }

  const key1 = `${normOrigin}-${normDest}`;
  const key2 = `${normDest}-${normOrigin}`;

  if (KARNATAKA_DISTANCES[key1]) return KARNATAKA_DISTANCES[key1];
  if (KARNATAKA_DISTANCES[key2]) return KARNATAKA_DISTANCES[key2];

  // Default inter-district estimate if not in lookup table
  return 120;
}

/**
 * Recommends optimal vehicle based on payload weight.
 */
function recommendVehicleType(weightKg) {
  if (weightKg <= 1000) return 'mini_truck';
  if (weightKg <= 2000) return 'pickup_truck';
  if (weightKg <= 5000) return 'medium_canter';
  return 'heavy_truck';
}

/**
 * Calculates complete transport estimate.
 */
function calculateTransportEstimate({
  pickupDistrict,
  destinationDistrict,
  quantityKg,
  vehicleTypeChoice,
  includeLoading = true,
  includePackaging = false,
}) {
  const weight = Number(quantityKg) || 1000;
  const distanceKm = getEstimatedDistance(pickupDistrict, destinationDistrict);

  const vehicleKey =
    vehicleTypeChoice && VEHICLE_TYPES[vehicleTypeChoice]
      ? vehicleTypeChoice
      : recommendVehicleType(weight);

  const vehicle = VEHICLE_TYPES[vehicleKey];

  // Calculate freight cost
  const rawTransportCost = vehicle.basePrice + distanceKm * vehicle.ratePerKm;
  const transportCost = Math.round(rawTransportCost / 50) * 50; // rounded to nearest 50

  // Indicative loading / unloading charges: ~₹15 per quintal (₹0.15/kg)
  const loadingCost = includeLoading ? Math.max(200, Math.round((weight / 100) * 25)) : 0;

  // Packaging estimate (crates / gunny bags) if requested: ~₹20 per quintal
  const packagingCost = includePackaging ? Math.round((weight / 100) * 20) : 0;

  const totalEstimatedCost = transportCost + loadingCost + packagingCost;

  // Unit costs
  const costPerKg = Math.round((totalEstimatedCost / weight) * 100) / 100;
  const costPerQuintal = Math.round(costPerKg * 100 * 10) / 10;

  // Transit time estimate in hours
  const transitHours = Math.max(1, Math.round((distanceKm / vehicle.averageSpeedKmph) * 10) / 10);

  return {
    isEstimate: true,
    pickupDistrict,
    destinationDistrict,
    distanceKm,
    payloadWeightKg: weight,
    vehicleType: {
      key: vehicleKey,
      name: vehicle.name,
      maxCapacityKg: vehicle.maxCapacityKg,
      ratePerKm: vehicle.ratePerKm,
    },
    costs: {
      baseFreight: transportCost,
      loadingCharges: loadingCost,
      packagingCharges: packagingCost,
      totalEstimatedExpenses: totalEstimatedCost,
      costPerKg,
      costPerQuintal,
    },
    estimatedTransitHours: transitHours,
    disclaimer:
      'Estimates are indicative regional freight guidelines based on standard commercial road haulage. Actual carrier rates may vary by road conditions, fuel prices, return load availability, and peak harvest seasons.',
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  VEHICLE_TYPES,
  getEstimatedDistance,
  recommendVehicleType,
  calculateTransportEstimate,
};
