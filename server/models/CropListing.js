const mongoose = require('mongoose');

const cropListingSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'Vegetables',
        'Grains & Cereals',
        'Pulses',
        'Oilseeds',
        'Spices',
        'Fruits',
        'Commercial Crops',
        'Other',
      ],
      default: 'Vegetables',
      index: true,
    },
    variety: {
      type: String,
      trim: true,
      default: 'Standard / Desi',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    images: [
      {
        type: String,
      },
    ],
    qualityGrade: {
      type: String,
      enum: [
        'Grade A (Export / Premium)',
        'Grade B (Standard Market)',
        'Grade C (Fair Average)',
        'Organic Certified',
      ],
      default: 'Grade B (Standard Market)',
    },
    askingPrice: {
      type: Number,
      required: [true, 'Asking price is required'],
      min: [0.1, 'Asking price must be positive'],
    },
    priceUnit: {
      type: String,
      enum: ['kg', 'quintal', 'tonne'],
      default: 'quintal',
    },
    originalQuantity: {
      type: Number,
      required: [true, 'Total available quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: [0, 'Available quantity cannot be negative'],
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    minimumOrderQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    quantityUnit: {
      type: String,
      enum: ['kg', 'quintal', 'tonne'],
      default: 'quintal',
    },
    location: {
      state: { type: String, default: 'Karnataka' },
      district: { type: String, required: true },
      villageLocation: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    harvestDate: {
      type: Date,
    },
    availableFrom: {
      type: Date,
      default: Date.now,
    },
    deliveryPreferences: {
      pickupAvailable: { type: Boolean, default: true },
      deliveryAvailable: { type: Boolean, default: false },
      notes: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'reserved', 'sold', 'expired'],
      default: 'active',
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text search index
cropListingSchema.index({ cropName: 'text', variety: 'text', description: 'text' });

module.exports = mongoose.model('CropListing', cropListingSchema);
