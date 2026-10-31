# PlaceMate – Student Placement Portal

A full-stack Student Placement Portal designed to simplify the college placement process. PlaceMate connects students and recruiters through a centralized platform where students can create profiles, explore job opportunities, apply for suitable positions, and track their application status. Recruiters can post job openings, manage listings, review applicants, and update application statuses.

## Features

### 1. User Authentication
- Student and recruiter registration.
- Secure login and logout.
- Role-based access control.
- Password hashing using bcrypt.
- JWT-based authentication.

### 2. Student Dashboard
- View and manage student profiles.
- Add academic and personal information.
- Add skills and resume URL.
- Search and explore available jobs.
- Apply for eligible job opportunities.
- Track application statuses.

### 3. Job Management
- Browse available job opportunities.
- Search jobs by title and company.
- Filter jobs by location, job type, and CGPA.
- View detailed job descriptions.
- Check eligibility requirements and application deadlines.

### 4. Recruiter Dashboard
- View dashboard statistics.
- Create new job postings.
- Edit and delete job listings.
- View applicants for posted jobs.
- Review student profiles.
- Update application statuses.

### 5. Additional Features
- Custom 404 page.
- Access Denied page.
- Form validation.
- Duplicate application prevention.
- Job eligibility verification.
- Application deadline validation.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React 18, JavaScript |
| Build Tool | Vite |
| Routing | React Router 6 |
| Styling | CSS |
| Backend | Node.js |
| Backend Framework | Express.js 4 |
| Database | MongoDB |
| ODM | Mongoose 8 |
| Authentication | JWT |
| Password Security | bcryptjs |
| Version Control | Git and GitHub |

## Project Structure

```text
placemate/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## Prerequisites

Before running the project, install:

- Node.js 18 or above.
- npm (Node Package Manager).
- MongoDB Community Server or a MongoDB Atlas account.
- Visual Studio Code.
- A modern web browser.

Check your Node.js and npm versions:

```bash
node -v
npm -v
```

## Installation and Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/Ishita2701/placemate.git
cd placemate
```

### Step 2: Backend Setup

Open a terminal:

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example`.

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure the environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

For MongoDB Atlas, replace the MONGO_URI value with your Atlas connection string.

Start the backend:

```bash
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

### Step 3: Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

If required, create a `.env` file using `.env.example` and configure the backend API URL.

For local development, the frontend uses:

```text
http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Open the frontend URL in your browser to access PlaceMate.

## Environment Variables

### Backend Environment Variables

| Variable | Description |
|---|---|
| PORT | Backend server port |
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | Secret key used for JWT authentication |
| JWT_EXPIRES_IN | JWT token expiration duration |
| CLIENT_URL | Allowed frontend origins for CORS |
| NODE_ENV | Application environment |

**Note:** Never upload actual `.env` files, database passwords, or secret keys to GitHub.

## Database

PlaceMate uses MongoDB as its database and Mongoose for database operations.

The database stores information related to:

- User accounts.
- Student profiles.
- Job postings.
- Student applications.

MongoDB can be configured using either a local MongoDB server or MongoDB Atlas.

## Demo Accounts

The following accounts are available when the backend demo seed script is executed.

| Role | Email | Password |
|---|---|---|
| Student | aarav.sharma@student.placemate.test | Student@123 |
| Student | diya.patel@student.placemate.test | Student@123 |
| Student | rohan.mehta@student.placemate.test | Student@123 |
| Recruiter | priya.nair@techcorp.test | Recruiter@123 |
| Recruiter | karan.verma@innovatelabs.test | Recruiter@123 |

These are demonstration credentials for local seeded data. Do not use them as production accounts.

## Running the Database Seed Script

To create or update demonstration data:

```bash
cd backend
npm run seed
```

To reset the demo database and generate fresh demonstration data:

```bash
npm run seed:reset
```

**Warning:** The reset command deletes existing users, profiles, jobs, and applications before generating new demo data. Use it only with a database you are comfortable resetting.

## Application Pages

| Page | Description |
|---|---|
| Home | Public landing page |
| Register | New user registration |
| Login | User authentication |
| Jobs | Browse available jobs |
| Job Details | View job information |
| Student Dashboard | Student account overview |
| Student Profile | Manage student information |
| My Applications | Track application status |
| Recruiter Dashboard | Recruiter account overview |
| Add Job | Create job postings |
| Edit Job | Update job information |
| Applicants | View applicants and update statuses |
| Unauthorized | Access denied page |
| 404 | Page not found |

## API Endpoints

Base URL:

```text
http://localhost:5000/api
```

### Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/register | Register a new user |
| POST | /auth/login | Authenticate user |
| GET | /auth/me | Get logged-in user details |

### Student Profile APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | /profile | Retrieve student profile |
| PUT | /profile | Create or update student profile |

### Job APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | /jobs | Retrieve and search jobs |
| GET | /jobs/meta | Retrieve filter options |
| GET | /jobs/:id | Retrieve job details |
| GET | /jobs/mine | Retrieve recruiter job listings |
| POST | /jobs | Create a job |
| PUT | /jobs/:id | Update a job |
| DELETE | /jobs/:id | Delete a job |

### Application APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | /applications | Apply for a job |
| GET | /applications/mine | View student applications |
| GET | /applications/job/:jobId | View job applicants |
| PATCH | /applications/:id/status | Update application status |

Protected API requests require a JWT token in the Authorization header.

```text
Authorization: Bearer <token>
```

## Application Workflow

1. A student registers or logs into PlaceMate.
2. The student completes their profile.
3. The student explores available job opportunities.
4. The system checks eligibility requirements.
5. The student applies for a suitable job.
6. The recruiter views the submitted applications.
7. The recruiter reviews applicants and updates their status.
8. The student tracks the updated application status through the dashboard.

## Common Issues and Solutions

| Issue | Solution |
|---|---|
| MongoDB connection error | Check MongoDB service and MONGO_URI |
| JWT_SECRET missing | Configure JWT_SECRET in backend `.env` |
| Port already in use | Stop the existing process or change the port |
| Frontend cannot connect to backend | Check the API URL |
| CORS error | Configure the correct frontend URL in CLIENT_URL |
| Demo login not working | Run the backend seed script |

## Future Enhancements

- Resume file upload functionality.
- Email notifications for application updates.
- Advanced job recommendation system.
- Analytics and placement reports.
- Improved recruiter and student dashboards.

## Author

**PlaceMate – Student Placement Portal**

Developed as a Full Stack Development academic project.

**GitHub Repository:** https://github.com/Ishita2701/placemate

---

