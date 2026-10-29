const express = require('express');
const StudentProfile = require('../models/StudentProfile');
const asyncHandler = require('../utils/asyncHandler');
const { validateProfile, throwIfInvalid } = require('../utils/validators');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect, authorize('student'));

const toJson = (profile) => {
  const { _id, __v, user, ...rest } = profile.toObject();
  return { id: String(_id), ...rest };
};

// GET /api/profile  -> { profile: null } until the student saves it for the first time
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    res.json({ success: true, profile: profile ? toJson(profile) : null });
  })
);

// PUT /api/profile  (create or update)
router.put(
  '/',
  asyncHandler(async (req, res) => {
    const { errors, values } = validateProfile(req.body || {});
    throwIfInvalid(errors);

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: values },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile saved successfully', profile: toJson(profile) });
  })
);

module.exports = router;
