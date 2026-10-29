import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import StudentProfile from './pages/StudentProfile.jsx';
import Jobs from './pages/Jobs.jsx';
import JobDetails from './pages/JobDetails.jsx';
import StudentApplications from './pages/StudentApplications.jsx';
import RecruiterDashboard from './pages/RecruiterDashboard.jsx';
import JobForm from './pages/JobForm.jsx';
import RecruiterApplicants from './pages/RecruiterApplicants.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const student = (page) => <ProtectedRoute role="student">{page}</ProtectedRoute>;
  const recruiter = (page) => <ProtectedRoute role="recruiter">{page}</ProtectedRoute>;

  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content" id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/student/dashboard" element={student(<StudentDashboard />)} />
          <Route path="/student/profile" element={student(<StudentProfile />)} />
          <Route path="/student/applications" element={student(<StudentApplications />)} />
          <Route path="/recruiter/dashboard" element={recruiter(<RecruiterDashboard />)} />
          <Route path="/recruiter/jobs/new" element={recruiter(<JobForm mode="create" />)} />
          <Route path="/recruiter/jobs/:id/edit" element={recruiter(<JobForm mode="edit" />)} />
          <Route path="/recruiter/applicants/:jobId" element={recruiter(<RecruiterApplicants />)} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
