const express = require('express');
const {
  getEventPartners,
  addPartnerToEvent,
  getPartner,
  updatePartner,
  deletePartner
} = require('../contollers/PartnerController');

const { protect, authorize } = require('../middleware/auth');

// This allows us to get the :eventId param from the parent router (EventRoutes)
const router = express.Router({ mergeParams: true });

// All routes in this file require a user to be logged in and have an authorized role
router.use(protect);
router.use(authorize('organizer', 'admin'));

// Route to get all partners for an event or add a new one
router
  .route('/')
  .get(getEventPartners)
  .post(addPartnerToEvent);

module.exports = router;