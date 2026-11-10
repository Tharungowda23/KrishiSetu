const express = require('express');
const router = express.Router();
const {
  getSavedListings,
  saveListing,
  removeSavedListing,
} = require('../controllers/savedListingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('buyer'));

router.get('/', getSavedListings);
router.post('/:listingId', saveListing);
router.delete('/:listingId', removeSavedListing);

module.exports = router;
