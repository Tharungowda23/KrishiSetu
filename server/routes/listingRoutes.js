const express = require('express');
const router = express.Router();
const {
  getListings,
  getFeaturedListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getFarmerListings,
} = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Farmer specific listing retrieval
router.get('/farmer/mine', protect, authorize('farmer'), getFarmerListings);

// Public routes
router.get('/', getListings);
router.get('/featured', getFeaturedListings);
router.get('/:id', getListingById);

// Farmer only listing creation & management
router.post('/', protect, authorize('farmer'), upload.array('images', 5), createListing);
router.patch('/:id', protect, authorize('farmer', 'admin'), updateListing);
router.delete('/:id', protect, authorize('farmer', 'admin'), deleteListing);

module.exports = router;
