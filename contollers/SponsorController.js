const Event = require('../models/Event'); 
const Sponsor = require('../models/Sponsor');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all sponsors
// @route   GET /api/sponsors
// @access  Private/Organizer
exports.getSponsors = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single sponsor
// @route   GET /api/sponsors/:id
// @access  Private/Organizer
exports.getSponsor = asyncHandler(async (req, res, next) => {
  const sponsor = await Sponsor.findById(req.params.id);

  if (!sponsor) {
    return next(
      new ErrorResponse(`Sponsor not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: sponsor });
});

// @desc    Create sponsor for specific event
// @route   POST /api/events/:eventId/sponsors
// @access  Private/Organizer
exports.createSponsor = asyncHandler(async (req, res, next) => {
  const eventId = req.params.eventId;

  // 1. Check that the event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new ErrorResponse(`Event not found with id ${eventId}`, 404));
  }

  // 2. Ensure the organizer owns the event
  if (event.organizer.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to add sponsors to this event`, 401)
    );
  }

  // 3. Attach organizer and event to the sponsor body
  req.body.organizer = req.user.id;
  req.body.event = eventId;

  const sponsor = await Sponsor.create(req.body);

  res.status(201).json({
    success: true,
    data: sponsor
  });
});


// @desc    Update sponsor
// @route   PUT /api/sponsors/:id
// @access  Private/Organizer
exports.updateSponsor = asyncHandler(async (req, res, next) => {
  let sponsor = await Sponsor.findById(req.params.id);

  if (!sponsor) {
    return next(
      new ErrorResponse(`Sponsor not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is sponsor organizer
  if (sponsor.organizer.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update this sponsor`, 401)
    );
  }

  sponsor = await Sponsor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: sponsor });
});

// @desc    Delete sponsor
// @route   DELETE /api/sponsors/:id
// @access  Private/Organizer
exports.deleteSponsor = asyncHandler(async (req, res, next) => {
  const sponsor = await Sponsor.findById(req.params.id);

  if (!sponsor) {
    return next(
      new ErrorResponse(`Sponsor not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is sponsor organizer
  if (sponsor.organizer.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to delete this sponsor`, 401)
    );
  }

  await sponsor.remove();

  res.status(200).json({ success: true, data: {} });
});