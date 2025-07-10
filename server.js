const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');
// Load environment variables FIRST
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

///192.168.56.1
// Routes
app.use('/api/events', require('./routes/EventRoutes'));
app.use('/api/auth', require('./routes/AuthRoutes'));
app.use('/api/admin', require('./routes/AdminRoutes'));
// Mount routers
app.use('/api/conferences', require('./routes/ConferenceRoutes'));
app.use('/api/sponsors', require('./routes/SponsorRoutes'));
app.use('/api/partners', require('./routes/PartnerRoutes')); 
app.use('/api/events', require('./routes/EventRoutes'));
app.use('/api/exhibitors', require('./routes/ExihibitorRoutes'));

app.use('/api/products', require('./routes/ProductRoutes'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Server Error' });
});

// Start server
const PORT = process.env.PORT || 6000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
