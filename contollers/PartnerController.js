const Partner = require('../models/Partner');
const Event = require('../models/Event'); // Use the Event model
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all partners for a specific EVENT
// @route   GET /api/events/:eventId/partners
// @access  Private (Organizer)
exports.getEventPartners = asyncHandler(async (req, res, next) => {
  // Find all partners associated with the eventId from the URL
  const partners = await Partner.find({ event: req.params.eventId }).populate({
    path: 'organizer',
    select: 'name email'
  });

  res.status(200).json({
    success: true,
    count: partners.length,
    data: partners,
  });
});

// @desc    Get a single partner's details
// @route   GET /api/partners/:id
// @access  Private (Organizer)
exports.getPartner = asyncHandler(async (req, res, next) => {
  // Find a specific partner by their own ID
  const partner = await Partner.findById(req.params.id).populate('event', 'name');

  if (!partner) {
    return next(new ErrorResponse(`Partner not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: partner });
});


// @desc    Add a partner TO a specific EVENT
// @route   POST /api/events/:eventId/partners
// @access  Private (Organizer)
exports.addPartnerToEvent = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;

  // 1. Verify the event exists and is owned by the logged-in organizer
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new ErrorResponse(`Event not found with id ${eventId}`, 404));
  }
  if (event.organizer.toString() !== req.user.id) {
    return next(new ErrorResponse(`User is not authorized to add partners to this event`, 401));
  }

  // 2. Add main organizer and event ID to the request body
  req.body.organizer = req.user.id;
  req.body.event = eventId;

  // 3. Create the new partner record
  const partner = await Partner.create(req.body);

  // 4. (Recommended) Add the partner to the event's own list of partners if it has one
  // event.partners.push(partner._id);
  // await event.save();

  res.status(201).json({
    success: true,
    data: partner,
  });
});


// @desc    Update a partner's details
// @route   PUT /api/partners/:id
// @access  Private (Organizer)
exports.updatePartner = asyncHandler(async (req, res, next) => {
  let partner = await Partner.findById(req.params.id);

  if (!partner) {
    return next(new ErrorResponse(`Partner not found with id of ${req.params.id}`, 404));
  }

  // Ensure the logged-in user is the one who created this partner record
  if (partner.organizer.toString() !== req.user.id) {
    return next(new ErrorResponse(`User is not authorized to update this partner`, 401));
  }

  partner = await Partner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: partner });
});

// @desc    Delete a partner
// @route   DELETE /api/partners/:id
// @access  Private (Organizer)
exports.deletePartner = asyncHandler(async (req, res, next) => {
  const partner = await Partner.findById(req.params.id);

  if (!partner) {
    return next(new ErrorResponse(`Partner not found with id of ${req.params.id}`, 404));
  }

  // Verify ownership before allowing deletion
  if (partner.organizer.toString() !== req.user.id) {
    return next(new ErrorResponse(`User is not authorized to delete this partner`, 401));
  }

  await partner.remove();

  res.status(200).json({ success: true, data: {} });
});