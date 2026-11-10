const User = require('../models/User');
const VerificationRequest = require('../models/VerificationRequest');

// @desc Get user profile
// @route GET /api/users/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update user profile
// @route PATCH /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'name',
      'phone',
      'location',
      'farmDetails',
      'businessDetails',
      'preferredLanguage',
      'profileImage',
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update password
// @route PATCH /api/users/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password entered is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password successfully updated.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Submit identity / farm verification request
// @route POST /api/users/verify
exports.submitVerification = async (req, res) => {
  try {
    const { documentType, documentNumber, submittedDetails } = req.body;

    const request = await VerificationRequest.create({
      userId: req.user._id,
      documentType,
      documentNumber,
      submittedDetails,
      status: 'pending',
    });

    // Update user status to pending
    await User.findByIdAndUpdate(req.user._id, { verificationStatus: 'pending' });

    res.status(201).json({
      success: true,
      message: 'Verification request submitted successfully for administrative review.',
      request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
