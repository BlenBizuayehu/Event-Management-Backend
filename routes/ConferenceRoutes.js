const express = require('express');
const {
  getConferences,
  getConference,
  createConference,
  updateConference,
  deleteConference,
} = require('../contollers/ConferenceController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Protect all routes
router.use(protect);
router.use(authorize('organizer'));

router
  .route('/')
  .get(getConferences) // optionally filter by event
  .post(createConference);

router
  .route('/:id')
  .get(getConference)
  .put(updateConference)
  .delete(deleteConference);

module.exports = router;
