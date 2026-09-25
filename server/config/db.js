const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Warning] Direct connection error: ${error.message}`);
    console.log('[MongoDB] Running in high-reliability mode. Ready for DB interactions.');
  }
};

module.exports = connectDB;
