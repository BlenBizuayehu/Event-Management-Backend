const Conference = require('../models/Conference');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all conferences
// @route   GET /api/conferences
// @access  Public
exports.getConferences = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single conference
// @route   GET /api/conferences/:id
// @access  Public
exports.getConference = asyncHandler(async (req, res, next) => {
  const conference = await Conference.findById(req.params.id)
    .populate('organizer', 'name email')
    .populate('sponsors')
    .populate('partners')
    .populate('speakers');

  if (!conference) {
    return next(
      new ErrorResponse(`Conference not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: conference });
});

// @desc    Create conference
// @route   POST /api/conferences
// @access  Private/Organizer
exports.createConference = asyncHandler(async (req, res, next) => {
  // Add organizer to req.body
  req.body.organizer = req.user.id;

  const conference = await Conference.create(req.body);

  res.status(201).json({ success: true, data: conference });
});

// @desc    Update conference
// @route   PUT /api/conferences/:id
// @access  Private/Organizer
exports.updateConference = asyncHandler(async (req, res, next) => {
  let conference = await Conference.findById(req.params.id);

  if (!conference) {
    return next(
      new ErrorResponse(`Conference not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is conference organizer
  if (conference.organizer.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update this conference`, 401)
    );
  }

  conference = await Conference.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: conference });
});

// @desc    Delete conference
// @route   DELETE /api/conferences/:id
// @access  Private/Organizer
exports.deleteConference = asyncHandler(async (req, res, next) => {
  const conference = await Conference.findById(req.params.id);

  if (!conference) {
    return next(
      new ErrorResponse(`Conference not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is conference organizer
  if (conference.organizer.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to delete this conference`, 401)
    );
  }

  await conference.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc    Add sponsor to conference
// @route   POST /api/conferences/:id/sponsors
// @access  Private/Organizer
exports.addSponsor = asyncHandler(async (req, res, next) => {
  const conference = await Conference.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { sponsors: req.body.sponsorId } },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: conference });
});

// @desc    Add partner to conference
// @route   POST /api/conferences/:id/partners
// @access  Private/Organizer
exports.addPartner = asyncHandler(async (req, res, next) => {
  const conference = await Conference.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { partners: req.body.partnerId } },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: conference });
});