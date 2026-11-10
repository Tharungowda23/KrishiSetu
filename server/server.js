require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const User = require('./models/User');
const seedData = require('./scripts/seed');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Connect to MongoDB (MongoDB initialization before listening)
    await connectDB();

    // 2. Check if database is empty and auto-seed demo records before listening
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[KrishiSetu] Empty database detected. Auto-seeding initial demo data...');
        await seedData(false);
      }
    } catch (seedErr) {
      console.warn('[KrishiSetu] Auto-seed warning:', seedErr.message);
    }

    // 3. Start Express server (single listen call)
    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🌾 KrishiSetu Backend Server running on port ${PORT}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}`);
      console.log(`💡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });

    // 4. Proper error handling for EADDRINUSE and server-level errors
    server.on('error', async (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ [KrishiSetu Server Error]: Port ${PORT} is already in use by another process.`);
        console.error(`👉 Solutions:`);
        console.error(`   1. Terminate the process currently using port ${PORT}`);
        console.error(`   2. Or run with a different port: PORT=5001 npm start\n`);
      } else {
        console.error(`❌ [KrishiSetu Server Error]: ${err.message}`);
      }
      await disconnectDB();
      process.exit(1);
    });

    // 5. Graceful shutdown handlers
    const shutdown = async (signal) => {
      console.log(`\n[KrishiSetu] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[KrishiSetu] Server closed and database disconnected.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    process.on('unhandledRejection', async (err) => {
      console.error(`[KrishiSetu] Unhandled Rejection: ${err.message}`);
      server.close(async () => {
        await disconnectDB();
        process.exit(1);
      });
    });
  } catch (err) {
    console.error(`[KrishiSetu] Fatal startup error: ${err.message}`);
    await disconnectDB();
    process.exit(1);
  }
}

startServer();
