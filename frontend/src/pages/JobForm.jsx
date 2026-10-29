import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import FormField from '../components/FormField.jsx';
import Loading from '../components/Loading.jsx';
import { jobsApi } from '../services/api.js';
import { GRADUATION_YEARS, JOB_TYPES, toDateInput } from '../services/format.js';

const EMPTY = {
  title: '', company: '', description: '', skills: '', location: '', jobType: '',
  minCgpa: '0', eligibleYears: [], deadline: '', openings: '1',
};

function validate(form, originalDeadline) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Job title is required';
  else if (form.title.trim().length < 3) errors.title = 'Job title must be at least 3 characters';
  if (!form.company.trim()) errors.company = 'Company name is required';
  if (!form.description.trim()) errors.description = 'Job description is required';
  else if (form.description.trim().length < 20) errors.description = 'Description must be at least 20 characters';
  if (!form.skills.trim()) errors.skills = 'Enter at least one required skill';
  if (!form.location.trim()) errors.location = 'Location is required';
  if (!form.jobType) errors.jobType = 'Please select a job type';
  if (form.minCgpa === '' || Number.isNaN(Number(form.minCgpa)) || Number(form.minCgpa) < 0 || Number(form.minCgpa) > 10) errors.minCgpa = 'Minimum CGPA must be between 0 and 10';
  if (form.eligibleYears.length === 0) errors.eligibleYears = 'Select at least one eligible graduation year';
  const openings = Number(form.openings);
  if (!Number.isInteger(openings) || openings < 1) errors.openings = 'Openings must be a whole number of at least 1';
  if (!form.deadline) errors.deadline = 'Application deadline is required';
  else if (form.deadline !== originalDeadline && form.deadline < new Date().toISOString().slice(0, 10)) errors.deadline = 'Deadline cannot be in the past';
  return errors;
}

export default function JobForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(isEdit ? null : EMPTY);
  const [originalDeadline, setOriginalDeadline] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    jobsApi
      .get(id)
      .then((data) => {
        const job = data.job;
        setOriginalDeadline(toDateInput(job.deadline));
        setForm({
          title: job.title, company: job.company, description: job.description, skills: job.skills.join(', '),
          location: job.location, jobType: job.jobType, minCgpa: String(job.minCgpa), eligibleYears: job.eligibleYears,
          deadline: toDateInput(job.deadline), openings: String(job.openings),
        });
      })
      .catch((err) => setLoadError(err.message));
  }, [id, isEdit]);

  if (loadError) {
    return (
      <div className="page">
        <h1 data-testid="page-heading">Edit Job</h1>
        <Alert type="error" message={loadError} />
        <Link to="/recruiter/dashboard" className="btn btn-secondary" id="back-to-dashboard" data-testid="back-to-dashboard">Back to Dashboard</Link>
      </div>
    );
  }
  if (!form) return <Loading text="Loading job..." />;

  const handleChange = (event) => setForm({ ...form, [event.target.name.replace('job-', '').replace(/-([a-z])/g, (m, c) => c.toUpperCase())]: event.target.value });

  const toggleYear = (year) => {
    const years = form.eligibleYears.includes(year) ? form.eligibleYears.filter((y) => y !== year) : [...form.eligibleYears, year];
    setForm({ ...form, eligibleYears: years.sort() });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const found = validate(form, originalDeadline);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const payload = { ...form, minCgpa: Number(form.minCgpa), openings: Number(form.openings) };
      if (isEdit) await jobsApi.update(id, payload);
      else await jobsApi.create(payload);
      navigate('/recruiter/dashboard');
    } catch (err) {
      setErrors(err.errors || {});
      setError(err.message);
      if (err.status === 403) navigate('/unauthorized', { replace: true });
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, extra = {}) => (
    <FormField id={`job-${name}`} label={label} value={form[name === 'min-cgpa' ? 'minCgpa' : name]} onChange={handleChange} error={errors[name === 'min-cgpa' ? 'minCgpa' : name]} {...extra} />
  );

  return (
    <div className="page page-medium">
      <div className="card form-card">
        <h1 data-testid="page-heading">{isEdit ? 'Edit Job' : 'Add New Job'}</h1>
        <Alert type="error" message={error} />
        <form id="job-form" data-testid="job-form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            {field('title', 'Job title')}
            {field('company', 'Company name')}
            {field('location', 'Location')}
            <FormField
              id="job-jobType"
              label="Job type"
              as="select"
              value={form.jobType}
              onChange={handleChange}
              error={errors.jobType}
              options={[{ value: '', label: 'Select job type' }, ...JOB_TYPES.map((t) => ({ value: t, label: t }))]}
            />
            {field('min-cgpa', 'Minimum CGPA', { type: 'number', step: '0.1', min: 0, max: 10 })}
            {field('openings', 'Number of openings', { type: 'number', min: 1 })}
            {field('deadline', 'Application deadline', { type: 'date' })}
          </div>
          {field('description', 'Job description', { as: 'textarea', hint: 'At least 20 characters' })}
          {field('skills', 'Required skills', { hint: 'Separate skills with commas' })}

          <fieldset className="form-field" id="job-eligibleYears" data-testid="job-eligibleYears">
            <legend>Eligible graduation years</legend>
            <div className="checkbox-row">
              {GRADUATION_YEARS.map((year) => (
                <label key={year} htmlFor={`job-year-${year}`} className="checkbox">
                  <input type="checkbox" id={`job-year-${year}`} data-testid={`job-year-${year}`} checked={form.eligibleYears.includes(year)} onChange={() => toggleYear(year)} />
                  {year}
                </label>
              ))}
            </div>
            {errors.eligibleYears && <p className="field-error" id="job-eligibleYears-error" data-testid="job-eligibleYears-error" role="alert">{errors.eligibleYears}</p>}
          </fieldset>

          <div className="button-row">
            <button type="submit" className="btn btn-primary" id="save-job-button" data-testid="save-job-button" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Job'}
            </button>
            <Link to="/recruiter/dashboard" className="btn btn-secondary" id="cancel-job-button" data-testid="cancel-job-button">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
