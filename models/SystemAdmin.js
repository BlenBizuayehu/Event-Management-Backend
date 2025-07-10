const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AdminSchema = new mongoose.Schema({
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
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 8,
    select: false, // Prevents password from being sent in API responses by default
  },
  role: {
    type: String,
    default: 'admin', // Hardcoded role for clarity
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active',
  },
  lastLogin: {
    type: Date,
  },
},  {
  timestamps: true,
  statics: {
    async initializeAdmin() {
      const count = await this.countDocuments();
      if (count === 0) {
        const adminData = {
          name: 'System Admin',
          email: process.env.ADMIN_EMAIL || 'admin@example.com',
          password: process.env.ADMIN_INITIAL_PASSWORD || 'ChangeMe123!',
          role: 'super-admin'
        };
        await this.create(adminData);
        console.log('Initial admin account created');
      }
    }
  }
});

// Middleware: Hash password before the document is saved
AdminSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }


  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Add this to your AdminSchema
AdminSchema.pre('save', async function(next) {
  if (this.isNew) {
    const adminCount = await this.constructor.countDocuments();
    if (adminCount > 0) {
      throw new Error('Only one system admin can exist');
    }
  }
  next();
});

// Schema Method: Compare entered password with the hashed password
AdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Schema Method: Generate and sign a JSON Web Token
AdminSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role }, // Payload
    process.env.JWT_SECRET,             // Secret
    { expiresIn: process.env.JWT_EXPIRE } // Expiration
  );
};

module.exports = mongoose.model('Admin', AdminSchema);