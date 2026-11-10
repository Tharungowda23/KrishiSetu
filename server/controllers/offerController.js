const Offer = require('../models/Offer');
const CropListing = require('../models/CropListing');
const Sale = require('../models/Sale');
const Notification = require('../models/Notification');
const {
  calculateGrossSaleValue,
  calculateNetEarnings,
  compareOffers,
  convertToKg,
  convertFromKg,
} = require('../services/calculationService');

// Helper to generate unique human-readable sale reference
function generateSaleReference() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `KS-SALE-${year}-${random}`;
}

// @desc Submit offer for a crop listing (Buyer only)
// @route POST /api/offers
exports.createOffer = async (req, res) => {
  try {
    const {
      listingId,
      offeredPrice,
      priceUnit,
      requestedQuantity,
      quantityUnit,
      estimatedExpenses,
      paymentTerms,
      deliveryPreference,
      proposedPickupDate,
      message,
    } = req.body;

    const listing = await CropListing.findById(listingId).populate('farmerId');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Crop listing not found.' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This crop listing is currently not accepting offers.',
      });
    }

    // Prevent farmer from offering on their own listing
    if (listing.farmerId._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit an offer on your own produce listing.',
      });
    }

    const reqQty = Number(requestedQuantity);
    const offerPrice = Number(offeredPrice);

    if (isNaN(reqQty) || reqQty <= 0 || isNaN(offerPrice) || offerPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid offered price and requested quantity are required.',
      });
    }

    // Check available stock in kg
    const reqQtyInKg = convertToKg(reqQty, quantityUnit || listing.quantityUnit);
    const availableQtyInKg = convertToKg(listing.availableQuantity, listing.quantityUnit);

    if (reqQtyInKg > availableQtyInKg) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${listing.availableQuantity} ${listing.quantityUnit}).`,
      });
    }

    // Calculate gross offer value & net earnings
    const grossOfferValue = calculateGrossSaleValue(
      offerPrice,
      priceUnit || listing.priceUnit,
      reqQty,
      quantityUnit || listing.quantityUnit
    );

    const expenses = estimatedExpenses || {
      transportation: deliveryPreference === 'Farmer Organizes Transport' ? 1500 : 0,
      packaging: 0,
      loading: 0,
      platformFees: 0,
      otherExpenses: 0,
      isEstimated: true,
    };

    const { netEarnings } = calculateNetEarnings(grossOfferValue, expenses);

    const offer = await Offer.create({
      listingId: listing._id,
      farmerId: listing.farmerId._id,
      buyerId: req.user._id,
      offeredPrice: offerPrice,
      priceUnit: priceUnit || listing.priceUnit,
      requestedQuantity: reqQty,
      quantityUnit: quantityUnit || listing.quantityUnit,
      grossOfferValue,
      estimatedExpenses: expenses,
      estimatedNetEarnings: netEarnings,
      paymentTerms: paymentTerms || 'Payment on Pickup / Delivery',
      deliveryPreference: deliveryPreference || 'Buyer Arranges Pickup',
      proposedPickupDate: proposedPickupDate ? new Date(proposedPickupDate) : undefined,
      message: message || '',
      status: 'pending',
    });

    // Notify farmer of new offer
    await Notification.create({
      userId: listing.farmerId._id,
      type: 'offer_received',
      title: 'New Offer Received!',
      message: `${req.user.name} offered ₹${offerPrice}/${offer.priceUnit} for ${reqQty} ${offer.quantityUnit} of ${listing.cropName}.`,
      relatedEntityType: 'Offer',
      relatedEntityId: offer._id,
    });

    res.status(201).json({
      success: true,
      message: 'Offer submitted successfully to the farmer.',
      offer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get offers received by farmer
// @route GET /api/offers/received
exports.getReceivedOffers = async (req, res) => {
  try {
    const { listingId, status } = req.query;
    const filter = { farmerId: req.user._id };

    if (listingId) filter.listingId = listingId;
    if (status && status !== 'All') filter.status = status;

    const offers = await Offer.find(filter)
      .populate('buyerId', 'name location verificationStatus phone businessDetails profileImage')
      .populate('listingId', 'cropName variety askingPrice priceUnit availableQuantity quantityUnit location')
      .sort({ createdAt: -1 });

    // Format and rank offers with net earnings calculation
    const analyzed = compareOffers(offers);

    res.status(200).json({
      success: true,
      count: offers.length,
      offers: analyzed,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get offers sent by buyer
// @route GET /api/offers/sent
exports.getSentOffers = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { buyerId: req.user._id };

    if (status && status !== 'All') filter.status = status;

    const offers = await Offer.find(filter)
      .populate('farmerId', 'name location verificationStatus phone farmDetails')
      .populate('listingId', 'cropName variety askingPrice priceUnit availableQuantity quantityUnit location images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: offers.length,
      offers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single offer detail
// @route GET /api/offers/:id
exports.getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('buyerId', 'name location verificationStatus phone businessDetails profileImage')
      .populate('farmerId', 'name location verificationStatus phone farmDetails profileImage')
      .populate('listingId')
      .populate('counterOfferHistory.senderId', 'name role');

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    // Verify participant authorization
    const isFarmer = offer.farmerId._id.toString() === req.user._id.toString();
    const isBuyer = offer.buyerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFarmer && !isBuyer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this offer.' });
    }

    res.status(200).json({ success: true, offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Submit counter-offer (Farmer or Buyer)
// @route PATCH /api/offers/:id/counter
exports.counterOffer = async (req, res) => {
  try {
    const { counterPrice, requestedQuantity, message } = req.body;
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    const isFarmer = offer.farmerId.toString() === req.user._id.toString();
    const isBuyer = offer.buyerId.toString() === req.user._id.toString();

    if (!isFarmer && !isBuyer) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (offer.status !== 'pending' && offer.status !== 'counter-offered') {
      return res.status(400).json({
        success: false,
        message: `Cannot counter an offer that is already ${offer.status}.`,
      });
    }

    const newPrice = Number(counterPrice) || offer.offeredPrice;
    const newQty = Number(requestedQuantity) || offer.requestedQuantity;

    // Recalculate gross and net
    const gross = calculateGrossSaleValue(newPrice, offer.priceUnit, newQty, offer.quantityUnit);
    const { netEarnings } = calculateNetEarnings(gross, offer.estimatedExpenses);

    // Record in history
    offer.counterOfferHistory.push({
      senderId: req.user._id,
      offeredPrice: newPrice,
      requestedQuantity: newQty,
      message: message || '',
      createdAt: new Date(),
    });

    offer.offeredPrice = newPrice;
    offer.requestedQuantity = newQty;
    offer.grossOfferValue = gross;
    offer.estimatedNetEarnings = netEarnings;
    offer.status = 'counter-offered';
    await offer.save();

    // Notify other party
    const targetUserId = isFarmer ? offer.buyerId : offer.farmerId;
    await Notification.create({
      userId: targetUserId,
      type: 'offer_countered',
      title: 'Counter-Offer Received',
      message: `${req.user.name} submitted a counter-offer: ₹${newPrice}/${offer.priceUnit} for ${newQty} ${offer.quantityUnit}.`,
      relatedEntityType: 'Offer',
      relatedEntityId: offer._id,
    });

    res.status(200).json({
      success: true,
      message: 'Counter-offer submitted successfully.',
      offer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Accept offer & atomically reserve stock (Farmer only)
// @route PATCH /api/offers/:id/accept
exports.acceptOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    if (offer.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the listing farmer can accept this offer.',
      });
    }

    if (offer.status !== 'pending' && offer.status !== 'counter-offered') {
      return res.status(400).json({
        success: false,
        message: `This offer is already marked as ${offer.status}.`,
      });
    }

    const listing = await CropListing.findById(offer.listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Associated crop listing not found.' });
    }

    // Convert requested quantity and available quantity to kg to compare safe stock
    const requestedKg = convertToKg(offer.requestedQuantity, offer.quantityUnit);
    const availableKg = convertToKg(listing.availableQuantity, listing.quantityUnit);

    if (requestedKg > availableKg) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock! Requested: ${offer.requestedQuantity} ${offer.quantityUnit}, but only ${listing.availableQuantity} ${listing.quantityUnit} remain available.`,
      });
    }

    // Safe stock reservation: deduct from available, add to reserved
    const remainingKg = availableKg - requestedKg;
    const reservedKg = convertToKg(listing.reservedQuantity || 0, listing.quantityUnit) + requestedKg;

    listing.availableQuantity = convertFromKg(remainingKg, listing.quantityUnit);
    listing.reservedQuantity = convertFromKg(reservedKg, listing.quantityUnit);

    if (listing.availableQuantity <= 0) {
      listing.status = 'reserved';
    }
    await listing.save();

    // Mark offer as accepted
    offer.status = 'accepted';
    await offer.save();

    // Generate Sale record
    const saleRef = generateSaleReference();
    const sale = await Sale.create({
      saleReference: saleRef,
      offerId: offer._id,
      listingId: listing._id,
      farmerId: offer.farmerId,
      buyerId: offer.buyerId,
      agreedPrice: offer.offeredPrice,
      priceUnit: offer.priceUnit,
      agreedQuantity: offer.requestedQuantity,
      quantityUnit: offer.quantityUnit,
      grossSaleValue: offer.grossOfferValue,
      estimatedExpenses: {
        ...offer.estimatedExpenses,
        total:
          (offer.estimatedExpenses?.transportation || 0) +
          (offer.estimatedExpenses?.packaging || 0) +
          (offer.estimatedExpenses?.loading || 0) +
          (offer.estimatedExpenses?.platformFees || 0) +
          (offer.estimatedExpenses?.otherExpenses || 0),
      },
      actualExpenses: {
        transportation: 0,
        packaging: 0,
        loading: 0,
        platformFees: 0,
        otherExpenses: 0,
        total: 0,
        isFinalized: false,
      },
      netEarningsEstimate: offer.estimatedNetEarnings,
      pickupLocation: {
        state: listing.location.state,
        district: listing.location.district,
        villageLocation: listing.location.villageLocation,
        address: listing.location.villageLocation || listing.location.district,
      },
      deliveryStatus: 'Awaiting Pickup',
      paymentStatus: 'Pending',
      saleStatus: 'Active',
      statusHistory: [
        {
          status: 'Offer Accepted & Order Created',
          updatedBy: req.user._id,
          timestamp: new Date(),
          notes: `Offer accepted by farmer for ${offer.requestedQuantity} ${offer.quantityUnit} at ₹${offer.offeredPrice}/${offer.priceUnit}.`,
        },
      ],
    });

    // Notify buyer
    await Notification.create({
      userId: offer.buyerId,
      type: 'offer_accepted',
      title: 'Congratulations! Your Offer Was Accepted',
      message: `Farmer accepted your offer for ${listing.cropName}. Order Reference: ${saleRef}.`,
      relatedEntityType: 'Sale',
      relatedEntityId: sale._id,
    });

    res.status(200).json({
      success: true,
      message: 'Offer accepted, stock reserved, and sale order created successfully.',
      offer,
      sale,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Reject offer (Farmer only)
// @route PATCH /api/offers/:id/reject
exports.rejectOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    if (offer.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    offer.status = 'rejected';
    await offer.save();

    await Notification.create({
      userId: offer.buyerId,
      type: 'offer_rejected',
      title: 'Offer Declined',
      message: `Your offer of ₹${offer.offeredPrice}/${offer.priceUnit} was declined by the farmer.`,
      relatedEntityType: 'Offer',
      relatedEntityId: offer._id,
    });

    res.status(200).json({
      success: true,
      message: 'Offer declined.',
      offer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Withdraw offer (Buyer only)
// @route PATCH /api/offers/:id/withdraw
exports.withdrawOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    if (offer.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (offer.status !== 'pending' && offer.status !== 'counter-offered') {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw an offer that is already ${offer.status}.`,
      });
    }

    offer.status = 'withdrawn';
    await offer.save();

    res.status(200).json({
      success: true,
      message: 'Offer withdrawn successfully.',
      offer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Buyer accepts a farmer counter-offer, creates sale order
// @route PATCH /api/offers/:id/accept-counter
// @access Buyer only
exports.acceptCounterOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('listingId');

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    if (offer.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the buyer who made this offer can accept the counter.' });
    }

    if (offer.status !== 'counter-offered') {
      return res.status(400).json({
        success: false,
        message: `This offer is currently "${offer.status}". You can only accept a counter-offer when status is counter-offered.`,
      });
    }

    const listing = await CropListing.findById(offer.listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Associated crop listing not found.' });
    }

    // Stock check
    const requestedKg = convertToKg(offer.requestedQuantity, offer.quantityUnit);
    const availableKg = convertToKg(listing.availableQuantity, listing.quantityUnit);

    if (requestedKg > availableKg) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Requested ${offer.requestedQuantity} ${offer.quantityUnit} but only ${listing.availableQuantity} ${listing.quantityUnit} remain.`,
      });
    }

    // Atomically reserve stock
    const remainingKg = availableKg - requestedKg;
    const reservedKg = convertToKg(listing.reservedQuantity || 0, listing.quantityUnit) + requestedKg;
    listing.availableQuantity = convertFromKg(remainingKg, listing.quantityUnit);
    listing.reservedQuantity = convertFromKg(reservedKg, listing.quantityUnit);
    if (listing.availableQuantity <= 0) listing.status = 'reserved';
    await listing.save();

    // Mark offer accepted
    offer.status = 'accepted';
    await offer.save();

    // Create Sale record
    const saleRef = generateSaleReference();
    const sale = await Sale.create({
      saleReference: saleRef,
      offerId: offer._id,
      listingId: listing._id,
      farmerId: offer.farmerId,
      buyerId: offer.buyerId,
      agreedPrice: offer.offeredPrice,
      priceUnit: offer.priceUnit,
      agreedQuantity: offer.requestedQuantity,
      quantityUnit: offer.quantityUnit,
      grossSaleValue: offer.grossOfferValue,
      estimatedExpenses: {
        ...offer.estimatedExpenses,
        total:
          (offer.estimatedExpenses?.transportation || 0) +
          (offer.estimatedExpenses?.packaging || 0) +
          (offer.estimatedExpenses?.loading || 0) +
          (offer.estimatedExpenses?.platformFees || 0) +
          (offer.estimatedExpenses?.otherExpenses || 0),
      },
      actualExpenses: { transportation: 0, packaging: 0, loading: 0, platformFees: 0, otherExpenses: 0, total: 0, isFinalized: false },
      netEarningsEstimate: offer.estimatedNetEarnings,
      pickupLocation: {
        state: listing.location.state,
        district: listing.location.district,
        villageLocation: listing.location.villageLocation,
        address: listing.location.villageLocation || listing.location.district,
      },
      deliveryStatus: 'Awaiting Pickup',
      paymentStatus: 'Pending',
      saleStatus: 'Active',
      statusHistory: [
        {
          status: 'Counter-Offer Accepted by Buyer',
          updatedBy: req.user._id,
          timestamp: new Date(),
          notes: `Buyer accepted the farmer counter-offer for ${offer.requestedQuantity} ${offer.quantityUnit} at Rs.${offer.offeredPrice}/${offer.priceUnit}.`,
        },
      ],
    });

    // Notify farmer
    await Notification.create({
      userId: offer.farmerId,
      type: 'offer_accepted',
      title: 'Buyer Accepted Your Counter-Offer!',
      message: `${req.user.name} accepted your counter-offer for ${listing.cropName}. Order Reference: ${saleRef}.`,
      relatedEntityType: 'Sale',
      relatedEntityId: sale._id,
    });

    res.status(200).json({
      success: true,
      message: 'Counter-offer accepted. Sale order created and stock reserved.',
      offer,
      sale,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
