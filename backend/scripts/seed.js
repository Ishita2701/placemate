// Development-only demo data.
//   npm run seed         -> create/update the demo data (safe to run repeatedly)
//   npm run seed:reset   -> wipe ALL collections first, then seed
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed demo data because NODE_ENV=production.');
  process.exit(1);
}

// Fixed ObjectIds so the demo records have the same ids after every seed run.
// kind: 1 = user, 2 = job, 3 = application, 4 = profile
const oid = (kind, n) => new mongoose.Types.ObjectId(`${kind}${String(n).padStart(23, '0')}`);
const daysFromNow = (days) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

const STUDENT_PASSWORD = 'Student@123';
const RECRUITER_PASSWORD = 'Recruiter@123';

const users = [
  { n: 1, name: 'Aarav Sharma', email: 'aarav.sharma@student.placemate.test', role: 'student', password: STUDENT_PASSWORD },
  { n: 2, name: 'Diya Patel', email: 'diya.patel@student.placemate.test', role: 'student', password: STUDENT_PASSWORD },
  { n: 3, name: 'Rohan Mehta', email: 'rohan.mehta@student.placemate.test', role: 'student', password: STUDENT_PASSWORD },
  { n: 4, name: 'Priya Nair', email: 'priya.nair@techcorp.test', role: 'recruiter', password: RECRUITER_PASSWORD },
  { n: 5, name: 'Karan Verma', email: 'karan.verma@innovatelabs.test', role: 'recruiter', password: RECRUITER_PASSWORD },
];

// Diya (user 2) intentionally has NO profile, to test the "complete your profile" rule.
const profiles = [
  { n: 1, user: 1, fullName: 'Aarav Sharma', email: 'aarav.sharma@student.placemate.test', phone: '9876543210', college: 'Punjab Institute of Technology', degreeBranch: 'B.Tech Computer Science', graduationYear: 2026, cgpa: 8.4, skills: ['Java', 'React', 'SQL', 'Selenium'], resumeUrl: 'https://example.com/resumes/aarav-sharma.pdf' },
  { n: 3, user: 3, fullName: 'Rohan Mehta', email: 'rohan.mehta@student.placemate.test', phone: '9123456780', college: 'Chandigarh College of Engineering', degreeBranch: 'B.Tech Information Technology', graduationYear: 2025, cgpa: 6.8, skills: ['Python', 'HTML', 'CSS'], resumeUrl: 'https://example.com/resumes/rohan-mehta.pdf' },
];

const jobs = [
  { n: 1, recruiter: 4, title: 'Software Development Engineer', company: 'TechCorp Solutions', location: 'Bengaluru', jobType: 'Full-time', minCgpa: 7.0, eligibleYears: [2025, 2026], deadlineDays: 45, openings: 5, skills: ['Java', 'Spring Boot', 'SQL'], description: 'Design, build and test scalable backend services for our enterprise products. You will work in an agile team with mentors from day one.' },
  { n: 2, recruiter: 4, title: 'Data Analyst Intern', company: 'TechCorp Solutions', location: 'Remote', jobType: 'Internship', minCgpa: 6.5, eligibleYears: [2026, 2027], deadlineDays: 30, openings: 3, skills: ['Python', 'SQL', 'Excel'], description: 'Clean data, build dashboards and present insights to business teams during a six-month paid internship.' },
  { n: 3, recruiter: 5, title: 'Frontend Developer', company: 'Innovate Labs', location: 'Hyderabad', jobType: 'Full-time', minCgpa: 7.5, eligibleYears: [2026], deadlineDays: 40, openings: 2, skills: ['React', 'JavaScript', 'CSS'], description: 'Build responsive, accessible user interfaces with React for our product suite and collaborate closely with designers.' },
  { n: 4, recruiter: 5, title: 'Backend Engineer (Node.js)', company: 'Innovate Labs', location: 'Pune', jobType: 'Full-time', minCgpa: 8.0, eligibleYears: [2025, 2026], deadlineDays: 50, openings: 4, skills: ['Node.js', 'Express', 'MongoDB'], description: 'Develop REST APIs and data pipelines using Node.js and MongoDB, with a strong focus on clean code and testing.' },
  { n: 5, recruiter: 4, title: 'QA Automation Engineer', company: 'TechCorp Solutions', location: 'Chandigarh', jobType: 'Full-time', minCgpa: 6.0, eligibleYears: [2025, 2026, 2027], deadlineDays: 35, openings: 6, skills: ['Selenium', 'Java', 'TestNG'], description: 'Create and maintain automated test suites with Selenium WebDriver, TestNG and Maven, and report quality metrics.' },
  { n: 6, recruiter: 5, title: 'Cloud Support Associate', company: 'Innovate Labs', location: 'Mohali', jobType: 'Contract', minCgpa: 6.5, eligibleYears: [2025, 2026], deadlineDays: 25, openings: 2, skills: ['Linux', 'AWS', 'Networking'], description: 'Provide first-line support for cloud customers, monitor systems and document solutions in a six-month contract role.' },
  { n: 7, recruiter: 4, title: 'Product Design Intern', company: 'TechCorp Solutions', location: 'Gurugram', jobType: 'Internship', minCgpa: 6.0, eligibleYears: [2026], deadlineDays: -10, openings: 1, skills: ['Figma', 'User Research'], description: 'Support the design team with wireframes and usability studies. (Demo job whose deadline has already passed.)' },
];

// Aarav (1) and Rohan (3) applications in different statuses.
const applications = [
  { n: 1, student: 1, job: 1, status: 'Applied', daysAgo: 3 },
  { n: 2, student: 1, job: 2, status: 'Under Review', daysAgo: 6 },
  { n: 3, student: 1, job: 3, status: 'Shortlisted', daysAgo: 9 },
  { n: 4, student: 1, job: 5, status: 'Selected', daysAgo: 14 },
  { n: 5, student: 3, job: 1, status: 'Rejected', daysAgo: 5 },
  { n: 6, student: 3, job: 5, status: 'Under Review', daysAgo: 4 },
  { n: 7, student: 3, job: 6, status: 'Applied', daysAgo: 1 },
];

async function seed() {
  await connectDB();

  if (process.argv.includes('--reset')) {
    await Promise.all([User.deleteMany({}), StudentProfile.deleteMany({}), Job.deleteMany({}), Application.deleteMany({})]);
    console.log('All collections cleared.');
  }

  for (const u of users) {
    const password = await bcrypt.hash(u.password, 10);
    await User.deleteOne({ email: u.email, _id: { $ne: oid(1, u.n) } }); // avoid duplicate-email clashes
    await User.findOneAndUpdate(
      { _id: oid(1, u.n) },
      { $set: { name: u.name, email: u.email, role: u.role, password } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  for (const p of profiles) {
    const { n, user, ...data } = p;
    await StudentProfile.findOneAndUpdate(
      { user: oid(1, user) },
      { $set: data, $setOnInsert: { _id: oid(4, n) } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  for (const j of jobs) {
    const { n, recruiter, deadlineDays, ...data } = j;
    await Job.findOneAndUpdate(
      { _id: oid(2, n) },
      { $set: { ...data, recruiter: oid(1, recruiter), deadline: daysFromNow(deadlineDays) } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  for (const a of applications) {
    await Application.findOneAndUpdate(
      { student: oid(1, a.student), job: oid(2, a.job) },
      { $set: { status: a.status, appliedAt: daysFromNow(-a.daysAgo) }, $setOnInsert: { _id: oid(3, a.n) } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`Seeded ${users.length} users, ${profiles.length} profiles, ${jobs.length} jobs, ${applications.length} applications.`);
  console.log('Students   password: ' + STUDENT_PASSWORD);
  console.log('Recruiters password: ' + RECRUITER_PASSWORD);
}

seed()
  .then(() => mongoose.disconnect())
  .catch(async (err) => {
    console.error('Seeding failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  });
