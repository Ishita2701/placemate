import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();
  const dashboard = user ? (user.role === 'student' ? '/student/dashboard' : '/recruiter/dashboard') : null;

  return (
    <div className="page">
      <section className="hero" id="hero" data-testid="hero">
        <h1 data-testid="page-heading">Welcome to PlaceMate</h1>
        <p className="hero-text">
          One place where students find campus jobs and recruiters find talent. Build your profile, apply in a click and track every
          application from Applied to Selected.
        </p>
        <div className="hero-actions">
          {user ? (
            <Link to={dashboard} className="btn btn-primary" id="home-dashboard" data-testid="home-dashboard">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" id="home-register" data-testid="home-register">Create an Account</Link>
              <Link to="/login" className="btn btn-outline-light" id="home-login" data-testid="home-login">Log In</Link>
            </>
          )}
          <Link to="/jobs" className="btn btn-outline-light" id="home-browse-jobs" data-testid="home-browse-jobs">Browse Jobs</Link>
        </div>
      </section>

      <section className="feature-grid" aria-label="Features">
        <div className="card" data-testid="feature-students">
          <h2>For students</h2>
          <p>Complete one profile, search jobs by title, company, location and type, and apply only where you meet the eligibility rules.</p>
        </div>
        <div className="card" data-testid="feature-recruiters">
          <h2>For recruiters</h2>
          <p>Post openings with CGPA and graduation-year criteria, review applicants and move them through the hiring stages.</p>
        </div>
        <div className="card" data-testid="feature-tracking">
          <h2>Clear tracking</h2>
          <p>Every application shows its current status: Applied, Under Review, Shortlisted, Rejected or Selected.</p>
        </div>
      </section>
    </div>
  );
}
