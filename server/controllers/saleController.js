const Sale = require('../models/Sale');
const Notification = require('../models/Notification');
const { calculateTotalExpenses } = require('../services/calculationService');

// @desc Get user's sales (Farmer sales or Buyer purchases)
// @route GET /api/sales
exports.getSales = async (req, res) => {
  try {
    const { status, deliveryStatus } = req.query;
    let query = {};

    if (req.user.role === 'farmer') {
      query.farmerId = req.user._id;
    } else if (req.user.role === 'buyer') {
      query.buyerId = req.user._id;
    } else if (req.user.role === 'admin') {
      // admin sees all
    }

    if (status && status !== 'All') {
      query.saleStatus = status;
    }
    if (deliveryStatus && deliveryStatus !== 'All') {
      query.deliveryStatus = deliveryStatus;
    }

    const sales = await Sale.find(query)
      .populate('farmerId', 'name phone location farmDetails')
      .populate('buyerId', 'name phone location businessDetails')
      .populate('listingId', 'cropName variety images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sales.length,
      sales,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single sale detail
// @route GET /api/sales/:id
exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('farmerId', 'name phone location farmDetails email profileImage')
      .populate('buyerId', 'name phone location businessDetails email profileImage')
      .populate('listingId')
      .populate('offerId')
      .populate('statusHistory.updatedBy', 'name role');

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale order not found.' });
    }

    const isFarmer = sale.farmerId._id.toString() === req.user._id.toString();
    const isBuyer = sale.buyerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFarmer && !isBuyer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
    }

    res.status(200).json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update sale delivery / fulfillment status
// @route PATCH /api/sales/:id/status
exports.updateSaleStatus = async (req, res) => {
  try {
    const { deliveryStatus, paymentStatus, saleStatus, transportDetails, notes } = req.body;
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale order not found.' });
    }

    const isFarmer = sale.farmerId.toString() === req.user._id.toString();
    const isBuyer = sale.buyerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFarmer && !isBuyer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    // Update transport details if provided
    if (transportDetails) {
      sale.transportDetails = {
        ...sale.transportDetails,
        ...transportDetails,
      };
    }

    if (deliveryStatus) sale.deliveryStatus = deliveryStatus;
    if (paymentStatus) sale.paymentStatus = paymentStatus;
    if (saleStatus) sale.saleStatus = saleStatus;

    // Automatic completion check
    if (deliveryStatus === 'Delivered' && (paymentStatus === 'Completed' || paymentStatus === 'Paid on Delivery')) {
      sale.saleStatus = 'Completed';
    }

    // Add status history entry
    sale.statusHistory.push({
      status: `Status updated: ${deliveryStatus || sale.deliveryStatus} (Payment: ${paymentStatus || sale.paymentStatus})`,
      updatedBy: req.user._id,
      timestamp: new Date(),
      notes: notes || `Updated by ${req.user.name} (${req.user.role})`,
    });

    await sale.save();

    // Notify the other party
    const targetUserId = isFarmer ? sale.buyerId : sale.farmerId;
    await Notification.create({
      userId: targetUserId,
      type: 'sale_update',
      title: 'Order Status Update',
      message: `Order ${sale.saleReference} status changed to ${deliveryStatus || sale.deliveryStatus}.`,
      relatedEntityType: 'Sale',
      relatedEntityId: sale._id,
    });

    res.status(200).json({
      success: true,
      message: 'Sale status updated successfully.',
      sale,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Record actual expenses incurred
// @route PATCH /api/sales/:id/expenses
exports.updateActualExpenses = async (req, res) => {
  try {
    const { transportation, packaging, loading, platformFees, otherExpenses, isFinalized } = req.body;
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale order not found.' });
    }

    // Only farmer or admin can update actual expenses
    if (sale.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the farmer or admin can update expenses.' });
    }

    const expensesData = {
      transportation: Number(transportation) || 0,
      packaging: Number(packaging) || 0,
      loading: Number(loading) || 0,
      platformFees: Number(platformFees) || 0,
      otherExpenses: Number(otherExpenses) || 0,
    };

    const total = calculateTotalExpenses(expensesData);
    const actualNetEarnings = Math.round((sale.grossSaleValue - total) * 100) / 100;

    sale.actualExpenses = {
      ...expensesData,
      total,
      isFinalized: isFinalized !== undefined ? isFinalized : true,
      updatedAt: new Date(),
    };
    sale.actualNetEarnings = actualNetEarnings;

    sale.statusHistory.push({
      status: 'Actual Expenses Recorded',
      updatedBy: req.user._id,
      timestamp: new Date(),
      notes: `Actual expenses finalized at ₹${total}. Actual net earnings: ₹${actualNetEarnings}.`,
    });

    await sale.save();

    res.status(200).json({
      success: true,
      message: 'Actual expenses and net earnings updated successfully.',
      sale,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Report issue / dispute on sale
// @route POST /api/sales/:id/report-issue
exports.reportIssue = async (req, res) => {
  try {
    const { reason } = req.body;
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale order not found.' });
    }

    sale.disputeDetails = {
      status: 'Open',
      reason: reason || 'Dispute raised by participant',
      reportedBy: req.user._id,
      reportedAt: new Date(),
    };
    sale.saleStatus = 'Disputed';

    sale.statusHistory.push({
      status: 'Dispute Raised',
      updatedBy: req.user._id,
      timestamp: new Date(),
      notes: reason,
    });

    await sale.save();

    res.status(200).json({
      success: true,
      message: 'Issue reported to KrishiSetu administration for review.',
      sale,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
