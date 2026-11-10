const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  // If already connected, reuse existing connection to prevent multiple instances
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krishisetu';
  const forceMemory = process.env.USE_MEMORY_DB === 'true';

  if (!forceMemory) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`[KrishiSetu] MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[KrishiSetu] Standard MongoDB connection failed (${err.message}). Falling back to MongoMemoryServer for development...`);
    }
  }

  try {
    // Avoid starting multiple MongoMemoryServer instances
    if (!memoryServer) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
    }
    const memUri = memoryServer.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`[KrishiSetu] MongoMemoryServer started and connected successfully at: ${memUri}`);
    return conn;
  } catch (error) {
    console.error(`[KrishiSetu] Fatal database connection error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
  } catch (err) {
    console.warn('[KrishiSetu] Database disconnect warning:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
