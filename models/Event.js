const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add an event name"],
      trim: true,
      maxlength: [100, "Event name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    location: {
      type: String,
      required: [true, "Please add a location"],
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    startDate: {
      type: Date,
      required: [true, "Please add a start date and time"],
    },
    endDate: {
      type: Date,
      required: false,
    },
    maxAttendees: {
      type: Number,
      required: [true, "Please specify maximum attendees"],
      min: [1, "Maximum attendees must be at least 1"],
    },
    registrationOpen: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      default: "default-event.jpg",
    },
    categories: {
      type: [String],
      // enum: ["conference", "workshop", "exhibition", "networking", "social"],
      required: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizer",
      required: true,
    },
    exhibitors: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Exhibitor",
        },
      ],
      default: [], // This ensures the array is always initialized
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attendee",
      },
    ],
    //   status: {
    //     type: String,
    //     enum: ['draft', 'published', 'archived'],
    //     default: 'draft'
    //   },
    //   floorPlan: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'FloorPlan'
    //   },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Replaces manual createdAt/updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for sessions
EventSchema.virtual("sessions", {
  ref: "Session",
  localField: "_id",
  foreignField: "event",
  justOne: false,
});

// Indexes for better performance
EventSchema.index({ organizer: 1 });
EventSchema.index({ startDate: 1 });
EventSchema.index({ categories: 1 });

// Cascade delete middleware
EventSchema.pre("remove", async function (next) {
  await this.model("Exhibitor").deleteMany({ event: this._id });
  await this.model("Session").deleteMany({ event: this._id });
  next();
});

// Helper method to check if event is active
EventSchema.methods.isActive = function () {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
};

// Helper method to get event status
EventSchema.methods.getStatus = function () {
  const now = new Date();
  if (now < this.startDate) return "upcoming";
  if (now > this.endDate) return "completed";
  return "active";
};

module.exports = mongoose.model("Event", EventSchema);
