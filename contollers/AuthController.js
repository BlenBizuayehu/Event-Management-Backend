const SystemAdmin = require('../models/SystemAdmin');
const Organizer = require('../models/Organizer');
const Exhibitor = require('../models/Exhibitor');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/async');
const jwt = require('jsonwebtoken');

/**
 * @desc    Login user (Admin, Organizer, or Exhibitor)
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Validation: Ensure email and password are provided
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // 2. Find User: Sequentially check each user collection
  const user =
    (await SystemAdmin.findOne({ email }).select('+password')) ||
    (await Organizer.findOne({ email }).select('+password')) ||
    (await Exhibitor.findOne({ email }).select('+password'));

  // If no user is found in any collection, the email is not registered
  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // 3. Check if password matches
  // This works because all user models have a `matchPassword` method
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    // The email was correct, but the password was wrong.
    // Send the same generic error for security reasons.
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // 4. Handle Post-Login Logic (e.g., update lastLogin timestamp)
  // `instanceof` is used to check which type of user logged in
  if (user instanceof Organizer || user instanceof Exhibitor) {
    user.lastLogin = Date.now();
    // We skip validation here because we are only updating the login time
    await user.save({ validateBeforeSave: false });
  }

  // 5. Create token and send response
  sendTokenResponse(user, 200, res);
});


/**
 * @desc    Get current logged in user's profile
 * @route   GET /api/auth/me
 * @access  Private (requires token)
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  // req.user is attached by the 'protect' middleware from the token payload
  const { id, role } = req.user;
  let user;

  // Fetch the full user document from the correct collection based on the role
  if (role === 'admin') {
    user = await SystemAdmin.findById(id);
  } else if (role === 'organizer') {
    user = await Organizer.findById(id);
  } else if (role === 'exhibitor') {
    user = await Exhibitor.findById(id);
  }

  // If the user was deleted after the token was issued
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});


/**
 * @desc    Log user out
 * @route   GET /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  // For a stateless JWT system, the primary action is for the client to
  // delete the token. This server endpoint is a standard practice to
  // formally acknowledge the logout process.
  res.status(200).json({
    success: true,
    data: {},
  });
});


// --- Helper Function ---

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Dynamically determine the role for the token payload.
  // It first checks for an explicit `.role` property (on Admin, Organizer).
  // If not found, it uses the model name (for Exhibitor).
  const role = user.role || user.constructor.modelName.toLowerCase();

  const token = jwt.sign(
    { id: user._id, role: role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  res.status(statusCode).json({
    success: true,
    token,
    role, // Send role back to client for UI routing
  });
};