const { describe, it } = require('node:test');
const assert = require('node:assert');

const {
  convertToKg,
  convertFromKg,
  convertPricePerUnit,
  calculateGrossSaleValue,
  calculateTotalExpenses,
  calculateNetEarnings,
  compareOffers,
} = require('../services/calculationService');

const {
  getEstimatedDistance,
  recommendVehicleType,
  calculateTransportEstimate,
} = require('../services/transportService');

describe('KrishiSetu Unit Conversion & Calculation Service', () => {
  it('correctly converts quintals and tonnes to kilograms', () => {
    assert.strictEqual(convertToKg(1, 'kg'), 1);
    assert.strictEqual(convertToKg(1, 'quintal'), 100);
    assert.strictEqual(convertToKg(2.5, 'quintal'), 250);
    assert.strictEqual(convertToKg(1, 'tonne'), 1000);
    assert.strictEqual(convertToKg(5, 'tonne'), 5000);
  });

  it('correctly converts kilograms to target units', () => {
    assert.strictEqual(convertFromKg(100, 'quintal'), 1);
    assert.strictEqual(convertFromKg(250, 'quintal'), 2.5);
    assert.strictEqual(convertFromKg(1000, 'tonne'), 1);
    assert.strictEqual(convertFromKg(50, 'kg'), 50);
  });

  it('accurately converts prices per unit', () => {
    // ₹25/kg should equal ₹2500/quintal
    assert.strictEqual(convertPricePerUnit(25, 'kg', 'quintal'), 2500);
    // ₹2800/quintal should equal ₹28/kg
    assert.strictEqual(convertPricePerUnit(2800, 'quintal', 'kg'), 28);
    // ₹3000/quintal should equal ₹30,000/tonne
    assert.strictEqual(convertPricePerUnit(3000, 'quintal', 'tonne'), 30000);
  });

  it('computes Gross Sale Value accurately across units', () => {
    // 10 quintals at ₹2,500/quintal = ₹25,000
    const gross1 = calculateGrossSaleValue(2500, 'quintal', 10, 'quintal');
    assert.strictEqual(gross1, 25000);

    // 1000 kg at ₹2500/quintal = 10 quintals * 2500 = ₹25,000
    const gross2 = calculateGrossSaleValue(2500, 'quintal', 1000, 'kg');
    assert.strictEqual(gross2, 25000);
  });

  it('calculates total expenses without double-counting', () => {
    const expenses = {
      transportation: 2000,
      packaging: 300,
      loading: 200,
      platformFees: 150,
      otherExpenses: 50,
    };
    assert.strictEqual(calculateTotalExpenses(expenses), 2700);
  });

  it('computes Estimated Net Earnings = Gross - Total Expenses', () => {
    const gross = 25000;
    const expenses = { transportation: 2000, packaging: 0, loading: 0 };
    const result = calculateNetEarnings(gross, expenses);

    assert.strictEqual(result.grossSaleValue, 25000);
    assert.strictEqual(result.totalExpenses, 2000);
    assert.strictEqual(result.netEarnings, 23000);
  });

  it('proves core differentiator: Buyer A provides higher net earnings than Buyer B despite lower gross offer', () => {
    // Prompt specification example:
    // Buyer A: gross ₹25,000, transport ₹2,000, net ₹23,000
    // Buyer B: gross ₹27,000, transport ₹5,000, net ₹22,000
    const rawOffers = [
      {
        _id: 'offer-buyer-b',
        offeredPrice: 2700,
        priceUnit: 'quintal',
        requestedQuantity: 10,
        quantityUnit: 'quintal',
        grossOfferValue: 27000,
        estimatedExpenses: { transportation: 5000 },
        deliveryPreference: 'Farmer Organizes Transport',
      },
      {
        _id: 'offer-buyer-a',
        offeredPrice: 2500,
        priceUnit: 'quintal',
        requestedQuantity: 10,
        quantityUnit: 'quintal',
        grossOfferValue: 25000,
        estimatedExpenses: { transportation: 2000 },
        deliveryPreference: 'Buyer Arranges Pickup',
      },
    ];

    const ranked = compareOffers(rawOffers);

    // Buyer A should rank first because net ₹23,000 > Buyer B net ₹22,000
    assert.strictEqual(ranked[0]._id, 'offer-buyer-a');
    assert.strictEqual(ranked[0].estimatedNetEarnings, 23000);
    assert.strictEqual(ranked[0].isHighestNetEarnings, true);

    assert.strictEqual(ranked[1]._id, 'offer-buyer-b');
    assert.strictEqual(ranked[1].estimatedNetEarnings, 22000);
    assert.strictEqual(ranked[1].isHighestNetEarnings, undefined);
  });
});

describe('KrishiSetu Transport Logistics Estimator', () => {
  it('correctly looks up regional road distances', () => {
    const dist1 = getEstimatedDistance('Mandya', 'Bengaluru');
    assert.strictEqual(dist1, 100);

    const dist2 = getEstimatedDistance('Bengaluru', 'Mysuru');
    assert.strictEqual(dist2, 145);

    const sameLocation = getEstimatedDistance('Hassan', 'Hassan');
    assert.strictEqual(sameLocation, 15);
  });

  it('recommends appropriate vehicle capacity based on payload weight', () => {
    assert.strictEqual(recommendVehicleType(800), 'mini_truck');
    assert.strictEqual(recommendVehicleType(1800), 'pickup_truck');
    assert.strictEqual(recommendVehicleType(4500), 'medium_canter');
    assert.strictEqual(recommendVehicleType(12000), 'heavy_truck');
  });

  it('calculates realistic transportation estimate with breakdown and disclaimer', () => {
    const estimate = calculateTransportEstimate({
      pickupDistrict: 'Mandya',
      destinationDistrict: 'Bengaluru',
      quantityKg: 1000,
      includeLoading: true,
      includePackaging: false,
    });

    assert.strictEqual(estimate.isEstimate, true);
    assert.strictEqual(estimate.distanceKm, 100);
    assert.ok(estimate.costs.totalEstimatedExpenses > 0);
    assert.ok(estimate.costs.costPerKg > 0);
    assert.ok(estimate.disclaimer.includes('Estimates are indicative'));
  });
});
