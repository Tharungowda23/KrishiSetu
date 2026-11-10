const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getListings,
  moderateListing,
  getVerifications,
  reviewVerification,
  getReports,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes strictly protected and authorized
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/listings', getListings);
router.patch('/listings/:id/moderation', moderateListing);
router.get('/verifications', getVerifications);
router.patch('/verifications/:id', reviewVerification);
router.get('/reports', getReports);

module.exports = router;
