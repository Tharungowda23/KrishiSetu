const {
  calculateTransportEstimate,
  VEHICLE_TYPES,
} = require('../services/transportService');

// @desc Calculate transportation and logistics estimate
// @route POST /api/transport/estimate
exports.estimateTransport = async (req, res) => {
  try {
    const {
      pickupDistrict,
      destinationDistrict,
      quantityKg,
      vehicleTypeChoice,
      includeLoading,
      includePackaging,
    } = req.body;

    if (!pickupDistrict || !destinationDistrict) {
      return res.status(400).json({
        success: false,
        message: 'Both pickup location and destination district are required.',
      });
    }

    const estimate = calculateTransportEstimate({
      pickupDistrict,
      destinationDistrict,
      quantityKg: Number(quantityKg) || 1000,
      vehicleTypeChoice,
      includeLoading: includeLoading !== false,
      includePackaging: includePackaging === true,
    });

    res.status(200).json({
      success: true,
      estimate,
      vehicleOptions: Object.keys(VEHICLE_TYPES).map((k) => ({
        key: k,
        name: VEHICLE_TYPES[k].name,
        maxCapacityKg: VEHICLE_TYPES[k].maxCapacityKg,
        ratePerKm: VEHICLE_TYPES[k].ratePerKm,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
