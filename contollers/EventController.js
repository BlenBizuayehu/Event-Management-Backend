const Event = require('../models/Event');
const Exhibitor = require('../models/Exhibitor');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const Organizer=require('../models/Organizer');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = asyncHandler(async (req, res, next) => {
  // Advanced filtering, sorting, pagination
  let query;
  const reqQuery = { ...req.query };
  
  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);
  
  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  
  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
  // Finding resource
  query = Event.find(JSON.parse(queryStr)).populate({
    path: 'organizer',
    select: 'name email'
  });

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('startDate');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Event.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const events = await query;

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: events.length,
    pagination,
    data: events
  });
});

// @desc    Get single event with exhibitors and attendees
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
    .populate({
      path: 'organizer',
      select: 'name email'
    })
    .populate({
      path: 'exhibitors',
      select: 'name contactPerson email boothNumber'
    })
    .populate({
      path: 'attendees',
      select: 'name email registration_date'
    });

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Organizer
exports.createEvent = asyncHandler(async (req, res, next) => {
  // Add organizer to request body
  req.body.organizer = req.user.id;

  // Verify organizer exists and is active
  const organizer = await Organizer.findById(req.user.id);
  if (!organizer || !organizer.isActive) {
    return next(new ErrorResponse('Organizer not authorized to create events', 401));
  }

  const event = await Event.create(req.body);

  res.status(201).json({
    success: true,
    data: event
  });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Organizer
exports.updateEvent = asyncHandler(async (req, res, next) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is event organizer or admin
  if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User not authorized to update this event`, 401)
    );
  }

  // Prevent changing organizer when updating
  if (req.body.organizer && req.body.organizer !== req.user.id) {
    return next(
      new ErrorResponse(`Cannot change event organizer`, 400)
    );
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Organizer
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is event organizer or admin
  if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User not authorized to delete this event`, 401)
    );
  }

  await event.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get events for specific organizer
// @route   GET /api/events/organizer/:organizerId
// @access  Public
exports.getEventsByOrganizer = asyncHandler(async (req, res, next) => {
  const events = await Event.find({ organizer: req.params.organizerId })
    .populate({
      path: 'exhibitors',
      select: 'name boothNumber'
    });

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});

// @desc    Add exhibitor to event
// @route   POST /api/events/:eventId/exhibitors
// @access  Private/Organizer
exports.addExhibitorToEvent = asyncHandler(async (req, res, next) => {
  try {
    // Verify event exists and belongs to organizer
    const event = await Event.findOne({
      _id: req.params.eventId,
      organizer: req.user.id
    });

    if (!event) {
      return next(new ErrorResponse(`Event not found or unauthorized`, 404));
    }

    // Check for existing exhibitor with same name for this event
    const existingExhibitor = await Exhibitor.findOne({
      name: req.body.name,
      event: req.params.eventId
    });

    if (existingExhibitor) {
      return next(new ErrorResponse(`Exhibitor with this name already exists for this event`, 400));
    }

    // Create exhibitor
    const exhibitor = await Exhibitor.create({
      ...req.body,
      event: req.params.eventId,
      organizer: req.user.id
    });

    // Add to event
    event.exhibitors.push(exhibitor._id);
    await event.save();

    res.status(201).json({
      success: true,
      data: exhibitor
    });

  } catch (err) {
    // Handle duplicate key errors
    if (err.code === 11000) {
      return next(new ErrorResponse(`Exhibitor with these details already exists`, 400));
    }
    next(err);
  }
});

// @desc    Get exhibitors for specific event
// @route   GET /api/events/:eventId/exhibitors
// @access  Public
exports.getEventExhibitors = asyncHandler(async (req, res, next) => {
  const exhibitors = await Exhibitor.find({ event: req.params.eventId });

  res.status(200).json({
    success: true,
    count: exhibitors.length,
    data: exhibitors
  });
});