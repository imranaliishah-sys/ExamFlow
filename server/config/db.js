
const mongoose = require('mongoose');

let connectionPromise = null;

const connectDB = async () => {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Check environment variable
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in environment variables');
  }

  try {
    // Reuse an ongoing connection attempt
    if (!connectionPromise) {
      connectionPromise = mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000
      });
    }

    await connectionPromise;

    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    return mongoose.connection;

  } catch (error) {
    connectionPromise = null;
    console.error('Database Connection Error:', error.message);
    throw error;
  }
};

module.exports = connectDB;
