// This file handles the logic for connecting to our MongoDB database

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Make sure the environment variables from .env are available
dotenv.config();

const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB cluster using the connection string
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Connected...');
  } catch (err) {
    // If there's an error, log it and exit the process
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;