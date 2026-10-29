const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const { isObjectId, isExpired, serializeJob } = require('../utils/helpers');
const { APPLICATION_STATUSES } = require('../utils/validators');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

// POST /api/applications  { jobId }   (student)
router.post(
  '/',
  authorize('student'),
  asyncHandler(async (req, res) => {
    const { jobId } = req.body || {};
    if (!isObjectId(jobId)) throw new HttpError(404, 'Job not found');
    const job = await Job.findById(jobId);
    if (!job) throw new HttpError(404, 'Job not found');

    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      throw new HttpError(400, 'Please complete your profile before applying for jobs');
    }
    if (isExpired(job.deadline)) {
      throw new HttpError(400, 'The application deadline for this job has passed');
    }
    if (profile.cgpa < job.minCgpa) {
      throw new HttpError(403, `You are not eligible: this job requires a minimum CGPA of ${job.minCgpa} (your CGPA is ${profile.cgpa})`);
    }
    if (!job.eligibleYears.includes(profile.graduationYear)) {
      throw new HttpError(
        403,
        `You are not eligible: this job is open to graduation years ${job.eligibleYears.join(', ')} (yours is ${profile.graduationYear})`
      );
    }
    if (await Application.findOne({ student: req.user._id, job: job._id })) {
      throw new HttpError(409, 'You have already applied for this job');
    }

    let application;
    try {
      application = await Application.create({ student: req.user._id, job: job._id });
    } catch (err) {
      if (err.code === 11000) throw new HttpError(409, 'You have already applied for this job');
      throw err;
    }
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: { id: String(application._id), jobId: String(job._id), status: application.status, appliedAt: application.appliedAt },
    });
  })
);

// GET /api/applications/mine   (student)
router.get(
  '/mine',
  authorize('student'),
  asyncHandler(async (req, res) => {
    const applications = await Application.find({ student: req.user._id }).populate('job').sort({ appliedAt: -1, _id: -1 });
    const result = applications
      .filter((app) => app.job)
      .map((app) => ({
        id: String(app._id),
        status: app.status,
        appliedAt: app.appliedAt,
        job: { id: String(app.job._id), title: app.job.title, company: app.job.company, location: app.job.location, jobType: app.job.jobType },
      }));
    res.json({ success: true, count: result.length, applications: result });
  })
);

// GET /api/applications/job/:jobId   (recruiter who owns the job)
router.get(
  '/job/:jobId',
  authorize('recruiter'),
  asyncHandler(async (req, res) => {
    if (!isObjectId(req.params.jobId)) throw new HttpError(404, 'Job not found');
    const job = await Job.findById(req.params.jobId);
    if (!job) throw new HttpError(404, 'Job not found');
    if (String(job.recruiter) !== String(req.user._id)) {
      throw new HttpError(403, 'You can only view applicants for your own job postings');
    }

    const applications = await Application.find({ job: job._id }).populate('student', 'name email').sort({ appliedAt: 1, _id: 1 });
    const profiles = await StudentProfile.find({ user: { $in: applications.map((a) => a.student._id) } });
    const profileByUser = new Map(profiles.map((p) => [String(p.user), p]));

    const applicants = applications.map((app) => {
      const p = profileByUser.get(String(app.student._id));
      return {
        id: String(app._id),
        status: app.status,
        appliedAt: app.appliedAt,
        student: { id: String(app.student._id), name: app.student.name, email: app.student.email },
        profile: p
          ? { phone: p.phone, college: p.college, degreeBranch: p.degreeBranch, graduationYear: p.graduationYear, cgpa: p.cgpa, skills: p.skills, resumeUrl: p.resumeUrl }
          : null,
      };
    });
    res.json({ success: true, job: serializeJob(job), count: applicants.length, applicants });
  })
);

// PATCH /api/applications/:id/status  { status }   (recruiter who owns the job)
router.patch(
  '/:id/status',
  authorize('recruiter'),
  asyncHandler(async (req, res) => {
    if (!isObjectId(req.params.id)) throw new HttpError(404, 'Application not found');
    const { status } = req.body || {};
    if (!APPLICATION_STATUSES.includes(status)) {
      throw new HttpError(400, `Status must be one of: ${APPLICATION_STATUSES.join(', ')}`, { status: 'Invalid status' });
    }
    const application = await Application.findById(req.params.id).populate('job');
    if (!application || !application.job) throw new HttpError(404, 'Application not found');
    if (String(application.job.recruiter) !== String(req.user._id)) {
      throw new HttpError(403, 'You can only update applicants of your own job postings');
    }
    application.status = status;
    await application.save();
    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      application: { id: String(application._id), status: application.status },
    });
  })
);

module.exports = router;
