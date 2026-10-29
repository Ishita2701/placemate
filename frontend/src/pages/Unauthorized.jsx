import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Unauthorized() {
  const { user } = useAuth();
  const home = user ? (user.role === 'student' ? '/student/dashboard' : '/recruiter/dashboard') : '/login';
  return (
    <div className="page page-narrow">
      <div className="card">
        <h1 data-testid="page-heading">Access Denied</h1>
        <p data-testid="unauthorized-message">You do not have permission to view this page.</p>
        <Link to={home} className="btn btn-primary" id="unauthorized-home" data-testid="unauthorized-home">
          {user ? 'Go to my dashboard' : 'Go to login'}
        </Link>
      </div>
    </div>
  );
}
