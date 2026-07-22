const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, 
    unique: true    
  },
  domain: {          // <-- ADD THIS
    type: String,
    required: true,
    unique: true
  },
  organizationCode: {
    type: String,
    required: true,
    unique: true
  },
  superManager: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Organization', OrganizationSchema);