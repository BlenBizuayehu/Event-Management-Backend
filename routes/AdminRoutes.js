// routes/adminRoutes.js
const express = require('express');
const {
  createOrganizer,
  getOrganizers,
  updateOrganizer
} = require('../contollers/OrganizerController');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Organizer = require('../models/Organizer');

const router = express.Router();

// All routes protected and admin-only
router.use(protect, authorize('admin'));

router.route('/organizers')
  .get(advancedResults(Organizer), getOrganizers)
  .post(createOrganizer);

router.route('/organizers/:id')
  .put(updateOrganizer);

module.exports = router;