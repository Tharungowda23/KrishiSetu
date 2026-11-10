require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

const User = require('../models/User');
const CropListing = require('../models/CropListing');
const Offer = require('../models/Offer');
const Sale = require('../models/Sale');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const SupportTicket = require('../models/SupportTicket');

const seedData = async (exitOnComplete = true) => {
  try {
    if (mongoose.connection.readyState === 0) {
      console.log('[KrishiSetu Seed] Initializing database connection...');
      await connectDB();
    }

    console.log('[KrishiSetu Seed] Cleaning existing demo collections...');
    await Promise.all([
      User.deleteMany({}),
      CropListing.deleteMany({}),
      Offer.deleteMany({}),
      Sale.deleteMany({}),
      Notification.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      SupportTicket.deleteMany({}),
    ]);

    console.log('[KrishiSetu Seed] Seeding Users (Farmers, Buyers, Admin)...');

    // 1. Admin
    const admin = await User.create({
      name: 'KrishiSetu System Admin',
      email: 'admin@krishisetu.com',
      password: 'adminpass123',
      role: 'admin',
      phone: '+91 98450 11000',
      location: {
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        cityVillage: 'MG Road, Bengaluru',
        pincode: '560001',
      },
      verificationStatus: 'verified',
    });

    // 2. Farmers
    const farmer1 = await User.create({
      name: 'Ramesh Gowda',
      email: 'farmer@krishisetu.com', // Primary demo farmer
      password: 'password123',
      role: 'farmer',
      phone: '+91 94481 22345',
      location: {
        state: 'Karnataka',
        district: 'Mandya',
        cityVillage: 'Maddur Taluk',
        address: 'Gowda Farm, Maddur-Malavalli Road',
        pincode: '571428',
      },
      profileImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      farmDetails: {
        farmName: 'Cauvery Green Acres',
        totalLandAcres: 6.5,
        produceCategories: ['Vegetables', 'Commercial Crops'],
        description: 'Cultivating premium tomatoes, sugarcane, and native vegetables with drip irrigation and organic soil amendments.',
      },
      verificationStatus: 'verified',
    });

    const farmer2 = await User.create({
      name: 'Basavaraj Patil',
      email: 'basavaraj@krishisetu.com',
      password: 'password123',
      role: 'farmer',
      phone: '+91 98860 33456',
      location: {
        state: 'Karnataka',
        district: 'Hassan',
        cityVillage: 'Channarayapatna',
        address: 'Near Hemavathi Reservoir Road',
        pincode: '573116',
      },
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      farmDetails: {
        farmName: 'Hemavathi Organic Valley',
        totalLandAcres: 12.0,
        produceCategories: ['Vegetables', 'Grains & Cereals'],
        description: 'Specializing in high-starch table potatoes, maize, and ragi grown through GAP standard practices.',
      },
      verificationStatus: 'verified',
    });

    const farmer3 = await User.create({
      name: 'Suresh Kumar Reddy',
      email: 'suresh@krishisetu.com',
      password: 'password123',
      role: 'farmer',
      phone: '+91 97412 88776',
      location: {
        state: 'Karnataka',
        district: 'Kolar',
        cityVillage: 'Srinivaspur',
        address: 'Reddy Mango & Veg Estate',
        pincode: '563135',
      },
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      farmDetails: {
        farmName: 'Srinivaspur Sunshine Farms',
        totalLandAcres: 8.0,
        produceCategories: ['Vegetables', 'Fruits', 'Spices'],
        description: 'Quality red onions, Byadgi chilli, and seasonal vegetables.',
      },
      verificationStatus: 'verified',
    });

    // 3. Buyers
    const buyer1 = await User.create({
      name: 'Vikram Joshi (Bengaluru FreshMart)',
      email: 'buyer@krishisetu.com', // Primary demo buyer
      password: 'password123',
      role: 'buyer',
      phone: '+91 98200 44556',
      location: {
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        cityVillage: 'Yeshwanthpur Wholesale Market',
        address: 'Plot 44, APMC Yard, Yeshwanthpur, Bengaluru',
        pincode: '560022',
      },
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      businessDetails: {
        businessName: 'Bengaluru FreshMart Logistics',
        businessType: 'Wholesaler',
        preferredCategories: ['Vegetables', 'Fruits', 'Grains & Cereals'],
        gstNumber: '29ABCDE1234F1Z5',
        deliveryAddresses: [
          {
            label: 'Central Hub',
            address: 'APMC Yard, Yeshwanthpur',
            district: 'Bengaluru Urban',
            state: 'Karnataka',
            pincode: '560022',
          },
        ],
      },
      verificationStatus: 'verified',
    });

    const buyer2 = await User.create({
      name: 'Ananya Deshmukh (Kaveri Agro Processing)',
      email: 'ananya@kaveriagro.com',
      password: 'password123',
      role: 'buyer',
      phone: '+91 98440 66789',
      location: {
        state: 'Karnataka',
        district: 'Mysuru',
        cityVillage: 'Hebbal Industrial Area',
        address: 'Plot 18, Industrial Estate, Mysuru',
        pincode: '570016',
      },
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      businessDetails: {
        businessName: 'Kaveri Agro Processing Ltd',
        businessType: 'Food Processor',
        preferredCategories: ['Vegetables', 'Grains & Cereals', 'Pulses'],
        gstNumber: '29XYZDE5678G2Z1',
      },
      verificationStatus: 'verified',
    });

    console.log('[KrishiSetu Seed] Seeding Crop Listings with rich agricultural data...');

    // Crop Listings
    const listingTomato = await CropListing.create({
      farmerId: farmer1._id,
      cropName: 'Tomato (Hybrid Shivam)',
      category: 'Vegetables',
      variety: 'Shivam Round Red',
      description: 'Firm, glossy, grade-A harvest tomatoes ideal for wholesale shipping and retail displays. Grown using balanced drip fertigation.',
      qualityGrade: 'Grade A (Export / Premium)',
      askingPrice: 2400,
      priceUnit: 'quintal',
      originalQuantity: 50,
      availableQuantity: 40,
      reservedQuantity: 10,
      minimumOrderQuantity: 5,
      quantityUnit: 'quintal',
      location: {
        state: 'Karnataka',
        district: 'Mandya',
        villageLocation: 'Maddur APMC link road',
        pincode: '571428',
      },
      harvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      availableFrom: new Date(),
      deliveryPreferences: {
        pickupAvailable: true,
        deliveryAvailable: true,
        notes: 'Buyer pickup welcomed; can arrange local canter upon agreement.',
      },
      images: [
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1546470427-227c7369a9b2?w=800&auto=format&fit=crop&q=80',
      ],
      isFeatured: true,
      status: 'active',
    });

    const listingPotato = await CropListing.create({
      farmerId: farmer2._id,
      cropName: 'Potato (Kufri Jyoti)',
      category: 'Vegetables',
      variety: 'Kufri Jyoti Medium Oval',
      description: 'High starch, uniform medium-large size potatoes. Cured skin with zero greening, freshly graded from Hassan red loamy soil.',
      qualityGrade: 'Grade A (Export / Premium)',
      askingPrice: 2100,
      priceUnit: 'quintal',
      originalQuantity: 120,
      availableQuantity: 120,
      reservedQuantity: 0,
      minimumOrderQuantity: 10,
      quantityUnit: 'quintal',
      location: {
        state: 'Karnataka',
        district: 'Hassan',
        villageLocation: 'Channarayapatna Rural',
        pincode: '573116',
      },
      harvestDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      availableFrom: new Date(),
      deliveryPreferences: {
        pickupAvailable: true,
        deliveryAvailable: false,
        notes: 'Farm gate collection preferred. Gunny bags packing ready.',
      },
      images: [
        'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=800&auto=format&fit=crop&q=80',
      ],
      isFeatured: true,
      status: 'active',
    });

    const listingOnion = await CropListing.create({
      farmerId: farmer3._id,
      cropName: 'Red Onion (Bellary Medium)',
      category: 'Vegetables',
      variety: 'Nashik / Bellary Medium Globe',
      description: 'Sun-cured dry red onions with tight neck and intact papery skins. Excellent shelf life of 60+ days in ventilated transport.',
      qualityGrade: 'Grade B (Standard Market)',
      askingPrice: 3100,
      priceUnit: 'quintal',
      originalQuantity: 80,
      availableQuantity: 80,
      reservedQuantity: 0,
      minimumOrderQuantity: 10,
      quantityUnit: 'quintal',
      location: {
        state: 'Karnataka',
        district: 'Kolar',
        villageLocation: 'Srinivaspur Mandi Road',
        pincode: '563135',
      },
      harvestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      availableFrom: new Date(),
      deliveryPreferences: {
        pickupAvailable: true,
        deliveryAvailable: true,
        notes: 'Packed in standard 45kg mesh leno bags.',
      },
      images: [
        'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80',
      ],
      isFeatured: true,
      status: 'active',
    });

    const listingRice = await CropListing.create({
      farmerId: farmer1._id,
      cropName: 'Paddy (Sona Masoori Raw)',
      category: 'Grains & Cereals',
      variety: 'Sona Masoori BPT 5204',
      description: 'Traditional aromatic Karnataka rice paddy, harvested with 13.5% optimal milling moisture. Free from stones and foreign chaff.',
      qualityGrade: 'Grade A (Export / Premium)',
      askingPrice: 2850,
      priceUnit: 'quintal',
      originalQuantity: 150,
      availableQuantity: 150,
      reservedQuantity: 0,
      minimumOrderQuantity: 20,
      quantityUnit: 'quintal',
      location: {
        state: 'Karnataka',
        district: 'Mandya',
        villageLocation: 'Srirangapatna Canal Basin',
        pincode: '571438',
      },
      harvestDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      availableFrom: new Date(),
      deliveryPreferences: {
        pickupAvailable: true,
        deliveryAvailable: true,
      },
      images: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&auto=format&fit=crop&q=80',
      ],
      isFeatured: true,
      status: 'active',
    });

    const listingChilli = await CropListing.create({
      farmerId: farmer3._id,
      cropName: 'Dry Red Chilli (Byadgi Dabba)',
      category: 'Spices',
      variety: 'Byadgi Deep Red',
      description: 'Famous GI variety renowned for vibrant red colour, mild pungency, and aromatic deep skin wrinkles. Sun-dried on cement threshing yards.',
      qualityGrade: 'Grade A (Export / Premium)',
      askingPrice: 21500,
      priceUnit: 'quintal',
      originalQuantity: 25,
      availableQuantity: 25,
      reservedQuantity: 0,
      minimumOrderQuantity: 2,
      quantityUnit: 'quintal',
      location: {
        state: 'Karnataka',
        district: 'Kolar',
        villageLocation: 'Malur',
        pincode: '563130',
      },
      harvestDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      availableFrom: new Date(),
      deliveryPreferences: {
        pickupAvailable: true,
        deliveryAvailable: true,
      },
      images: [
        'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80',
      ],
      isFeatured: false,
      status: 'active',
    });

    const listingRagi = await CropListing.create({
      farmerId: farmer2._id,
      cropName: 'Finger Millet (Ragi - GPU 28)',
      category: 'Grains & Cereals',
      variety: 'GPU 28 Nutrient Dense',
      description: 'Organic rain-fed Karnataka ragi grains rich in calcium and dietary fiber. Thoroughly cleaned and winnowed.',
      qualityGrade: 'Organic Certified',
      askingPrice: 3800,
      priceUnit: 'quintal',
      originalQuantity: 60,
      availableQuantity: 60,
      reservedQuantity: 0,
      minimumOrderQuantity: 5,
      quantityUnit: 'quintal',
      location: {
        state: 'Karnataka',
        district: 'Hassan',
        villageLocation: 'Belur Road',
        pincode: '573115',
      },
      harvestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      availableFrom: new Date(),
      deliveryPreferences: {
        pickupAvailable: true,
        deliveryAvailable: false,
      },
      images: [
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
      ],
      isFeatured: false,
      status: 'active',
    });

    console.log('[KrishiSetu Seed] Creating Offers including the prompt core comparison example...');

    const offerBuyerA = await Offer.create({
      listingId: listingTomato._id,
      farmerId: farmer1._id,
      buyerId: buyer1._id,
      offeredPrice: 2500,
      priceUnit: 'quintal',
      requestedQuantity: 10,
      quantityUnit: 'quintal',
      grossOfferValue: 25000,
      estimatedExpenses: {
        transportation: 2000, // Short distance pickup to Bengaluru hub
        packaging: 0,
        loading: 0,
        platformFees: 0,
        otherExpenses: 0,
        notes: 'Transporter hired on Bengaluru-Maddur expressway route',
        isEstimated: true,
      },
      estimatedNetEarnings: 23000,
      paymentTerms: 'Payment on Pickup / Delivery',
      deliveryPreference: 'Buyer Arranges Pickup',
      proposedPickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'pending',
      message: 'Hello Rameshji, we can collect 10 quintals this Wednesday morning directly at your farm gate.',
    });

    const offerBuyerB = await Offer.create({
      listingId: listingTomato._id,
      farmerId: farmer1._id,
      buyerId: buyer2._id,
      offeredPrice: 2700,
      priceUnit: 'quintal',
      requestedQuantity: 10,
      quantityUnit: 'quintal',
      grossOfferValue: 27000,
      estimatedExpenses: {
        transportation: 5000, // Dedicated long distance haul to processing unit
        packaging: 0,
        loading: 0,
        platformFees: 0,
        otherExpenses: 0,
        notes: 'Long haul freight to distant processing unit',
        isEstimated: true,
      },
      estimatedNetEarnings: 22000,
      paymentTerms: 'Net 7 Days',
      deliveryPreference: 'Farmer Organizes Transport',
      proposedPickupDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'pending',
      message: 'Offering ₹2,700/quintal for processing grade Shivam tomatoes delivered to our facility.',
    });

    const acceptedOffer = await Offer.create({
      listingId: listingTomato._id,
      farmerId: farmer1._id,
      buyerId: buyer1._id,
      offeredPrice: 2450,
      priceUnit: 'quintal',
      requestedQuantity: 10,
      quantityUnit: 'quintal',
      grossOfferValue: 24500,
      estimatedExpenses: {
        transportation: 1800,
        packaging: 300,
        loading: 200,
        platformFees: 0,
        otherExpenses: 0,
        total: 2300,
        isEstimated: true,
      },
      estimatedNetEarnings: 22200,
      paymentTerms: 'Payment on Pickup / Delivery',
      deliveryPreference: 'Buyer Arranges Pickup',
      status: 'accepted',
      message: 'Previous confirmed batch for early morning mandi stock.',
    });

    console.log('[KrishiSetu Seed] Creating active Sale order record with timeline...');

    const demoSale = await Sale.create({
      saleReference: 'KS-SALE-2026-8812',
      offerId: acceptedOffer._id,
      listingId: listingTomato._id,
      farmerId: farmer1._id,
      buyerId: buyer1._id,
      agreedPrice: 2450,
      priceUnit: 'quintal',
      agreedQuantity: 10,
      quantityUnit: 'quintal',
      grossSaleValue: 24500,
      estimatedExpenses: {
        transportation: 1800,
        packaging: 300,
        loading: 200,
        platformFees: 0,
        otherExpenses: 0,
        total: 2300,
      },
      actualExpenses: {
        transportation: 1750,
        packaging: 300,
        loading: 200,
        platformFees: 0,
        otherExpenses: 0,
        total: 2250,
        isFinalized: true,
        updatedAt: new Date(),
      },
      netEarningsEstimate: 22200,
      actualNetEarnings: 22250,
      pickupLocation: {
        state: 'Karnataka',
        district: 'Mandya',
        villageLocation: 'Maddur APMC link road',
        address: 'Gowda Farm, Maddur-Malavalli Road, Mandya',
      },
      deliveryLocation: {
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        address: 'APMC Yard, Yeshwanthpur, Bengaluru',
      },
      transportDetails: {
        carrierName: 'Kaveri Roadways Logistics',
        vehicleNumber: 'KA-11-B-8421',
        driverPhone: '+91 94481 99882',
        pickupDate: new Date(),
        trackingNotes: 'Vehicle arrived at Maddur farm gate for loading.',
      },
      deliveryStatus: 'In Transit',
      paymentStatus: 'Advance Received',
      saleStatus: 'In Progress',
      statusHistory: [
        {
          status: 'Offer Accepted & Order Created',
          updatedBy: farmer1._id,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          notes: 'Offer accepted for 10 quintals at ₹2,450/quintal.',
        },
        {
          status: 'Pickup Scheduled',
          updatedBy: buyer1._id,
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          notes: 'Driver assigned with vehicle KA-11-B-8421.',
        },
        {
          status: 'Picked Up & In Transit',
          updatedBy: farmer1._id,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          notes: 'Produce weighed, inspected, and loaded successfully.',
        },
      ],
    });

    console.log('[KrishiSetu Seed] Creating conversations and notifications...');

    const conversation = await Conversation.create({
      participantIds: [farmer1._id, buyer1._id],
      listingId: listingTomato._id,
      saleId: demoSale._id,
      lastMessageText: 'Driver has departed Maddur farm gate with 10 quintals crate payload.',
      lastMessageAt: new Date(),
    });

    await Message.create({
      conversationId: conversation._id,
      senderId: buyer1._id,
      text: 'Namaskara Rameshji, will the produce crates be ready by 7:00 AM tomorrow?',
      readBy: [buyer1._id, farmer1._id],
    });

    await Message.create({
      conversationId: conversation._id,
      senderId: farmer1._id,
      text: 'Yes Vikramji, our laborers will pack and stack all 10 quintals by 6:30 AM.',
      readBy: [farmer1._id, buyer1._id],
    });

    await Message.create({
      conversationId: conversation._id,
      senderId: farmer1._id,
      text: 'Driver has departed Maddur farm gate with 10 quintals crate payload.',
      readBy: [farmer1._id],
    });

    await Notification.create({
      userId: farmer1._id,
      type: 'offer_received',
      title: 'Compare 2 New Buyer Offers!',
      message: 'You have received 2 competitive offers for your Tomato listing. Check Net Earnings Comparison to see which leaves you with higher profits.',
      relatedEntityType: 'Listing',
      relatedEntityId: listingTomato._id,
    });

    await Notification.create({
      userId: farmer1._id,
      type: 'sale_update',
      title: 'Buyer Scheduled Farmgate Pickup',
      message: `Buyer Bangalore Wholesale Mart scheduled vehicle pickup for Sale Order ${demoSale.saleReference}.`,
      relatedEntityType: 'Sale',
      relatedEntityId: demoSale._id,
    });

    await Notification.create({
      userId: farmer1._id,
      type: 'system',
      title: 'Mandi Price Trend Alert',
      message: 'Tomato hybrid prices in Kolar & Mandya markets increased by 8% this week. Consider adjusting your asking rates.',
      relatedEntityType: 'Listing',
      relatedEntityId: listingTomato._id,
    });

    await Notification.create({
      userId: buyer1._id,
      type: 'offer_accepted',
      title: 'Order Confirmed - Tomato Harvest',
      message: `Your offer for 10 quintals Tomato was accepted. Order Ref: ${demoSale.saleReference}.`,
      relatedEntityType: 'Sale',
      relatedEntityId: demoSale._id,
    });

    await Notification.create({
      userId: buyer1._id,
      type: 'sale_update',
      title: 'Order Status Update: In Transit',
      message: `Consignment for Order ${demoSale.saleReference} has departed from Mandya farmgate en route to Bangalore hub.`,
      relatedEntityType: 'Sale',
      relatedEntityId: demoSale._id,
    });

    await Notification.create({
      userId: buyer1._id,
      type: 'offer_countered',
      title: 'Farmer Submitted Counter-Offer',
      message: 'Farmer Ramesh Gowda proposed a counter-rate of ₹2,700/quintal for your purchase request.',
      relatedEntityType: 'Offer',
      relatedEntityId: offerBuyerB._id,
    });

    await Notification.create({
      userId: admin._id,
      type: 'system',
      title: 'New Account Pending Verification',
      message: 'Farmer Suresh Patel from Hassan uploaded land RTC records requesting Verified Farmer badge.',
      relatedEntityType: 'User',
      relatedEntityId: farmer2._id,
    });

    await Notification.create({
      userId: admin._id,
      type: 'sale_update',
      title: 'High-Value Sale Finalized',
      message: `Transaction ${demoSale.saleReference} between Ramesh Gowda and Bangalore Wholesale Mart reached In Transit stage (₹25,000 value).`,
      relatedEntityType: 'Sale',
      relatedEntityId: demoSale._id,
    });

    await Notification.create({
      userId: admin._id,
      type: 'system',
      title: 'Support Ticket Received',
      message: 'New support ticket regarding Tumakuru freight charges submitted by Nagaraju K.',
      relatedEntityType: 'None',
    });

    await SupportTicket.create({
      name: 'Nagaraju K',
      email: 'nagaraju@farmconnect.org',
      phone: '+91 94801 55667',
      userRole: 'farmer',
      category: 'Transport & Delivery',
      subject: 'Assistance estimating freight for Tumakuru coconut transport',
      message: 'Looking to understand per-kilometre charges when booking heavy multi-axle trucks for tender coconut transport to Bengaluru.',
      status: 'open',
    });

    console.log('===============================================================');
    console.log('✅ KrishiSetu Database Seeded Successfully!');
    console.log('Demo Credentials:');
    console.log('  👨‍🌾 Farmer: farmer@krishisetu.com  |  password: password123');
    console.log('  🛒 Buyer:  buyer@krishisetu.com   |  password: password123');
    console.log('  🛡️ Admin:  admin@krishisetu.com   |  password: adminpass123');
    console.log('===============================================================');

    if (exitOnComplete) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[KrishiSetu Seed Error]:', error);
    if (exitOnComplete) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = seedData;
