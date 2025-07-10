// routes/authRoutes.js
const express = require('express');
const { login, getMe, logout } = require('../contollers/AuthController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

module.exports = router;