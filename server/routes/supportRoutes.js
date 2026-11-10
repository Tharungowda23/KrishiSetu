const express = require('express');
const router = express.Router();
const { submitTicket, getTickets } = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/auth');

// Public contact form
router.post('/', submitTicket);

// Admin view
router.get('/', protect, authorize('admin'), getTickets);

module.exports = router;
