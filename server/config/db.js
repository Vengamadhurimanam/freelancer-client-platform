const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] Failed to connect to database: ${error.message}`);
    console.error(`Ensure MONGODB_URI in Render environment variables is a valid MongoDB Atlas URI and Atlas Network Access includes 0.0.0.0/0`);
  }
};

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB Runtime Error]: ${err.message}`);
});

module.exports = connectDB;
