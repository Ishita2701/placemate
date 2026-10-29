const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const { validateRegister, validateLogin, throwIfInvalid } = require('../utils/validators');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

const publicUser = (user) => ({ id: String(user._id), name: user.name, email: user.email, role: user.role });

// POST /api/auth/register
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { errors, values } = validateRegister(req.body || {});
    throwIfInvalid(errors);

    const existing = await User.findOne({ email: values.email });
    if (existing) {
      throw new HttpError(409, 'An account with this email already exists', { email: 'This email is already registered' });
    }

    const hashed = await bcrypt.hash(values.password, 10);
    const user = await User.create({ name: values.name, email: values.email, password: hashed, role: values.role });
    res.status(201).json({ success: true, message: 'Registration successful. Please log in.', user: publicUser(user) });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { errors, values } = validateLogin(req.body || {});
    throwIfInvalid(errors);

    const user = await User.findOne({ email: values.email }).select('+password');
    const passwordOk = user ? await bcrypt.compare(values.password, user.password) : false;
    if (!user || !passwordOk) throw new HttpError(401, 'Invalid email or password');

    res.json({ success: true, message: 'Login successful', token: signToken(user), user: publicUser(user) });
  })
);

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

module.exports = router;
