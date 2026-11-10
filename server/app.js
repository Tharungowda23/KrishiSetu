const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const listingRoutes = require('./routes/listingRoutes');
const offerRoutes = require('./routes/offerRoutes');
const saleRoutes = require('./routes/saleRoutes');
const transportRoutes = require('./routes/transportRoutes');
const messagingRoutes = require('./routes/messagingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const savedListingRoutes = require('./routes/savedListingRoutes');
const supportRoutes = require('./routes/supportRoutes');
const adminRoutes = require('./routes/adminRoutes');

const { protect, authorize } = require('./middleware/auth');
const { getFarmerListings } = require('./controllers/listingController');

const app = express();

// Middleware
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman) or matching origin
      if (!origin || origin === allowedOrigin || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Dev flexible
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'KrishiSetu API',
    tagline: 'Connect. Compare. Sell Smarter.',
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.get('/api/farmer/listings', protect, authorize('farmer'), getFarmerListings);
app.use('/api/offers', offerRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/conversations', messagingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/saved-listings', savedListingRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on KrishiSetu API.`,
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[KrishiSetu Server Error]:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error occurred.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

module.exports = app;
