require('dotenv').config();
const mongoose = require('mongoose');
require('node:dns/promises').setServers(['1.1.1.1', '8.8.8.8']);

const connectDB = async () => {
  if (mongoose.connection.readyState !== 0) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      tlsAllowInvalidCertificates: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
