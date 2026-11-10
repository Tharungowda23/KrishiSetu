const CropListing = require('../models/CropListing');
const Offer = require('../models/Offer');
const User = require('../models/User');

// @desc Get all public listings with search, filter, sort & pagination
// @route GET /api/listings
exports.getListings = async (req, res) => {
  try {
    const {
      search,
      category,
      state,
      district,
      minPrice,
      maxPrice,
      minQuantity,
      maxQuantity,
      qualityGrade,
      verifiedOnly,
      sortBy = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const query = { status: 'active' };

    // Search keyword
    if (search && search.trim() !== '') {
      query.$or = [
        { cropName: { $regex: search.trim(), $options: 'i' } },
        { variety: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { 'location.district': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'All' && category !== '') {
      query.category = category;
    }

    // Location filters
    if (state && state.trim() !== '') {
      query['location.state'] = { $regex: state.trim(), $options: 'i' };
    }
    if (district && district.trim() !== '' && district !== 'All') {
      query['location.district'] = { $regex: district.trim(), $options: 'i' };
    }

    // Quality Grade filter
    if (qualityGrade && qualityGrade.trim() !== '' && qualityGrade !== 'All') {
      query.qualityGrade = qualityGrade;
    }

    // Price range
    if (minPrice || maxPrice) {
      query.askingPrice = {};
      if (minPrice) query.askingPrice.$gte = Number(minPrice);
      if (maxPrice) query.askingPrice.$lte = Number(maxPrice);
    }

    // Quantity range
    if (minQuantity || maxQuantity) {
      query.availableQuantity = {};
      if (minQuantity) query.availableQuantity.$gte = Number(minQuantity);
      if (maxQuantity) query.availableQuantity.$lte = Number(maxQuantity);
    }

    // Verified seller filter
    if (verifiedOnly === 'true') {
      const verifiedFarmers = await User.find({
        role: 'farmer',
        verificationStatus: 'verified',
      }).select('_id');
      const verifiedFarmerIds = verifiedFarmers.map((f) => f._id);
      query.farmerId = { $in: verifiedFarmerIds };
    }

    // Sorting
    let sort = {};
    if (sortBy === 'price-asc') sort = { askingPrice: 1 };
    else if (sortBy === 'price-desc') sort = { askingPrice: -1 };
    else if (sortBy === 'quantity-desc') sort = { availableQuantity: -1 };
    else sort = { createdAt: -1 }; // newest default

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * pageSize;

    const total = await CropListing.countDocuments(query);
    const listings = await CropListing.find(query)
      .populate('farmerId', 'name location verificationStatus phone farmDetails profileImage')
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      count: listings.length,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNum,
      listings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get featured / popular crops for home page
// @route GET /api/listings/featured
exports.getFeaturedListings = async (req, res) => {
  try {
    const featured = await CropListing.find({ status: 'active' })
      .populate('farmerId', 'name location verificationStatus')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      listings: featured,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single crop listing by ID
// @route GET /api/listings/:id
exports.getListingById = async (req, res) => {
  try {
    const listing = await CropListing.findById(req.params.id).populate(
      'farmerId',
      'name location verificationStatus phone farmDetails profileImage createdAt'
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Crop listing not found.',
      });
    }

    // Increment views safely
    listing.viewsCount += 1;
    await listing.save();

    res.status(200).json({
      success: true,
      listing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create new crop listing (Farmer only)
// @route POST /api/listings
exports.createListing = async (req, res) => {
  try {
    const {
      cropName,
      category,
      variety,
      description,
      qualityGrade,
      askingPrice,
      priceUnit,
      originalQuantity,
      quantityUnit,
      state,
      district,
      villageLocation,
      pincode,
      harvestDate,
      availableFrom,
      pickupAvailable,
      deliveryAvailable,
      notes,
      images,
    } = req.body;

    const parsedQty = Number(originalQuantity);
    const parsedPrice = Number(askingPrice);

    if (!cropName || !parsedPrice || !parsedQty || !district) {
      return res.status(400).json({
        success: false,
        message: 'Crop name, asking price, total quantity, and district are required.',
      });
    }

    // Images array: support uploaded files if any, or provided URLs
    let imageList = [];
    if (req.files && req.files.length > 0) {
      imageList = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (images && Array.isArray(images)) {
      imageList = images;
    } else if (images && typeof images === 'string') {
      imageList = [images];
    }

    const listing = await CropListing.create({
      farmerId: req.user._id,
      cropName,
      category: category || 'Vegetables',
      variety: variety || 'Standard Desi',
      description: description || '',
      qualityGrade: qualityGrade || 'Grade B (Standard Market)',
      askingPrice: parsedPrice,
      priceUnit: priceUnit || 'quintal',
      originalQuantity: parsedQty,
      availableQuantity: parsedQty,
      reservedQuantity: 0,
      minimumOrderQuantity: Number(req.body.minimumOrderQuantity) || 1,
      quantityUnit: quantityUnit || 'quintal',
      location: {
        state: state || req.user.location.state || 'Karnataka',
        district: district || req.user.location.district,
        villageLocation: villageLocation || req.user.location.cityVillage,
        pincode: pincode || req.user.location.pincode,
      },
      harvestDate: harvestDate ? new Date(harvestDate) : undefined,
      availableFrom: availableFrom ? new Date(availableFrom) : new Date(),
      deliveryPreferences: {
        pickupAvailable: pickupAvailable !== false,
        deliveryAvailable: deliveryAvailable === true || deliveryAvailable === 'true',
        notes: notes || '',
      },
      images: imageList,
      status: req.body.status === 'draft' ? 'draft' : 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Crop listing published successfully.',
      listing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update crop listing (Owner farmer or Admin)
// @route PATCH /api/listings/:id
exports.updateListing = async (req, res) => {
  try {
    const listing = await CropListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    // Authorization: only the owner farmer or an admin can edit
    if (listing.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this listing.',
      });
    }

    const updatableFields = [
      'cropName',
      'category',
      'variety',
      'description',
      'qualityGrade',
      'askingPrice',
      'priceUnit',
      'availableQuantity',
      'minimumOrderQuantity',
      'quantityUnit',
      'location',
      'harvestDate',
      'availableFrom',
      'deliveryPreferences',
      'status',
      'images',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully.',
      listing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete / archive listing (Owner farmer or Admin)
// @route DELETE /api/listings/:id
exports.deleteListing = async (req, res) => {
  try {
    const listing = await CropListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (listing.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this listing.',
      });
    }

    // Check if there are active offers or sales
    const hasActiveOffers = await Offer.findOne({
      listingId: listing._id,
      status: { $in: ['accepted', 'pending', 'counter-offered'] },
    });

    if (hasActiveOffers && listing.status !== 'draft') {
      // Inactive / pause instead of hard delete to preserve sales audit records
      listing.status = 'paused';
      await listing.save();
      return res.status(200).json({
        success: true,
        message: 'Listing paused and deactivated to preserve existing negotiations.',
      });
    }

    await CropListing.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Listing removed successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get farmer's own listings with offer counts
// @route GET /api/farmer/listings
exports.getFarmerListings = async (req, res) => {
  try {
    const listings = await CropListing.find({ farmerId: req.user._id }).sort({ createdAt: -1 });

    // Attach counts of received offers for each listing
    const listingsWithStats = await Promise.all(
      listings.map(async (listing) => {
        const offersCount = await Offer.countDocuments({ listingId: listing._id });
        const pendingOffersCount = await Offer.countDocuments({
          listingId: listing._id,
          status: 'pending',
        });
        return {
          ...listing.toObject(),
          offersCount,
          pendingOffersCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      listings: listingsWithStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
