import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import Alert from '../components/Alert.jsx';
import JobCard from '../components/JobCard.jsx';
import Loading from '../components/Loading.jsx';
import FormField from '../components/FormField.jsx';
import { jobsApi } from '../services/api.js';
import { JOB_TYPES } from '../services/format.js';

const NO_FILTERS = { search: '', location: '', jobType: '', cgpa: '' };

export default function Jobs() {
  const [filters, setFilters] = useState(NO_FILTERS);
  const [locations, setLocations] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cgpaNumber = Number(filters.cgpa);
  const cgpaInvalid = filters.cgpa !== '' && (Number.isNaN(cgpaNumber) || cgpaNumber < 0 || cgpaNumber > 10);

  useEffect(() => {
    jobsApi.meta().then((data) => setLocations(data.locations)).catch(() => {});
  }, []);

  // Runs on every filter change. "active" ignores answers that arrive late.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    jobsApi
      .list({ ...filters, cgpa: cgpaInvalid ? '' : filters.cgpa })
      .then((data) => active && setJobs(data.jobs))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [filters, cgpaInvalid]);

  const handleChange = (event) => setFilters({ ...filters, [event.target.name]: event.target.value });
  const filtersActive = Object.values(filters).some((value) => value !== '');

  return (
    <div className="page">
      <h1 data-testid="page-heading">Browse Jobs</h1>

      <form className="card filters" id="job-filters" data-testid="job-filters" onSubmit={(event) => event.preventDefault()} noValidate>
        <FormField id="job-search" label="Search by title or company" type="search" name="search" value={filters.search} onChange={handleChange} placeholder="e.g. Software or TechCorp" />
        <FormField
          id="job-location-filter"
          label="Location"
          as="select"
          name="location"
          value={filters.location}
          onChange={handleChange}
          options={[{ value: '', label: 'All locations' }, ...locations.map((l) => ({ value: l, label: l }))]}
        />
        <FormField
          id="job-type-filter"
          label="Job type"
          as="select"
          name="jobType"
          value={filters.jobType}
          onChange={handleChange}
          options={[{ value: '', label: 'All job types' }, ...JOB_TYPES.map((t) => ({ value: t, label: t }))]}
        />
        <FormField
          id="job-cgpa-filter"
          label="My CGPA"
          type="number"
          name="cgpa"
          step="0.1"
          min="0"
          max="10"
          value={filters.cgpa}
          onChange={handleChange}
          error={cgpaInvalid ? 'CGPA must be between 0 and 10' : ''}
          hint="Shows jobs whose minimum CGPA is at most this value"
        />
        <button type="button" className="btn btn-secondary" id="clear-filters-button" data-testid="clear-filters-button" onClick={() => setFilters(NO_FILTERS)} disabled={!filtersActive}>
          Clear Filters
        </button>
      </form>

      <Alert type="error" message={error} />

      <div id="jobs-results" data-testid="jobs-results" aria-busy={loading} data-loading={loading ? 'true' : 'false'}>
        {loading ? (
          <Loading text="Loading jobs..." />
        ) : (
          !error && (
            <>
              <p className="result-count" id="job-count" data-testid="job-count" data-count={jobs.length}>
                {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
              </p>
              {jobs.length === 0 ? (
                <EmptyState title="No jobs found" text="No jobs match your search or filters. Try different keywords or clear the filters." />
              ) : (
                <div className="job-grid" data-testid="job-list">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}
