import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { applicationsApi } from '../services/api.js';
import { formatDate } from '../services/format.js';

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    applicationsApi
      .mine()
      .then((data) => setApplications(data.applications))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h1 data-testid="page-heading">My Applications</h1>
      <Alert type="error" message={error} />
      {loading ? (
        <Loading text="Loading applications..." />
      ) : applications.length === 0 ? (
        <EmptyState title="No applications yet" text="You have not applied for any jobs yet.">
          <Link to="/jobs" className="btn btn-primary" id="empty-browse-jobs" data-testid="empty-browse-jobs">Browse Jobs</Link>
        </EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="table" id="applications-table" data-testid="applications-table">
            <thead>
              <tr>
                <th scope="col">Job title</th>
                <th scope="col">Company</th>
                <th scope="col">Applied on</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} data-testid="application-row" data-application-id={app.id} data-job-id={app.job.id}>
                  <td data-testid="application-job-title"><Link to={`/jobs/${app.job.id}`}>{app.job.title}</Link></td>
                  <td data-testid="application-company">{app.job.company}</td>
                  <td data-testid="application-date">{formatDate(app.appliedAt)}</td>
                  <td><StatusBadge status={app.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
