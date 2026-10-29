# PlaceMate - Student Placement Portal

A full-stack placement portal for a college semester project. Students build a profile, search and apply for jobs and track
applications. Recruiters post jobs, review applicants and update statuses. The UI is built so it can be automated later with
**Selenium WebDriver + Java + TestNG + Maven**.

## Features
- Register / login / logout with role-based access (student, recruiter) and bcrypt-hashed passwords
- Student profile (loads existing data, validates, saves)
- Job search (title/company), filters (location, job type, CGPA), clear-filters button, empty state
- Job details page and Apply button (profile, eligibility, deadline and duplicate checks on the server)
- Student applications table with status; recruiter dashboard with stats, job CRUD (in-app delete confirmation) and applicants page with status dropdown
- Custom Access Denied and 404 pages

## Tech stack
React 18 + Vite (JavaScript), React Router 6, CSS, Node.js + Express 4, MongoDB + Mongoose 8, JWT, bcryptjs.

## Prerequisites
- Node.js 18+ (check with `node -v`)
- MongoDB Community Server running locally (default `mongodb://127.0.0.1:27017`), or a free MongoDB Atlas connection string
- Google Chrome (for demo and later Selenium tests)

## Setup (two terminals)

### Terminal 1 - backend (http://localhost:5000)
```bash
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
# edit .env: set JWT_SECRET (any long random text) and MONGO_URI if needed
npm run seed                # demo data
npm run dev                 # starts the API with auto-reload
```

### Terminal 2 - frontend (http://localhost:5173)
```bash
cd frontend
npm install
cp .env.example .env        # only needed if the backend is NOT on http://localhost:5000
npm run dev
```
Open http://localhost:5173 in Chrome. Ports: backend **5000**, frontend **5173** (fixed; Vite stops instead of choosing another port).
CORS allows `http://localhost:5173` and `http://127.0.0.1:5173` (change `CLIENT_URL` in `backend/.env` if needed).

### Environment variables (`backend/.env`)
| Variable | Meaning |
|---|---|
| `PORT` | API port (5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign login tokens (required) |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1d` |
| `CLIENT_URL` | Comma-separated allowed frontend origins |
| `NODE_ENV` | `development`. The seed script **refuses to run** when this is `production` |

## Demo accounts (created by `npm run seed`)
| Role | Email | Password | Notes |
|---|---|---|---|
| Student | `aarav.sharma@student.placemate.test` | `Student@123` | Profile complete, CGPA 8.4, graduating 2026, has 4 applications (Applied, Under Review, Shortlisted, Selected) |
| Student | `diya.patel@student.placemate.test` | `Student@123` | **No profile** - use to test "complete your profile before applying" |
| Student | `rohan.mehta@student.placemate.test` | `Student@123` | Profile complete, CGPA 6.8, graduating 2025, 3 applications (Rejected, Under Review, Applied) |
| Recruiter | `priya.nair@techcorp.test` | `Recruiter@123` | Owns jobs 1, 2, 5, 7 (TechCorp Solutions) |
| Recruiter | `karan.verma@innovatelabs.test` | `Recruiter@123` | Owns jobs 3, 4, 6 (Innovate Labs) |

## Demo jobs (fixed ids, same after every seed)
| Id | Title | Location | Type | Min CGPA | Years | Notes |
|---|---|---|---|---|---|---|
| `200000000000000000000001` | Software Development Engineer | Bengaluru | Full-time | 7.0 | 2025, 2026 | |
| `200000000000000000000002` | Data Analyst Intern | Remote | Internship | 6.5 | 2026, 2027 | Rohan (2025) is not eligible |
| `200000000000000000000003` | Frontend Developer | Hyderabad | Full-time | 7.5 | 2026 | Rohan (6.8, 2025) is not eligible |
| `200000000000000000000004` | Backend Engineer (Node.js) | Pune | Full-time | 8.0 | 2025, 2026 | Rohan not eligible (CGPA) |
| `200000000000000000000005` | QA Automation Engineer | Chandigarh | Full-time | 6.0 | 2025-2027 | |
| `200000000000000000000006` | Cloud Support Associate | Mohali | Contract | 6.5 | 2025, 2026 | |
| `200000000000000000000007` | Product Design Intern | Gurugram | Internship | 6.0 | 2026 | **Deadline already passed** (closed) |

Seeded user, job and application ids are fixed too (`1...` users, `2...` jobs, `3...` applications), so ids do not change between resets.
Deadlines are relative to the day you run the seed (e.g. +45 days), so re-run `npm run seed` if the demo data gets old.

## Seeding and resetting demo data
```bash
cd backend
npm run seed          # create/update demo data. Safe to run repeatedly, never creates duplicates
npm run seed:reset    # WIPES users, profiles, jobs and applications, then seeds again (use before each test run)
```
Re-running `npm run seed` also restores demo passwords, jobs and application statuses, but it does not delete extra records you created.

## Pages (frontend routes)
| Route | Access |
|---|---|
| `/` | Public home page |
| `/register`, `/login` | Public |
| `/jobs`, `/jobs/:id` | Public (Apply needs a student login) |
| `/student/dashboard`, `/student/profile`, `/student/applications` | Student only |
| `/recruiter/dashboard`, `/recruiter/jobs/new`, `/recruiter/jobs/:id/edit`, `/recruiter/applicants/:jobId` | Recruiter only |
| `/unauthorized` | Access denied page (wrong role) |
| anything else | Custom 404 page |

Logged-out users who open a protected page are sent to `/login`; the wrong role is sent to `/unauthorized`.

## API endpoints (base `http://localhost:5000/api`)
Responses are JSON: `{ success, message?, ... }`. Errors: `{ success: false, message, errors? }` (`errors` maps field name to message).

| Method | Endpoint | Access | Success | Errors |
|---|---|---|---|---|
| GET | `/health` | public | 200 | |
| POST | `/auth/register` | public | 201 | 400 validation, 409 duplicate email |
| POST | `/auth/login` | public | 200 + token | 400 validation, 401 wrong credentials |
| GET | `/auth/me` | logged in | 200 | 401 |
| GET | `/profile` | student | 200 (`profile` is `null` if not saved yet) | 401, 403 |
| PUT | `/profile` | student | 200 | 400, 401, 403 |
| GET | `/jobs?search=&location=&jobType=&cgpa=` | public | 200 | |
| GET | `/jobs/meta` | public | 200 (locations, job types) | |
| GET | `/jobs/mine` | recruiter | 200 (with `applicantCount`) | 401, 403 |
| GET | `/jobs/:id` | public | 200 | 404 |
| POST | `/jobs` | recruiter | 201 | 400, 401, 403 |
| PUT | `/jobs/:id` | owner recruiter | 200 | 400, 401, 403 (not owner / student), 404 |
| DELETE | `/jobs/:id` | owner recruiter | 200 (also deletes its applications) | 401, 403, 404 |
| POST | `/applications` `{ jobId }` | student | 201 | 400 (profile incomplete / deadline passed), 403 (not eligible), 404, 409 (already applied) |
| GET | `/applications/mine` | student | 200 | 401, 403 |
| GET | `/applications/job/:jobId` | owner recruiter | 200 (applicants + profiles) | 401, 403, 404 |
| PATCH | `/applications/:id/status` `{ status }` | owner recruiter | 200 | 400, 401, 403, 404 |

Protected requests send the header `Authorization: Bearer <token>`. The frontend keeps the token in `localStorage` (`placemate_token`) and clears it on logout.

## Selenium-readiness (for your later test project)
- Every input, button, link, form and dropdown has a unique `id` **and** a `data-testid`. Form fields use the same value for both, e.g. `register-name`, `register-email`, `register-password`, `register-confirmPassword`, `register-role`, `register-submit`, `login-email`, `login-password`, `login-submit`, `logout-button`, `job-search`, `job-location-filter`, `job-type-filter`, `job-cgpa-filter`, `clear-filters-button`, `apply-button`, `add-job-button`, `edit-job-button`, `delete-job-button`, `save-profile-button`, `save-job-button`.
- Profile fields: `profile-fullName`, `profile-email`, `profile-phone`, `profile-college`, `profile-degreeBranch`, `profile-graduationYear`, `profile-cgpa`, `profile-skills`, `profile-resumeUrl`.
- Job form fields: `job-title`, `job-company`, `job-location`, `job-jobType`, `job-min-cgpa`, `job-openings`, `job-deadline`, `job-description`, `job-skills`, `job-year-2025` ... `job-year-2028`.
- Field errors: `<field-id>-error` (e.g. `login-email-error`). Page alerts: `success-message` / `error-message`. Each page has one `h1` with `data-testid="page-heading"`.
- Repeated items: `job-card` (with `data-job-id`), `application-row` (with `data-application-id` and `data-job-id`), `recruiter-job-row`, `applicant-row`. Status text: `application-status`. Recruiter status dropdown: `status-select` (id `status-select-<applicationId>`); changing it saves immediately.
- Waiting hooks: `loading-indicator` is shown while data loads and removed afterwards; `jobs-results` has `data-loading="true|false"`; `job-count` has `data-count` and text such as "3 jobs found"; `empty-state` appears when there are no results. Wait on these with `WebDriverWait`; no `Thread.sleep` is needed.
- Delete uses an in-app dialog (`confirm-dialog`, `confirm-delete-button`, `cancel-delete-button`), not a browser alert. Forms use `noValidate`, so validation messages come from the app and are always visible. There are no animations or transitions.
- Search and filters run on every change (no debounce), so after typing, wait until `job-count` shows the new count.
- Logout redirects to `/login` with the message "You have been logged out successfully." Registration redirects to `/login` with "Registration successful. Please log in."

## Common errors and fixes
| Problem | Fix |
|---|---|
| `Could not connect to MongoDB` | Start MongoDB (`mongod`, or the MongoDB service) and check `MONGO_URI` in `backend/.env` |
| `JWT_SECRET is missing` | Create `backend/.env` from `.env.example` and set `JWT_SECRET` |
| `EADDRINUSE` on 5000 or 5173 | Another program uses the port. Stop it or change `PORT` (then set `VITE_API_URL` in `frontend/.env`) |
| Page says "Cannot connect to the server" | The backend is not running, or `VITE_API_URL` is wrong. Restart the frontend after changing `.env` |
| CORS error in the browser console | Add your frontend origin to `CLIENT_URL` in `backend/.env` and restart the backend |
| Login fails for demo users | Run `npm run seed` (or `npm run seed:reset`) in `backend` |
| `Refusing to seed ... production` | Set `NODE_ENV=development` in `backend/.env` |
| Unexpected data during testing | `npm run seed:reset`, then log out/clear the browser's local storage |
