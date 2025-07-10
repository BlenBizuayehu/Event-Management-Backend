const mongoose=require("mongoose");

const SponsorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a sponsor name'],
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
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  contributionAmount: {
    type: Number,
    required: true,
  },
  benefits: {
    type: String,
    required: true,
  },
  sponsorshipLevel: {
    type: String,
    enum: ['Platinum', 'Gold', 'Silver', 'Bronze'],
    required: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organizer',
    required: true
  },
  conferences: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conference'
  }],
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Rejected'],
    default: 'Pending'
  }
}, {
  timestamps: true
});