const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 
      `mongodb://${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '27017'}/${process.env.DB_NAME || 'support_tickets'}`;

    
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('\n⚠️  Make sure MongoDB is running!');
    console.error('   - Local: Start MongoDB service');
    console.error('   - Cloud: Check your MONGODB_URI in .env file');
    process.exit(1);
  }
};

module.exports = connectDB;

