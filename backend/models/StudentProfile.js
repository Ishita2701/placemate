const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    college: { type: String, required: true, trim: true },
    degreeBranch: { type: String, required: true, trim: true },
    graduationYear: { type: Number, required: true },
    cgpa: { type: Number, required: true, min: 0, max: 10 },
    skills: { type: [String], default: [] },
    resumeUrl: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
