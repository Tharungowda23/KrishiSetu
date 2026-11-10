const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CropListing',
    },
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
    },
    lastMessageText: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ participantIds: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
