const Exhibitor = require("../models/Exhibitor");
const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/async");

exports.createExhibitor = asyncHandler(async (req, res, next) => {
  // Attach organizer and event from URL params
  req.body.organizer = req.user.id;
  req.body.event = req.params.eventId;

  const exhibitor = await Exhibitor.create(req.body);

  res.status(201).json({
    success: true,
    data: exhibitor,
  });
});

// @desc    Get all exhibitors
// @route   GET /api/exhibitors
// @access  Public
exports.getExhibitors = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single exhibitor
// @route   GET /api/exhibitors/:id
// @access  Public
exports.getExhibitor = asyncHandler(async (req, res, next) => {
  const exhibitor = await Exhibitor.findById(req.params.id)
    .populate("organizer", "name email")
    .populate("event", "name");

  if (!exhibitor) {
    return next(
      new ErrorResponse(`Exhibitor not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: exhibitor,
  });
});

// @desc    Update exhibitor
// @route   PUT /api/exhibitors/:id
// @access  Private/Organizer
exports.updateExhibitor = asyncHandler(async (req, res, next) => {
  let exhibitor = await Exhibitor.findById(req.params.id);

  if (!exhibitor) {
    return next(
      new ErrorResponse(`Exhibitor not found with id of ${req.params.id}`, 404)
    );
  }

  if (exhibitor.organizer.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`Not authorized to update this exhibitor`, 401)
    );
  }

  exhibitor = await Exhibitor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: exhibitor,
  });
});
