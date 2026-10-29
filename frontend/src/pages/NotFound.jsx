import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page page-narrow">
      <div className="card">
        <h1 data-testid="page-heading">404 - Page Not Found</h1>
        <p data-testid="not-found-message">The page you are looking for does not exist.</p>
        <Link to="/" className="btn btn-primary" id="not-found-home" data-testid="not-found-home">Back to Home</Link>
      </div>
    </div>
  );
}
