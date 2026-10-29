import { Link } from 'react-router-dom';
import { formatDate } from '../services/format.js';

export default function JobCard({ job }) {
  return (
    <article className="job-card" data-testid="job-card" data-job-id={job.id} id={`job-card-${job.id}`}>
      <div className="job-card-head">
        <h3 data-testid="job-card-title">{job.title}</h3>
        {job.isExpired ? <span className="badge status-rejected" data-testid="job-closed-badge">Closed</span> : <span className="badge status-selected">Open</span>}
      </div>
      <p className="job-company" data-testid="job-card-company">{job.company}</p>
      <ul className="job-meta">
        <li data-testid="job-card-location">{job.location}</li>
        <li data-testid="job-card-type">{job.jobType}</li>
        <li data-testid="job-card-cgpa">Min CGPA {job.minCgpa}</li>
        <li data-testid="job-card-deadline">Apply by {formatDate(job.deadline)}</li>
      </ul>
      <p className="job-skills" data-testid="job-card-skills">{job.skills.join(', ')}</p>
      <Link className="btn btn-primary btn-small" id={`view-job-${job.id}`} data-testid="view-job-button" to={`/jobs/${job.id}`}>
        View Details
      </Link>
    </article>
  );
}
