const express = require('express');
const { getBadgeDetails } = require('../contollers/AtendeeController');

const router = express.Router();

router.get('/badge/:badgeId', getBadgeDetails);

module.exports = router;