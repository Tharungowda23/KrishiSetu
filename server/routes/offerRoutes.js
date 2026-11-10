const express = require('express');
const router = express.Router();
const {
  createOffer,
  getSentOffers,
  getReceivedOffers,
  getOfferById,
  counterOffer,
  acceptOffer,
  acceptCounterOffer,
  rejectOffer,
  withdrawOffer,
} = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('buyer'), createOffer);
router.get('/sent', authorize('buyer'), getSentOffers);
router.get('/received', authorize('farmer'), getReceivedOffers);
router.get('/:id', getOfferById);
router.patch('/:id/counter', counterOffer);
router.patch('/:id/accept', authorize('farmer'), acceptOffer);
router.patch('/:id/accept-counter', authorize('buyer'), acceptCounterOffer);
router.patch('/:id/reject', authorize('farmer'), rejectOffer);
router.patch('/:id/withdraw', authorize('buyer'), withdrawOffer);

module.exports = router;


