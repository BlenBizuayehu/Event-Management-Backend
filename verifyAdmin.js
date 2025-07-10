require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/SystemAdmin');

const verifyAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const admin = await Admin.findOne({ email: process.env.ADMIN_EMAIL }).select('+password');
    
    if (!admin) {
      console.log('❌ No admin found with this email');
    } else {
      console.log('✅ Admin found:', {
        email: admin.email,
        passwordExists: !!admin.password,
        createdAt: admin.createdAt
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification error:', err);
    process.exit(1);
  }
};

verifyAdmin();