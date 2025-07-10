const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a venue name'],
    trim: true,
    unique: true,
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'USA' },
  },
  geolocation: {
    latitude: Number,
    longitude: Number,
  },
  capacity: {
    type: Number,
  },
  contactEmail: {
    type: String,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  website: {
    type: String,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Venue', VenueSchema);