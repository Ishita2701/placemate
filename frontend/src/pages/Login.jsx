import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import FormField from '../components/FormField.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { EMAIL_REGEX } from '../services/format.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const notice = location.state && location.state.message;

  const handleChange = (event) => setForm({ ...form, [event.target.name.replace('login-', '')]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    const found = {};
    if (!form.email.trim()) found.email = 'Email is required';
    else if (!EMAIL_REGEX.test(form.email.trim())) found.email = 'Enter a valid email address';
    if (!form.password) found.password = 'Password is required';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const user = await login(form.email.trim(), form.password);
      navigate(user.role === 'student' ? '/student/dashboard' : '/recruiter/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="page page-narrow">
      <div className="card form-card">
        <h1 data-testid="page-heading">Log in to PlaceMate</h1>
        <Alert type="success" message={notice} />
        <Alert type="error" message={serverError} />
        <form id="login-form" data-testid="login-form" onSubmit={handleSubmit} noValidate>
          <FormField id="login-email" label="Email" type="email" value={form.email} onChange={handleChange} error={errors.email} autoComplete="email" />
          <FormField id="login-password" label="Password" type="password" value={form.password} onChange={handleChange} error={errors.password} autoComplete="current-password" />
          <button type="submit" className="btn btn-primary btn-block" id="login-submit" data-testid="login-submit" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className="form-footer">
          New here? <Link to="/register" id="login-register-link" data-testid="login-register-link">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
