const mongoose = require('mongoose');

const PartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a partner name'],
    unique: true,
    trim: true,
  },
  contactPerson: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  partnershipType: {
    type: String,
    enum: ['Media', 'Technology', 'Community', 'Logistics'],
    required: true,
  },
  benefits: {
    type: String,
    required: true,
  },
  // The main organizer who added this partner record
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organizer',
    required: true
  },
  // The specific EVENT this partner is associated with
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event', // <-- CORRECTED REFERENCE
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Rejected'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Partner', PartnerSchema);