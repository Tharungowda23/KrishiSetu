const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  submitVerification,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/password', changePassword);
router.post('/verify', submitVerification);

module.exports = router;
