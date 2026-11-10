const mongoose = require('mongoose');

const savedListingSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CropListing',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique buyer + listing bookmark
savedListingSchema.index({ buyerId: 1, listingId: 1 }, { unique: true });

module.exports = mongoose.model('SavedListing', savedListingSchema);
