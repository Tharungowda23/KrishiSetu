const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['farmer', 'buyer', 'admin'],
        message: 'Role must be farmer, buyer, or admin',
      },
      default: 'farmer',
    },
    location: {
      state: { type: String, default: 'Karnataka' },
      district: { type: String, default: '' },
      cityVillage: { type: String, default: '' },
      address: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    profileImage: {
      type: String,
      default: '',
    },
    farmDetails: {
      farmName: { type: String, default: '' },
      totalLandAcres: { type: Number, default: 0 },
      produceCategories: [{ type: String }],
      description: { type: String, default: '' },
    },
    businessDetails: {
      businessName: { type: String, default: '' },
      businessType: {
        type: String,
        enum: ['Wholesaler', 'Retailer', 'Food Processor', 'Exporter', 'Trader', 'Individual', ''],
        default: 'Wholesaler',
      },
      preferredCategories: [{ type: String }],
      gstNumber: { type: String, default: '' },
      deliveryAddresses: [
        {
          label: String,
          address: String,
          district: String,
          state: String,
          pincode: String,
        },
      ],
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'deactivated'],
      default: 'active',
    },
    preferredLanguage: {
      type: String,
      default: 'en',
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Exclude password from toJSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  return user;
};

module.exports = mongoose.model('User', userSchema);
