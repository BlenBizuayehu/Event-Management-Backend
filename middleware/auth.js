const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/ErrorResponse');
const Admin = require('../models/SystemAdmin');
const Organizer = require('../models/Organizer');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    let user;
    if (decoded.role === 'super-admin') {
      user = await Admin.findById(decoded.id);
    } else {
      user = await Organizer.findById(decoded.id);
    }

    if (!user) {
      return next(new ErrorResponse('User no longer exists', 401));
    }

    req.user = user;
    req.user.role = decoded.role; // Add role to request
    next();

  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};