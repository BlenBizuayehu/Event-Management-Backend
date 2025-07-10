const express = require('express');
const {
  getSponsors,
  getSponsor,
  createSponsor,
  updateSponsor,
  deleteSponsor
} = require('../contollers/SponsorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(protect);
router.use(authorize('organizer'));

// Route: /api/events/:eventId/sponsors
router.route('/')
  .get(getSponsors)             // Optionally: filter by event
  .post(createSponsor);         // Sponsor tied to eventId

router.route('/:id')
  .get(getSponsor)
  .put(updateSponsor)
  .delete(deleteSponsor);

module.exports = router;
