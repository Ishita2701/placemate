import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Loading from '../components/Loading.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { applicationsApi, profileApi } from '../services/api.js';
import { STATUSES, formatDate } from '../services/format.js';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([profileApi.get(), applicationsApi.mine()])
      .then(([p, a]) => {
        setProfile(p.profile);
        setApplications(a.applications);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const countOf = (status) => applications.filter((a) => a.status === status).length;

  return (
    <div className="page">
      <h1 data-testid="page-heading">Student Dashboard</h1>
      <p className="lead" data-testid="welcome-message">Welcome back, {user.name}.</p>
      <Alert type="error" message={error} />

      <div className="card" data-testid="profile-status-card">
        {profile ? (
          <p data-testid="profile-status">Your profile is complete. You can apply for jobs.</p>
        ) : (
          <p data-testid="profile-status">Your profile is incomplete. Complete it before applying for jobs.</p>
        )}
        <Link to="/student/profile" className="btn btn-primary btn-small" id="dashboard-profile-link" data-testid="dashboard-profile-link">
          {profile ? 'Update Profile' : 'Complete Profile'}
        </Link>
      </div>

      <h2>Your applications</h2>
      <div className="stat-grid" data-testid="application-stats">
        <div className="stat" data-testid="stat-total"><span className="stat-value" data-testid="stat-total-value">{applications.length}</span><span>Total</span></div>
        {STATUSES.map((status) => (
          <div className="stat" key={status} data-testid={`stat-${status.toLowerCase().replace(/\s+/g, '-')}`}>
            <span className="stat-value">{countOf(status)}</span>
            <span>{status}</span>
          </div>
        ))}
      </div>

      <h2>Recent applications</h2>
      {applications.length === 0 ? (
        <p data-testid="no-recent-applications">You have not applied for any jobs yet.</p>
      ) : (
        <ul className="plain-list" data-testid="recent-applications">
          {applications.slice(0, 3).map((app) => (
            <li key={app.id} data-testid="recent-application" data-application-id={app.id}>
              <span>{app.job.title} at {app.job.company} ({formatDate(app.appliedAt)})</span>
              <StatusBadge status={app.status} />
            </li>
          ))}
        </ul>
      )}

      <div className="button-row">
        <Link to="/jobs" className="btn btn-primary" id="dashboard-browse-jobs" data-testid="dashboard-browse-jobs">Browse Jobs</Link>
        <Link to="/student/applications" className="btn btn-secondary" id="dashboard-applications" data-testid="dashboard-applications">View All Applications</Link>
      </div>
    </div>
  );
}
