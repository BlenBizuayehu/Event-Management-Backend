const express = require('express');
const router = express.Router();
const {
  getConferences,
  getConference,
  createConference,
  updateConference,
  deleteConference,
  addSponsor,
  addPartner
} = require('../contollers/ConferenceController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Organizer-only routes
router.use(authorize('organizer'));

router.route('/')
  .get(getConferences)
  .post(createConference);

router.route('/:id')
  .get(getConference)
  .put(updateConference)
  .delete(deleteConference);

router.route('/:id/sponsors')
  .post(addSponsor);

router.route('/:id/partners')
  .post(addPartner);

module.exports = router;