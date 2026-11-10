const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    saleReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      required: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CropListing',
      required: true,
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
    agreedPrice: {
      type: Number,
      required: true,
    },
    priceUnit: {
      type: String,
      default: 'quintal',
    },
    agreedQuantity: {
      type: Number,
      required: true,
    },
    quantityUnit: {
      type: String,
      default: 'quintal',
    },
    grossSaleValue: {
      type: Number,
      required: true,
    },
    estimatedExpenses: {
      transportation: { type: Number, default: 0 },
      packaging: { type: Number, default: 0 },
      loading: { type: Number, default: 0 },
      platformFees: { type: Number, default: 0 },
      otherExpenses: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    actualExpenses: {
      transportation: { type: Number, default: 0 },
      packaging: { type: Number, default: 0 },
      loading: { type: Number, default: 0 },
      platformFees: { type: Number, default: 0 },
      otherExpenses: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      isFinalized: { type: Boolean, default: false },
      updatedAt: Date,
    },
    netEarningsEstimate: {
      type: Number,
      required: true,
    },
    actualNetEarnings: {
      type: Number,
      default: null,
    },
    pickupLocation: {
      state: String,
      district: String,
      villageLocation: String,
      address: String,
    },
    deliveryLocation: {
      state: String,
      district: String,
      address: String,
    },
    transportDetails: {
      carrierName: { type: String, default: '' },
      vehicleNumber: { type: String, default: '' },
      driverPhone: { type: String, default: '' },
      pickupDate: Date,
      estimatedArrival: Date,
      trackingNotes: { type: String, default: '' },
    },
    deliveryStatus: {
      type: String,
      enum: ['Awaiting Pickup', 'Pickup Scheduled', 'Picked Up', 'In Transit', 'Delivered', 'Cancelled'],
      default: 'Awaiting Pickup',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Advance Received', 'Escrow Held', 'Paid on Delivery', 'Completed', 'Disputed'],
      default: 'Pending',
    },
    saleStatus: {
      type: String,
      enum: ['Active', 'In Progress', 'Completed', 'Cancelled', 'Disputed'],
      default: 'Active',
      index: true,
    },
    statusHistory: [
      {
        status: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        notes: String,
      },
    ],
    disputeDetails: {
      status: {
        type: String,
        enum: ['None', 'Open', 'Under Review', 'Resolved'],
        default: 'None',
      },
      reason: String,
      reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reportedAt: Date,
      resolution: String,
      resolvedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Sale', saleSchema);
