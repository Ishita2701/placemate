import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login', { state: { message: 'You have been logged out successfully.' } });
    logout();
  };

  return (
    <header className="navbar" id="navbar" data-testid="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" id="nav-brand" data-testid="nav-brand">
          PlaceMate
        </Link>
        <nav aria-label="Main navigation">
          <ul className="nav-links">
            <li><NavLink to="/" end id="nav-home" data-testid="nav-home">Home</NavLink></li>
            <li><NavLink to="/jobs" id="nav-jobs" data-testid="nav-jobs">Jobs</NavLink></li>
            {!user && (
              <>
                <li><NavLink to="/login" id="nav-login" data-testid="nav-login">Login</NavLink></li>
                <li><NavLink to="/register" id="nav-register" data-testid="nav-register">Register</NavLink></li>
              </>
            )}
            {user && user.role === 'student' && (
              <>
                <li><NavLink to="/student/dashboard" id="nav-dashboard" data-testid="nav-dashboard">Dashboard</NavLink></li>
                <li><NavLink to="/student/profile" id="nav-profile" data-testid="nav-profile">My Profile</NavLink></li>
                <li><NavLink to="/student/applications" id="nav-applications" data-testid="nav-applications">My Applications</NavLink></li>
              </>
            )}
            {user && user.role === 'recruiter' && (
              <>
                <li><NavLink to="/recruiter/dashboard" id="nav-dashboard" data-testid="nav-dashboard">Dashboard</NavLink></li>
                <li><NavLink to="/recruiter/jobs/new" id="nav-add-job" data-testid="nav-add-job">Post a Job</NavLink></li>
              </>
            )}
            {user && (
              <>
                <li className="nav-user" id="nav-user-name" data-testid="nav-user-name">{user.name}</li>
                <li>
                  <button type="button" className="btn btn-outline btn-small" id="logout-button" data-testid="logout-button" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
