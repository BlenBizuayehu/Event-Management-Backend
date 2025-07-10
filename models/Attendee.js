const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Library to generate unique IDs

const AttendeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  // The event the attendee is registered for.
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  profilePictureUrl: {
    type: String,
    default: 'default-avatar.jpg', // A default image if none is uploaded
  },
  // A unique, non-guessable ID for the badge QR code.
  badgeId: {
    type: String,
    default: () => uuidv4(), // Generate a unique UUID by default
    unique: true,
  },
  status: {
    type: String,
    enum: ['registered', 'checked-in', 'cancelled'],
    default: 'registered',
  },
  registeredSessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conference',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Attendee', AttendeeSchema);