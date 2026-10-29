import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import Loading from '../components/Loading.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { applicationsApi, jobsApi } from '../services/api.js';
import { formatDate } from '../services/format.js';

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [success, setSuccess] = useState('');
  const [applyError, setApplyError] = useState('');
  const [applying, setApplying] = useState(false);

  const isStudent = user && user.role === 'student';

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    jobsApi
      .get(id)
      .then(async (data) => {
        if (!active) return;
        setJob(data.job);
        if (isStudent) {
          const mine = await applicationsApi.mine();
          if (active) setApplication(mine.applications.find((a) => a.job.id === id) || null);
        }
      })
      .catch((err) => active && setLoadError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, isStudent]);

  const handleApply = async () => {
    setSuccess('');
    setApplyError('');
    setApplying(true);
    try {
      const data = await applicationsApi.apply(id);
      setApplication({ id: data.application.id, status: data.application.status });
      setSuccess('Application submitted successfully!');
    } catch (err) {
      setApplyError(err.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Loading text="Loading job..." />;
  if (loadError) {
    return (
      <div className="page">
        <h1 data-testid="page-heading">Job not found</h1>
        <Alert type="error" message={loadError} />
        <Link to="/jobs" className="btn btn-secondary" id="back-to-jobs" data-testid="back-to-jobs">Back to Jobs</Link>
      </div>
    );
  }

  return (
    <div className="page page-medium" data-job-id={job.id}>
      <Link to="/jobs" id="back-to-jobs" data-testid="back-to-jobs">Back to all jobs</Link>
      <div className="card">
        <h1 data-testid="job-title">{job.title}</h1>
        <p className="job-company" data-testid="job-company">{job.company}</p>
        <dl className="details-grid">
          <div><dt>Location</dt><dd data-testid="job-location">{job.location}</dd></div>
          <div><dt>Job type</dt><dd data-testid="job-type">{job.jobType}</dd></div>
          <div><dt>Minimum CGPA</dt><dd data-testid="job-min-cgpa">{job.minCgpa}</dd></div>
          <div><dt>Eligible graduation years</dt><dd data-testid="job-eligible-years">{job.eligibleYears.join(', ')}</dd></div>
          <div><dt>Application deadline</dt><dd data-testid="job-deadline">{formatDate(job.deadline)}</dd></div>
          <div><dt>Openings</dt><dd data-testid="job-openings">{job.openings}</dd></div>
        </dl>
        <h2>About the role</h2>
        <p data-testid="job-description" className="pre-line">{job.description}</p>
        <h2>Required skills</h2>
        <p data-testid="job-skills">{job.skills.join(', ')}</p>
        {job.isExpired && <p className="badge status-rejected" data-testid="job-closed-badge">Applications closed</p>}
      </div>

      <div className="card" id="apply-section" data-testid="apply-section">
        <h2>Apply</h2>
        <Alert type="success" message={success} />
        <Alert type="error" message={applyError}>
          {applyError.toLowerCase().includes('profile') && (
            <> <Link to="/student/profile" id="complete-profile-link" data-testid="complete-profile-link">Go to your profile</Link></>
          )}
        </Alert>

        {!user && (
          <p data-testid="login-to-apply">
            Please <Link to="/login" id="apply-login-link" data-testid="apply-login-link">log in</Link> as a student to apply for this job.
          </p>
        )}
        {user && !isStudent && <p data-testid="recruiter-apply-note">Recruiter accounts cannot apply for jobs.</p>}
        {isStudent && application && (
          <p>
            You have applied for this job. Current status: <StatusBadge status={application.status} />
          </p>
        )}
        {isStudent && (
          <button
            type="button"
            className="btn btn-primary"
            id="apply-button"
            data-testid="apply-button"
            onClick={handleApply}
            disabled={applying || Boolean(application) || job.isExpired}
          >
            {application ? 'Already Applied' : applying ? 'Applying...' : 'Apply Now'}
          </button>
        )}
      </div>
    </div>
  );
}
