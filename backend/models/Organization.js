const mongoose = require('mongoose');

// This is the blueprint for our Organization data
const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // A name is mandatory
    unique: true    // Each organization must have a unique name
  },
  organizationCode: {
    type: String,
    required: true,
    unique: true
  },
  superManager: {
    type: mongoose.Schema.Types.ObjectId, // This will be a link to a User document
    ref: 'User' // The 'ref' tells Mongoose which model to link to
  },
  // Timestamps will automatically add 'createdAt' and 'updatedAt' fields
}, { timestamps: true });

// We then export the model so our controllers can use it
module.exports = mongoose.model('Organization', OrganizationSchema);