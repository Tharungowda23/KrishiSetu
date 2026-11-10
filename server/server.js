require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const seedData = require('./scripts/seed');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
connectDB()
  .then(async () => {
    // Check if database is empty and auto-seed demo records
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[KrishiSetu] Empty database detected. Auto-seeding initial demo data...');
        await seedData(false);
      }
    } catch (seedErr) {
      console.warn('[KrishiSetu] Auto-seed warning:', seedErr.message);
    }

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🌾 KrishiSetu Backend Server running on port ${PORT}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}`);
      console.log(`💡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });

    // Graceful error handling
    process.on('unhandledRejection', (err) => {
      console.error(`[KrishiSetu] Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });
  })
  .catch((err) => {
    console.error(`[KrishiSetu] Fatal startup error: ${err.message}`);
    process.exit(1);
  });
