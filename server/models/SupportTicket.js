const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
    },
    phone: {
      type: String,
      default: '',
    },
    userRole: {
      type: String,
      enum: ['farmer', 'buyer', 'visitor', 'other'],
      default: 'visitor',
    },
    category: {
      type: String,
      required: [true, 'Issue category is required'],
      enum: [
        'Listing Issue',
        'Offer & Bidding',
        'Transport & Delivery',
        'Payments & Earnings',
        'Account Verification',
        'General Inquiry',
        'Bug Report',
        'Other',
      ],
      default: 'General Inquiry',
    },
    subject: {
      type: String,
      default: 'Contact Form Inquiry',
    },
    message: {
      type: String,
      required: [true, 'Message text is required'],
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
