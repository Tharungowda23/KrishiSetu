const express = require('express');
const router = express.Router();
const { estimateTransport } = require('../controllers/transportController');

// Transport estimation is publicly accessible or authenticated
router.post('/estimate', estimateTransport);

module.exports = router;
