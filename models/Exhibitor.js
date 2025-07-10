const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ExhibitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a company name'],
    trim: true
  },
  contactPerson: {
    type: String,
    required: [true, 'Please provide a contact person'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide a contact email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 8,
    select: false // Won't return password in queries
  },
  boothNumber: {
    type: String,
    required: [true, 'Please provide a booth number'],
    trim: true
  },
   event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Please provide an event ID']
  },
  socialMediaLink: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
ExhibitorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
ExhibitorSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for products
ExhibitorSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'exhibitor',
  justOne: false
});

module.exports = mongoose.model('Exhibitor', ExhibitorSchema);