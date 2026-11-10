const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: ['Aadhaar / Voter ID', 'Kisan Credit Card / Land Records (RTC/Pahani)', 'Trade License / GSTIN', 'FSSAI Certificate', 'Other Official ID'],
      required: true,
    },
    documentNumber: {
      type: String,
      default: '',
    },
    documentUrl: {
      type: String,
      default: '',
    },
    submittedDetails: {
      fullName: String,
      entityName: String,
      address: String,
      notes: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewReason: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
