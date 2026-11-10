const User = require('../models/User');
const CropListing = require('../models/CropListing');
const Offer = require('../models/Offer');
const Sale = require('../models/Sale');
const VerificationRequest = require('../models/VerificationRequest');
const SupportTicket = require('../models/SupportTicket');

// @desc Admin Dashboard Metrics
// @route GET /api/admin/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const activeListings = await CropListing.countDocuments({ status: 'active' });
    const totalOffers = await Offer.countDocuments();
    const pendingOffers = await Offer.countDocuments({ status: 'pending' });
    const inProgressSales = await Sale.countDocuments({ saleStatus: { $in: ['Active', 'In Progress'] } });
    const completedSales = await Sale.countDocuments({ saleStatus: 'Completed' });
    const openDisputes = await Sale.countDocuments({ 'disputeDetails.status': 'Open' });
    const pendingVerifications = await VerificationRequest.countDocuments({ status: 'pending' });

    // Aggregate Completed Gross Merchandise Value (GMV)
    const salesValues = await Sale.aggregate([
      { $match: { saleStatus: 'Completed' } },
      { $group: { _id: null, totalValue: { $sum: '$grossSaleValue' } } },
    ]);
    const totalCompletedValue = salesValues.length > 0 ? salesValues[0].totalValue : 0;

    // Categories breakdown
    const categoryStats = await CropListing.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    // Recent activity log
    const recentSales = await Sale.find()
      .populate('farmerId', 'name')
      .populate('buyerId', 'name')
      .populate('listingId', 'cropName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalFarmers,
        totalBuyers,
        activeListings,
        totalOffers,
        pendingOffers,
        inProgressSales,
        completedSales,
        totalCompletedValue,
        openDisputes,
        pendingVerifications,
      },
      categoryStats,
      recentSales,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all users with filters
// @route GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { role, verificationStatus, accountStatus, search } = req.query;
    const query = {};

    if (role && role !== 'All') query.role = role;
    if (verificationStatus && verificationStatus !== 'All') query.verificationStatus = verificationStatus;
    if (accountStatus && accountStatus !== 'All') query.accountStatus = accountStatus;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update user account or verification status
// @route PATCH /api/admin/users/:id/status
exports.updateUserStatus = async (req, res) => {
  try {
    const { accountStatus, verificationStatus } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (accountStatus) user.accountStatus = accountStatus;
    if (verificationStatus) user.verificationStatus = verificationStatus;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User status successfully updated by administrator.',
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all listings for admin moderation
// @route GET /api/admin/listings
exports.getListings = async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All') query.category = category;

    const listings = await CropListing.find(query)
      .populate('farmerId', 'name email location verificationStatus')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Moderate listing (change status, hide, or restore)
// @route PATCH /api/admin/listings/:id/moderation
exports.moderateListing = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const listing = await CropListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    listing.status = status;
    await listing.save();

    res.status(200).json({
      success: true,
      message: `Listing status updated to ${status}. Reason: ${reason || 'Administrative action'}`,
      listing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get verification requests
// @route GET /api/admin/verifications
exports.getVerifications = async (req, res) => {
  try {
    const requests = await VerificationRequest.find()
      .populate('userId', 'name email role location phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Review verification request (approve or reject)
// @route PATCH /api/admin/verifications/:id
exports.reviewVerification = async (req, res) => {
  try {
    const { status, reviewReason } = req.body;
    const request = await VerificationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Verification request not found.' });
    }

    request.status = status;
    request.reviewedBy = req.user._id;
    request.reviewReason = reviewReason || '';
    request.reviewedAt = new Date();
    await request.save();

    // Update user record
    await User.findByIdAndUpdate(request.userId, {
      verificationStatus: status === 'approved' ? 'verified' : 'rejected',
    });

    res.status(200).json({
      success: true,
      message: `Verification request marked as ${status}.`,
      request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Admin Platform Reports & Insights
// @route GET /api/admin/reports
exports.getReports = async (req, res) => {
  try {
    const totalListings = await CropListing.countDocuments();
    const totalOffers = await Offer.countDocuments();
    const acceptedOffers = await Offer.countDocuments({ status: 'accepted' });
    const acceptanceRate = totalOffers > 0 ? Math.round((acceptedOffers / totalOffers) * 100) : 0;

    // Monthly listings growth
    const listingsByMonth = await CropListing.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Sales by district
    const salesByLocation = await Sale.aggregate([
      {
        $group: {
          _id: '$pickupLocation.district',
          salesCount: { $sum: 1 },
          totalValue: { $sum: '$grossSaleValue' },
        },
      },
      { $sort: { totalValue: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      report: {
        totalListings,
        totalOffers,
        acceptedOffers,
        acceptanceRate: `${acceptanceRate}%`,
        listingsByMonth,
        salesByLocation,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
