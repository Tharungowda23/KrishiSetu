const SavedListing = require('../models/SavedListing');

// @desc Get buyer's bookmarked crops
// @route GET /api/saved-listings
exports.getSavedListings = async (req, res) => {
  try {
    const saved = await SavedListing.find({ buyerId: req.user._id })
      .populate({
        path: 'listingId',
        populate: { path: 'farmerId', select: 'name location verificationStatus' },
      })
      .sort({ createdAt: -1 });

    // Filter out any where listing was deleted
    const validListings = saved
      .filter((item) => item.listingId !== null)
      .map((item) => item.listingId);

    res.status(200).json({
      success: true,
      count: validListings.length,
      savedListings: validListings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Save / bookmark a listing
// @route POST /api/saved-listings/:listingId
exports.saveListing = async (req, res) => {
  try {
    const { listingId } = req.params;

    const existing = await SavedListing.findOne({
      buyerId: req.user._id,
      listingId,
    });

    if (existing) {
      return res.status(200).json({ success: true, message: 'Listing already saved.' });
    }

    await SavedListing.create({
      buyerId: req.user._id,
      listingId,
    });

    res.status(201).json({ success: true, message: 'Listing saved to your bookmarks.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Remove a saved listing
// @route DELETE /api/saved-listings/:listingId
exports.removeSavedListing = async (req, res) => {
  try {
    const { listingId } = req.params;

    await SavedListing.findOneAndDelete({
      buyerId: req.user._id,
      listingId,
    });

    res.status(200).json({ success: true, message: 'Listing removed from bookmarks.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
