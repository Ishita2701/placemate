const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    skills: { type: [String], default: [] },
    location: { type: String, required: true, trim: true },
    jobType: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Contract'], required: true },
    minCgpa: { type: Number, required: true, min: 0, max: 10, default: 0 },
    eligibleYears: { type: [Number], default: [] },
    deadline: { type: Date, required: true },
    openings: { type: Number, required: true, min: 1, default: 1 },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
