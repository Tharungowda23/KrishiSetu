const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sendTokenResponse = (user, statusCode, res) => {
  const secret = process.env.JWT_SECRET || 'krishisetu_jwt_dev_secret_key_change_in_production_992384';
  const token = jwt.sign({ id: user._id, role: user.role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      location: user.location,
      profileImage: user.profileImage,
      farmDetails: user.farmDetails,
      businessDetails: user.businessDetails,
      verificationStatus: user.verificationStatus,
      accountStatus: user.accountStatus,
      preferredLanguage: user.preferredLanguage,
      createdAt: user.createdAt,
    },
  });
};

// @desc Register user (Farmer or Buyer only)
// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      state,
      district,
      cityVillage,
      address,
      pincode,
      // Farmer specifics
      farmName,
      totalLandAcres,
      produceCategories,
      farmDescription,
      // Buyer specifics
      businessName,
      businessType,
      preferredCategories,
      gstNumber,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    // Role security check: Never allow registration as admin
    const safeRole = role === 'buyer' ? 'buyer' : 'farmer';

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const userData = {
      name,
      email: email.toLowerCase().trim(),
      password,
      role: safeRole,
      phone: phone || '',
      location: {
        state: state || 'Karnataka',
        district: district || '',
        cityVillage: cityVillage || '',
        address: address || '',
        pincode: pincode || '',
      },
      farmDetails:
        safeRole === 'farmer'
          ? {
              farmName: farmName || `${name}'s Farm`,
              totalLandAcres: Number(totalLandAcres) || 0,
              produceCategories: Array.isArray(produceCategories)
                ? produceCategories
                : produceCategories
                ? [produceCategories]
                : ['Vegetables'],
              description: farmDescription || '',
            }
          : undefined,
      businessDetails:
        safeRole === 'buyer'
          ? {
              businessName: businessName || `${name} Enterprises`,
              businessType: businessType || 'Wholesaler',
              preferredCategories: Array.isArray(preferredCategories)
                ? preferredCategories
                : preferredCategories
                ? [preferredCategories]
                : ['Vegetables'],
              gstNumber: gstNumber || '',
            }
          : undefined,
    };

    const user = await User.create(userData);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
};

// @desc Login user
// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact platform support.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};

// @desc Logout user
// @route POST /api/auth/logout
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User successfully logged out.',
  });
};

// @desc Get current authenticated user
// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// @desc Forgot password token generator
// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email address.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });

    // Note for development: Return token in response if email transporter is not configured
    res.status(200).json({
      success: true,
      message: 'Password reset instructions generated.',
      devResetToken: resetToken,
      note: 'In local development mode without an SMTP provider, use this reset token directly.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Reset password with token
// @route POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required.',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.',
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
