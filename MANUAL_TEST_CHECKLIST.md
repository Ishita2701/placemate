# Manual test checklist (run these yourself in Chrome after `npm run seed:reset`)

Status key: [ ] = not yet run. Tick each box as you verify it.

## Auth
- [ ] Register with empty form -> field errors under each field
- [ ] Register with bad email, short password, mismatched confirm -> messages shown
- [ ] Register new student -> redirected to /login with success message
- [ ] Register again with the same email -> "already exists" error (409)
- [ ] Login with wrong password -> "Invalid email or password"
- [ ] Login as Aarav -> /student/dashboard; login as Priya -> /recruiter/dashboard
- [ ] Logout -> /login with logout message; Back button does not show protected data

## Access control
- [ ] Logged out: open /student/dashboard -> redirected to /login
- [ ] Student opens /recruiter/dashboard -> /unauthorized
- [ ] Recruiter opens /student/profile -> /unauthorized
- [ ] Open /nope -> custom 404 page

## Student profile
- [ ] Diya: empty profile saves nothing until all fields valid; bad phone/year/CGPA/URL show errors
- [ ] Save valid profile -> success message; reload page -> data is loaded
- [ ] Aarav: change phone, save, reload -> updated value

## Jobs
- [ ] /jobs shows 7 jobs; "7 jobs found"
- [ ] Search "tech" -> only TechCorp jobs; search "zzz" -> empty state
- [ ] Location = Remote -> 1 job; Job type = Internship -> 2 jobs; CGPA 6.5 -> jobs with min CGPA <= 6.5
- [ ] Combine search + filters; Clear Filters restores all 7
- [ ] Open a job -> details page; Product Design Intern shows "Applications closed" and a disabled Apply button

## Applying
- [ ] Logged out: job page shows "log in to apply"
- [ ] Diya (no profile) clicks Apply -> error asking to complete profile
- [ ] Rohan applies to Frontend Developer -> not eligible error (CGPA/year)
- [ ] Aarav applies to Backend Engineer (Node.js) (CGPA 8.4 >= 8.0) -> success; button becomes "Already Applied"
- [ ] Aarav's job 1 page shows "Already Applied" (duplicate prevented); /student/applications lists all with statuses

## Recruiter
- [ ] Priya dashboard: 4 jobs, 3 active, applicant total matches the table
- [ ] Add job with empty form -> errors; add valid job -> appears in the table
- [ ] Edit own job -> changes saved; Delete -> dialog -> Cancel keeps it, Delete removes it and shows success message
- [ ] Open /recruiter/jobs/200000000000000000000003/edit as Priya (owned by Karan) -> /unauthorized
- [ ] Applicants page for job 1: change Aarav's status to "Selected" -> success message; log in as Aarav -> status updated
