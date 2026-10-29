const express = require('express');
const Job = require('../models/Job');
const Application = require('../models/Application');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const { isObjectId, escapeRegex, serializeJob } = require('../utils/helpers');
const { validateJob, throwIfInvalid, JOB_TYPES } = require('../utils/validators');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/jobs?search=&location=&jobType=&cgpa=   (public)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const search = String(req.query.search || '').trim();
    const location = String(req.query.location || '').trim();
    const jobType = String(req.query.jobType || '').trim();
    const cgpa = String(req.query.cgpa || '').trim();

    const filter = {};
    if (search) {
      const pattern = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ title: pattern }, { company: pattern }];
    }
    if (location) filter.location = new RegExp(`^${escapeRegex(location)}$`, 'i');
    if (jobType) filter.jobType = jobType;
    // "cgpa" = the student's CGPA: show only jobs whose minimum CGPA is not higher than it
    if (cgpa !== '' && !Number.isNaN(Number(cgpa))) filter.minCgpa = { $lte: Number(cgpa) };

    const jobs = await Job.find(filter).sort({ title: 1, _id: 1 });
    res.json({ success: true, count: jobs.length, jobs: jobs.map(serializeJob) });
  })
);

// GET /api/jobs/meta  -> values for the filter dropdowns (public)
router.get(
  '/meta',
  asyncHandler(async (req, res) => {
    const locations = (await Job.distinct('location')).sort((a, b) => a.localeCompare(b));
    res.json({ success: true, locations, jobTypes: JOB_TYPES });
  })
);

// GET /api/jobs/mine  -> the logged-in recruiter's jobs with applicant counts
router.get(
  '/mine',
  protect,
  authorize('recruiter'),
  asyncHandler(async (req, res) => {
    const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1, _id: -1 });
    const result = await Promise.all(
      jobs.map(async (job) => ({
        ...serializeJob(job),
        applicantCount: await Application.countDocuments({ job: job._id }),
      }))
    );
    res.json({ success: true, count: result.length, jobs: result });
  })
);

// GET /api/jobs/:id  (public)
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!isObjectId(req.params.id)) throw new HttpError(404, 'Job not found');
    const job = await Job.findById(req.params.id);
    if (!job) throw new HttpError(404, 'Job not found');
    res.json({ success: true, job: serializeJob(job) });
  })
);

// POST /api/jobs  (recruiter)
router.post(
  '/',
  protect,
  authorize('recruiter'),
  asyncHandler(async (req, res) => {
    const { errors, values } = validateJob(req.body || {});
    throwIfInvalid(errors);
    const job = await Job.create({ ...values, recruiter: req.user._id });
    res.status(201).json({ success: true, message: 'Job created successfully', job: serializeJob(job) });
  })
);

// Loads a job and makes sure it belongs to the logged-in recruiter.
async function findOwnedJob(req) {
  if (!isObjectId(req.params.id)) throw new HttpError(404, 'Job not found');
  const job = await Job.findById(req.params.id);
  if (!job) throw new HttpError(404, 'Job not found');
  if (String(job.recruiter) !== String(req.user._id)) {
    throw new HttpError(403, 'You can only modify your own job postings');
  }
  return job;
}

// PUT /api/jobs/:id  (owner recruiter)
router.put(
  '/:id',
  protect,
  authorize('recruiter'),
  asyncHandler(async (req, res) => {
    const job = await findOwnedJob(req);
    const { errors, values } = validateJob(req.body || {}, job.deadline);
    throwIfInvalid(errors);
    job.set(values);
    await job.save();
    res.json({ success: true, message: 'Job updated successfully', job: serializeJob(job) });
  })
);

// DELETE /api/jobs/:id  (owner recruiter) - also removes the job's applications
router.delete(
  '/:id',
  protect,
  authorize('recruiter'),
  asyncHandler(async (req, res) => {
    const job = await findOwnedJob(req);
    await Application.deleteMany({ job: job._id });
    await job.deleteOne();
    res.json({ success: true, message: 'Job deleted successfully' });
  })
);

module.exports = router;
