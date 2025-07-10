const mongoose = require("mongoose");

const ConferenceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  startTime: {
    type: Date,
    required: [true, 'Please add a start time'],
  },
  endTime: {
    type: Date,
    required: [true, 'Please add an end time'],
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'End time must be after start time',
    },
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Planning', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Planning',
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organizer',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Conference must belong to an event'],
  },
  speakers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Speaker',
  }]
}, {
  timestamps: true,
});

module.exports = mongoose.model('Conference', ConferenceSchema);
