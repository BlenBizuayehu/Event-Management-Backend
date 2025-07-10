const express = require('express');
const router = express.Router();
const {
  getSponsors,
  getSponsor,
  createSponsor,
  updateSponsor,
  deleteSponsor
} = require('../contollers/SponsorController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Organizer-only routes
router.use(authorize('organizer'));

router.route('/')
  .get(getSponsors)
  .post(createSponsor);

router.route('/:id')
  .get(getSponsor)
  .put(updateSponsor)
  .delete(deleteSponsor);

module.exports = router;