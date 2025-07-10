const express = require('express');

// --- FIX 1: Correct the typos in the require paths ---
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByOrganizer,
  addExhibitorToEvent,
  getEventExhibitors
} = require('../contollers/EventController'); // Corrected typo

const { registerForEvent } = require('../contollers/AtendeeController'); // Corrected typos

// --- FIX 2: Import the missing partnerRouter ---
const partnerRouter = require('./PartnerRoutes'); // Import the router for partners
const sponsorRouter = require('./SponsorRoutes');
const exhibitorRouter= require('./ExihibitorRoutes');
// --- Other necessary imports ---
const { protect, authorize } = require('../middleware/auth');

// Note: You are importing 'upload' from fileUploader, but the code I provided
// exports 'uploadSingle'. Make sure this matches what's in your fileUploader.js file.
// Let's assume you have 'uploadSingle' for clarity.
const { uploadSingle } = require('../utils/fileUploader');

const router = express.Router();


// --- Public Routes ---
router.get('/', getEvents);
router.get('/:id', getEvent);
router.get('/organizer/:organizerId', getEventsByOrganizer);
router.get('/:eventId/exhibitors', getEventExhibitors);
router.use('/:eventId/partners', partnerRouter);

// The 'upload' middleware runs first, then the 'registerForEvent' handler
// Using 'uploadSingle' as it's more descriptive for this use case
router.post('/:eventId/register', uploadSingle, registerForEvent);


// --- FIX 3: This line will now work correctly ---
// Re-route any request for '/:eventId/partners' to the partnerRouter


// --- Protected Routes ---
// This middleware will apply to all routes defined below it
router.use(protect);


// --- Organizer-only Routes ---
router.post('/', authorize('organizer', 'admin'), createEvent);
router.put('/:id', authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', authorize('organizer', 'admin'), deleteEvent);
router.post('/:eventId/exhibitors', authorize('organizer', 'admin'), addExhibitorToEvent);
router.use('/:eventId/partners', partnerRouter);
router.use('/:eventId/sponsors', sponsorRouter);
router.use('/:eventId/exhibitors', exhibitorRouter);
module.exports = router;