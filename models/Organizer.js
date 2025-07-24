// models/Organizer.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const OrganizerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide organizer name"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 8,
      select: false, // Won't return password in queries
    },
    contactNumber: {
      type: String,
      required: [true, "Please provide contact number"],
      validate: {
        validator: function (v) {
          return /^[+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    organization: {
      type: String,
      required: [true, "Please provide organization name"],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    permissions: {
      createEvents: { type: Boolean, default: true },
      manageOwnEvents: { type: Boolean, default: true },
      createExhibitors: { type: Boolean, default: true },
      manageOwnExhibitors: { type: Boolean, default: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
OrganizerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
OrganizerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Indexes
OrganizerSchema.index({ createdBy: 1 });

module.exports = mongoose.model("Organizer", OrganizerSchema);
