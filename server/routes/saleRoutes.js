const express = require('express');
const router = express.Router();
const {
  getSales,
  getSaleById,
  updateSaleStatus,
  updateActualExpenses,
  reportIssue,
} = require('../controllers/saleController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getSales);
router.get('/:id', getSaleById);
router.patch('/:id/status', updateSaleStatus);
router.patch('/:id/expenses', updateActualExpenses);
router.post('/:id/report-issue', reportIssue);

module.exports = router;
