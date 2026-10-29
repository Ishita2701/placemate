import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import FormField from '../components/FormField.jsx';
import { authApi } from '../services/api.js';
import { EMAIL_REGEX } from '../services/format.js';

const EMPTY = { name: '', email: '', password: '', confirmPassword: '', role: '' };

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Full name is required';
  else if (form.name.trim().length < 2) errors.name = 'Full name must be at least 2 characters';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_REGEX.test(form.email.trim())) errors.email = 'Enter a valid email address';
  if (!form.password) errors.password = 'Password is required';
  else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (!form.role) errors.role = 'Please select a role';
  return errors;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => setForm({ ...form, [event.target.name.replace('register-', '')]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await authApi.register({ ...form, name: form.name.trim(), email: form.email.trim() });
      navigate('/login', { state: { message: 'Registration successful. Please log in.' } });
    } catch (err) {
      setErrors(err.errors || {});
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page page-narrow">
      <div className="card form-card">
        <h1 data-testid="page-heading">Create your account</h1>
        <Alert type="error" message={serverError} />
        <form id="register-form" data-testid="register-form" onSubmit={handleSubmit} noValidate>
          <FormField id="register-name" label="Full name" value={form.name} onChange={handleChange} error={errors.name} autoComplete="name" />
          <FormField id="register-email" label="Email" type="email" value={form.email} onChange={handleChange} error={errors.email} autoComplete="email" />
          <FormField id="register-password" label="Password" type="password" value={form.password} onChange={handleChange} error={errors.password} hint="At least 8 characters" autoComplete="new-password" />
          <FormField id="register-confirmPassword" label="Confirm password" type="password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} autoComplete="new-password" />
          <FormField
            id="register-role"
            label="I am a"
            as="select"
            value={form.role}
            onChange={handleChange}
            error={errors.role}
            options={[
              { value: '', label: 'Select role' },
              { value: 'student', label: 'Student' },
              { value: 'recruiter', label: 'Recruiter' },
            ]}
          />
          <button type="submit" className="btn btn-primary btn-block" id="register-submit" data-testid="register-submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="form-footer">
          Already registered? <Link to="/login" id="register-login-link" data-testid="register-login-link">Log in</Link>
        </p>
      </div>
    </div>
  );
}
