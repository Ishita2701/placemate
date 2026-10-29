const HttpError = require('./httpError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^\d{10}$/;
const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract'];
const APPLICATION_STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'];
const ROLES = ['student', 'recruiter'];

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

// Accepts "React, Node" or ["React", "Node"] and returns a clean unique array.
function toList(value) {
  const items = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  return [...new Set(items.map((item) => String(item).trim()).filter(Boolean))];
}

function throwIfInvalid(errors) {
  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, 'Please correct the highlighted fields', errors);
  }
}

function validateRegister(body) {
  const errors = {};
  const name = text(body.name);
  const email = text(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';
  const role = body.role;

  if (!name) errors.name = 'Full name is required';
  else if (name.length < 2) errors.name = 'Full name must be at least 2 characters';
  if (!email) errors.email = 'Email is required';
  else if (!EMAIL_REGEX.test(email)) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (!ROLES.includes(role)) errors.role = 'Please select a role';

  return { errors, values: { name, email, password, role } };
}

function validateLogin(body) {
  const errors = {};
  const email = text(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email) errors.email = 'Email is required';
  else if (!EMAIL_REGEX.test(email)) errors.email = 'Enter a valid email address';
  if (!password) errors.password = 'Password is required';
  return { errors, values: { email, password } };
}

function validateProfile(body) {
  const errors = {};
  const values = {
    fullName: text(body.fullName),
    email: text(body.email).toLowerCase(),
    phone: text(body.phone),
    college: text(body.college),
    degreeBranch: text(body.degreeBranch),
    graduationYear: body.graduationYear,
    cgpa: body.cgpa,
    skills: toList(body.skills),
    resumeUrl: text(body.resumeUrl),
  };

  if (!values.fullName) errors.fullName = 'Full name is required';
  if (!values.email) errors.email = 'Email is required';
  else if (!EMAIL_REGEX.test(values.email)) errors.email = 'Enter a valid email address';
  if (!values.phone) errors.phone = 'Phone number is required';
  else if (!PHONE_REGEX.test(values.phone)) errors.phone = 'Phone number must be exactly 10 digits';
  if (!values.college) errors.college = 'College name is required';
  if (!values.degreeBranch) errors.degreeBranch = 'Degree and branch is required';

  if (isBlank(values.graduationYear)) errors.graduationYear = 'Graduation year is required';
  else {
    const year = Number(values.graduationYear);
    if (!Number.isInteger(year) || year < 2020 || year > 2035) {
      errors.graduationYear = 'Graduation year must be between 2020 and 2035';
    } else values.graduationYear = year;
  }

  if (isBlank(values.cgpa)) errors.cgpa = 'CGPA is required';
  else {
    const cgpa = Number(values.cgpa);
    if (Number.isNaN(cgpa) || cgpa < 0 || cgpa > 10) errors.cgpa = 'CGPA must be a number between 0 and 10';
    else values.cgpa = cgpa;
  }

  if (values.skills.length === 0) errors.skills = 'Enter at least one technical skill';

  if (!values.resumeUrl) errors.resumeUrl = 'Resume URL is required';
  else {
    try {
      const url = new URL(values.resumeUrl);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('bad protocol');
    } catch (err) {
      errors.resumeUrl = 'Enter a valid URL starting with http:// or https://';
    }
  }

  return { errors, values };
}

// existingDeadline is passed when editing, so an unchanged (already valid) deadline is accepted.
function validateJob(body, existingDeadline) {
  const errors = {};
  const values = {
    title: text(body.title),
    company: text(body.company),
    description: text(body.description),
    skills: toList(body.skills),
    location: text(body.location),
    jobType: body.jobType,
    minCgpa: isBlank(body.minCgpa) ? 0 : body.minCgpa,
    eligibleYears: Array.isArray(body.eligibleYears) ? body.eligibleYears.map(Number) : [],
    deadline: body.deadline,
    openings: isBlank(body.openings) ? 1 : body.openings,
  };

  if (!values.title) errors.title = 'Job title is required';
  else if (values.title.length < 3) errors.title = 'Job title must be at least 3 characters';
  if (!values.company) errors.company = 'Company name is required';
  if (!values.description) errors.description = 'Job description is required';
  else if (values.description.length < 20) errors.description = 'Description must be at least 20 characters';
  if (values.skills.length === 0) errors.skills = 'Enter at least one required skill';
  if (!values.location) errors.location = 'Location is required';
  if (!JOB_TYPES.includes(values.jobType)) errors.jobType = 'Please select a job type';

  const minCgpa = Number(values.minCgpa);
  if (Number.isNaN(minCgpa) || minCgpa < 0 || minCgpa > 10) errors.minCgpa = 'Minimum CGPA must be between 0 and 10';
  else values.minCgpa = minCgpa;

  if (values.eligibleYears.length === 0 || values.eligibleYears.some((y) => !Number.isInteger(y) || y < 2020 || y > 2035)) {
    errors.eligibleYears = 'Select at least one eligible graduation year';
  }

  const openings = Number(values.openings);
  if (!Number.isInteger(openings) || openings < 1 || openings > 1000) errors.openings = 'Openings must be a whole number from 1 to 1000';
  else values.openings = openings;

  if (isBlank(values.deadline)) errors.deadline = 'Application deadline is required';
  else {
    const deadline = new Date(values.deadline);
    if (Number.isNaN(deadline.getTime())) errors.deadline = 'Enter a valid deadline date';
    else {
      const unchanged = existingDeadline && new Date(existingDeadline).toISOString().slice(0, 10) === deadline.toISOString().slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);
      if (!unchanged && deadline.toISOString().slice(0, 10) < today) errors.deadline = 'Deadline cannot be in the past';
      else values.deadline = deadline;
    }
  }

  return { errors, values };
}

module.exports = {
  EMAIL_REGEX,
  JOB_TYPES,
  APPLICATION_STATUSES,
  ROLES,
  throwIfInvalid,
  validateRegister,
  validateLogin,
  validateProfile,
  validateJob,
};
