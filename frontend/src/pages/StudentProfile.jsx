import { useEffect, useState } from 'react';
import Alert from '../components/Alert.jsx';
import FormField from '../components/FormField.jsx';
import Loading from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { profileApi } from '../services/api.js';
import { EMAIL_REGEX, PHONE_REGEX } from '../services/format.js';

// Form field ids are "profile-<name>"; the API field names are the keys below.
const FIELDS = ['fullName', 'email', 'phone', 'college', 'degreeBranch', 'graduationYear', 'cgpa', 'skills', 'resumeUrl'];

function validate(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = 'Full name is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_REGEX.test(form.email.trim())) errors.email = 'Enter a valid email address';
  if (!form.phone.trim()) errors.phone = 'Phone number is required';
  else if (!PHONE_REGEX.test(form.phone.trim())) errors.phone = 'Phone number must be exactly 10 digits';
  if (!form.college.trim()) errors.college = 'College name is required';
  if (!form.degreeBranch.trim()) errors.degreeBranch = 'Degree and branch is required';
  if (form.graduationYear === '') errors.graduationYear = 'Graduation year is required';
  else {
    const year = Number(form.graduationYear);
    if (!Number.isInteger(year) || year < 2020 || year > 2035) errors.graduationYear = 'Graduation year must be between 2020 and 2035';
  }
  if (form.cgpa === '') errors.cgpa = 'CGPA is required';
  else if (Number.isNaN(Number(form.cgpa)) || Number(form.cgpa) < 0 || Number(form.cgpa) > 10) errors.cgpa = 'CGPA must be a number between 0 and 10';
  if (!form.skills.trim()) errors.skills = 'Enter at least one technical skill';
  if (!form.resumeUrl.trim()) errors.resumeUrl = 'Resume URL is required';
  else if (!/^https?:\/\/\S+\.\S+/.test(form.resumeUrl.trim())) errors.resumeUrl = 'Enter a valid URL starting with http:// or https://';
  return errors;
}

export default function StudentProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileApi
      .get()
      .then((data) => {
        const p = data.profile;
        setForm({
          fullName: p ? p.fullName : user.name,
          email: p ? p.email : user.email,
          phone: p ? p.phone : '',
          college: p ? p.college : '',
          degreeBranch: p ? p.degreeBranch : '',
          graduationYear: p ? String(p.graduationYear) : '',
          cgpa: p ? String(p.cgpa) : '',
          skills: p ? p.skills.join(', ') : '',
          resumeUrl: p ? p.resumeUrl : '',
        });
      })
      .catch((err) => {
        setError(err.message);
        setForm(Object.fromEntries(FIELDS.map((f) => [f, ''])));
      });
  }, [user]);

  if (!form) return <Loading text="Loading your profile..." />;

  const handleChange = (event) => setForm({ ...form, [event.target.name.replace('profile-', '')]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess('');
    setError('');
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const data = await profileApi.save(form);
      setSuccess(data.message);
    } catch (err) {
      setErrors(err.errors || {});
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, extra = {}) => (
    <FormField id={`profile-${name}`} label={label} value={form[name]} onChange={handleChange} error={errors[name]} {...extra} />
  );

  return (
    <div className="page page-medium">
      <div className="card form-card">
        <h1 data-testid="page-heading">My Profile</h1>
        <Alert type="success" message={success} />
        <Alert type="error" message={error} />
        <form id="profile-form" data-testid="profile-form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            {field('fullName', 'Full name')}
            {field('email', 'Email', { type: 'email' })}
            {field('phone', 'Phone number', { type: 'tel', hint: '10 digits' })}
            {field('college', 'College name')}
            {field('degreeBranch', 'Degree and branch', { placeholder: 'B.Tech Computer Science' })}
            {field('graduationYear', 'Graduation year', { type: 'number', min: 2020, max: 2035 })}
            {field('cgpa', 'CGPA', { type: 'number', step: '0.01', min: 0, max: 10 })}
            {field('resumeUrl', 'Resume URL', { type: 'url', placeholder: 'https://...' })}
          </div>
          {field('skills', 'Technical skills', { hint: 'Separate skills with commas, e.g. Java, React, SQL' })}
          <button type="submit" className="btn btn-primary" id="save-profile-button" data-testid="save-profile-button" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
