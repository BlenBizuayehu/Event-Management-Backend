const mongoose = require('mongoose');

const FloorSchema = new mongoose.Schema({
  floorNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a floor name (e.g., "Main Hall", "Level 2")'],
    trim: true
  },
  layoutImageUrl: {
    type: String,
    required: [true, 'Please provide a URL for the layout image'],
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Floor', FloorSchema);