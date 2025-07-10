// routes/organizerRoutes.js
const express = require('express');
const {
  createEvent,
  getEvents
} = require('../controllers/organizerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('organizer'));

router.route('/events')
  .post(createEvent)
  .get(getEvents);

module.exports = router;
