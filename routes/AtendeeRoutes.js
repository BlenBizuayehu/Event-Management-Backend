const express = require('express');
const { getBadgeDetails } = require('../controllers/AttendeeController');

const router = express.Router();

router.get('/badge/:badgeId', getBadgeDetails);

module.exports = router;