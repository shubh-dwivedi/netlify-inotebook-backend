const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function connectToMongo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

module.exports = connectToMongo;