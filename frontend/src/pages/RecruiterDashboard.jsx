import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { jobsApi } from '../services/api.js';
import { formatDate } from '../services/format.js';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadJobs = () =>
    jobsApi
      .mine()
      .then((data) => setJobs(data.jobs))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    loadJobs();
  }, []);

  const confirmDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const data = await jobsApi.remove(jobToDelete.id);
      setSuccess(data.message);
      setJobToDelete(null);
      await loadJobs();
    } catch (err) {
      setError(err.message);
      setJobToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loading />;

  const totalApplicants = jobs.reduce((sum, job) => sum + job.applicantCount, 0);
  const activeJobs = jobs.filter((job) => !job.isExpired).length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 data-testid="page-heading">Recruiter Dashboard</h1>
          <p className="lead" data-testid="welcome-message">Welcome back, {user.name}.</p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn btn-primary" id="add-job-button" data-testid="add-job-button">Add New Job</Link>
      </div>

      <Alert type="success" message={success} />
      <Alert type="error" message={error} />

      <div className="stat-grid" data-testid="recruiter-stats">
        <div className="stat" data-testid="stat-total-jobs"><span className="stat-value" data-testid="stat-total-jobs-value">{jobs.length}</span><span>Total jobs posted</span></div>
        <div className="stat" data-testid="stat-active-jobs"><span className="stat-value" data-testid="stat-active-jobs-value">{activeJobs}</span><span>Active jobs</span></div>
        <div className="stat" data-testid="stat-total-applicants"><span className="stat-value" data-testid="stat-total-applicants-value">{totalApplicants}</span><span>Total applicants</span></div>
      </div>

      <h2>Your job postings</h2>
      {jobs.length === 0 ? (
        <EmptyState title="No job postings yet" text="Create your first job posting to start receiving applications." />
      ) : (
        <div className="table-wrap">
          <table className="table" id="recruiter-jobs-table" data-testid="recruiter-jobs-table">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Company</th>
                <th scope="col">Location</th>
                <th scope="col">Deadline</th>
                <th scope="col">Applicants</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} data-testid="recruiter-job-row" data-job-id={job.id}>
                  <td data-testid="recruiter-job-title">{job.title}</td>
                  <td data-testid="recruiter-job-company">{job.company}</td>
                  <td>{job.location}</td>
                  <td>
                    {formatDate(job.deadline)} {job.isExpired && <span className="badge status-rejected">Closed</span>}
                  </td>
                  <td data-testid="recruiter-job-applicants">{job.applicantCount}</td>
                  <td className="actions">
                    <Link to={`/recruiter/applicants/${job.id}`} className="btn btn-secondary btn-small" id={`view-applicants-${job.id}`} data-testid="view-applicants-button">Applicants</Link>
                    <Link to={`/recruiter/jobs/${job.id}/edit`} className="btn btn-secondary btn-small" id={`edit-job-${job.id}`} data-testid="edit-job-button">Edit</Link>
                    <button type="button" className="btn btn-danger btn-small" id={`delete-job-${job.id}`} data-testid="delete-job-button" onClick={() => setJobToDelete(job)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {jobToDelete && (
        <ConfirmDialog
          title="Delete this job?"
          message={`"${jobToDelete.title}" and all its applications will be permanently deleted.`}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setJobToDelete(null)}
        />
      )}
    </div>
  );
}
