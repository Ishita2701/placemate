import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { applicationsApi } from '../services/api.js';
import { STATUSES, formatDate } from '../services/format.js';

export default function RecruiterApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    applicationsApi
      .forJob(jobId)
      .then((data) => {
        setJob(data.job);
        setApplicants(data.applicants);
      })
      .catch((err) => {
        if (err.status === 403) navigate('/unauthorized', { replace: true });
        else setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [jobId, navigate]);

  const handleStatusChange = async (applicant, status) => {
    setSuccess('');
    setError('');
    try {
      const data = await applicationsApi.updateStatus(applicant.id, status);
      setApplicants((list) => list.map((a) => (a.id === applicant.id ? { ...a, status } : a)));
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loading text="Loading applicants..." />;

  return (
    <div className="page">
      <Link to="/recruiter/dashboard" id="back-to-dashboard" data-testid="back-to-dashboard">Back to dashboard</Link>
      <h1 data-testid="page-heading">Applicants</h1>
      {job && <p className="lead" data-testid="applicants-job-title">{job.title} at {job.company}</p>}
      <Alert type="success" message={success} />
      <Alert type="error" message={error} />

      {job && applicants.length === 0 && <EmptyState title="No applicants yet" text="Students who apply for this job will appear here." />}
      {applicants.length > 0 && (
        <div className="table-wrap">
          <table className="table" id="applicants-table" data-testid="applicants-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">College and branch</th>
                <th scope="col">Grad. year</th>
                <th scope="col">CGPA</th>
                <th scope="col">Skills</th>
                <th scope="col">Resume</th>
                <th scope="col">Applied on</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((a) => (
                <tr key={a.id} data-testid="applicant-row" data-application-id={a.id}>
                  <td data-testid="applicant-name">{a.student.name}</td>
                  <td data-testid="applicant-email">{a.student.email}</td>
                  <td>{a.profile ? `${a.profile.college}, ${a.profile.degreeBranch}` : '-'}</td>
                  <td>{a.profile ? a.profile.graduationYear : '-'}</td>
                  <td data-testid="applicant-cgpa">{a.profile ? a.profile.cgpa : '-'}</td>
                  <td>{a.profile ? a.profile.skills.join(', ') : '-'}</td>
                  <td>{a.profile ? <a href={a.profile.resumeUrl} target="_blank" rel="noreferrer" data-testid="applicant-resume">View</a> : '-'}</td>
                  <td>{formatDate(a.appliedAt)}</td>
                  <td>
                    <label className="visually-hidden" htmlFor={`status-select-${a.id}`}>Status for {a.student.name}</label>
                    <select
                      id={`status-select-${a.id}`}
                      data-testid="status-select"
                      value={a.status}
                      onChange={(event) => handleStatusChange(a, event.target.value)}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
