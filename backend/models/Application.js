const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'],
    default: 'Applied',
  },
  appliedAt: { type: Date, default: Date.now },
});

// One student can apply to a job only once (enforced by the database too).
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
