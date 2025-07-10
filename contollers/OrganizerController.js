// controllers/organizerController.js
const Organizer = require('../models/Organizer');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Create organizer
// @route   POST /api/admin/organizers
// @access  Private/Admin
exports.createOrganizer = (async (req, res, next) => {
  // Add admin ID to request body
  req.body.createdBy = req.user.id;

  // Create organizer
  const organizer = await Organizer.create(req.body);

  res.status(201).json({
    success: true,
    data: organizer
  });
});

// @desc    Get all organizers
// @route   GET /api/admin/organizers
// @access  Private/Admin
exports.getOrganizers = (async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Update organizer
// @route   PUT /api/admin/organizers/:id
// @access  Private/Admin
exports.updateOrganizer = (async (req, res, next) => {
  const organizer = await Organizer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!organizer) {
    return next(
      new ErrorResponse(`Organizer not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: organizer });
});

// Add organizer login support
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  try {
    // Check both Admin and Organizer collections
    let user = await Admin.findOne({ email }).select('+password') || 
               await Organizer.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Update last login for organizers
    if (user instanceof Organizer) {
      user.lastLogin = Date.now();
      await user.save();
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role || 'organizer' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(200).json({
      success: true,
      token,
      role: user.role || 'organizer'
    });

  } catch (err) {
    next(err);
  }
};