const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CropListing',
      required: true,
      index: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    offeredPrice: {
      type: Number,
      required: [true, 'Offered price is required'],
      min: [0.1, 'Offered price must be greater than 0'],
    },
    priceUnit: {
      type: String,
      enum: ['kg', 'quintal', 'tonne'],
      default: 'quintal',
    },
    requestedQuantity: {
      type: Number,
      required: [true, 'Requested quantity is required'],
      min: [1, 'Requested quantity must be at least 1'],
    },
    quantityUnit: {
      type: String,
      enum: ['kg', 'quintal', 'tonne'],
      default: 'quintal',
    },
    grossOfferValue: {
      type: Number,
      required: true,
    },
    estimatedExpenses: {
      transportation: { type: Number, default: 0 },
      packaging: { type: Number, default: 0 },
      loading: { type: Number, default: 0 },
      platformFees: { type: Number, default: 0 },
      otherExpenses: { type: Number, default: 0 },
      notes: { type: String, default: '' },
      isEstimated: { type: Boolean, default: true },
    },
    estimatedNetEarnings: {
      type: Number,
      required: true,
    },
    paymentTerms: {
      type: String,
      enum: [
        'Advance Payment',
        'Payment on Pickup / Delivery',
        'Escrow / Platform Verified',
        'Net 7 Days',
        'Net 15 Days',
      ],
      default: 'Payment on Pickup / Delivery',
    },
    deliveryPreference: {
      type: String,
      enum: [
        'Buyer Arranges Pickup',
        'Farmer Organizes Transport',
        'Third-Party Logistics Arranged',
      ],
      default: 'Buyer Arranges Pickup',
    },
    proposedPickupDate: {
      type: Date,
    },
    expirationDate: {
      type: Date,
      default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000), // 7 days ahead
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'counter-offered', 'rejected', 'withdrawn', 'expired'],
      default: 'pending',
      index: true,
    },
    message: {
      type: String,
      default: '',
    },
    counterOfferHistory: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        offeredPrice: Number,
        requestedQuantity: Number,
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Offer', offerSchema);
