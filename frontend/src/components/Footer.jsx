import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer" id="footer" data-testid="footer">
      <div className="footer-inner">
        <p>PlaceMate - Student Placement Portal. A college semester project.</p>
        <p>
          <Link to="/jobs" id="footer-jobs" data-testid="footer-jobs">Browse jobs</Link>
        </p>
      </div>
    </footer>
  );
}
