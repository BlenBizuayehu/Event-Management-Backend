const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
  },
  category: {
    type: String,
    trim: true,
  },
  // Array of strings to store the URLs of uploaded images
  images: {
    type: [String],
    default: [],
  },
  // Link to the Exhibitor who owns this product
  exhibitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exhibitor',
    required: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', ProductSchema);