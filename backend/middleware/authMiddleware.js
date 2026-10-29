const jwt = require('jsonwebtoken');
const User = require('../models/User');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');

// Checks the "Authorization: Bearer <token>" header and loads the user into req.user.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    throw new HttpError(401, 'Authentication required. Please log in.');
  }
  let decoded;
  try {
    decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch (err) {
    throw new HttpError(401, 'Your session has expired. Please log in again.');
  }
  const user = await User.findById(decoded.id);
  if (!user) throw new HttpError(401, 'Account not found. Please log in again.');
  req.user = user;
  next();
});

// Allows only the listed roles, e.g. authorize('recruiter').
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new HttpError(403, 'You do not have permission to perform this action'));
  }
  next();
};

module.exports = { protect, authorize };
