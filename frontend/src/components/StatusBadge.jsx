export default function StatusBadge({ status }) {
  const slug = status.toLowerCase().replace(/\s+/g, '-');
  return (
    <span className={`badge status-${slug}`} data-testid="application-status">
      {status}
    </span>
  );
}
