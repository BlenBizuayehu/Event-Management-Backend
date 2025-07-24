const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/ErrorResponse");
const Admin = require("../models/SystemAdmin");
const Organizer = require("../models/Organizer");
const Exhibitor = require("../models/Exhibitor");

// Define role hierarchy at the top
const roleHierarchy = ["exhibitor", "organizer", "admin", "super-admin"];

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;

    switch (decoded.role) {
      case "admin":
        user = await Admin.findById(decoded.id);
        break;
      case "super-admin":
        user = await Admin.findById(decoded.id);
        break;
      case "organizer":
        user = await Organizer.findById(decoded.id);
        break;
      case "exhibitor":
        user = await Exhibitor.findById(decoded.id);
        break;
      default:
        return next(new ErrorResponse("Invalid role in token", 401));
    }

    if (!user) {
      return next(new ErrorResponse("User no longer exists", 401));
    }

    req.user = user;
    req.user.role = decoded.role;
    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (userRole === "super-admin") {
      return next();
    }
    const requiredMin = Math.min(...roles.map((r) => roleHierarchy.indexOf(r)));
    const userLevel = roleHierarchy.indexOf(userRole);
    // console.log("AUTH DEBUG:", { userRole, roles, requiredMin, userLevel });
    if (userLevel === -1 || userLevel < requiredMin) {
      return next(
        new ErrorResponse(
          `User role ${userRole} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
