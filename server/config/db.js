const mongoose = require('mongoose');

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge';
  isConnecting = true;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    isConnecting = false;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    isConnecting = false;
    console.error(`[MongoDB Error] Failed to connect: ${error.message}`);
    console.error(`Please configure MONGODB_URI in Render Environment variables with your MongoDB Atlas connection string (and set Network Access to 0.0.0.0/0).`);
    
    // Auto-retry connection every 10 seconds in background
    setTimeout(connectDB, 10000);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected. Attempting to reconnect...');
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB Runtime Error]: ${err.message}`);
});

module.exports = connectDB;

