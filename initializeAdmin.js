require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/SystemAdmin');
const bcrypt = require('bcryptjs');

const initializeAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if any admin exists
    const adminCount = await Admin.countDocuments();
    
    if (adminCount === 0) {
      // Create the single admin
      const admin = new Admin({
        name: 'System Administrator',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: process.env.ADMIN_INITIAL_PASSWORD || 'ChangeMe123!',
        role: 'super-admin'
      });

      await admin.save();
      console.log('✅ System admin created successfully');
    } else {
      console.log('ℹ️ Admin already exists in database');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing admin:', error.message);
    process.exit(1);
  }
};

initializeAdmin();