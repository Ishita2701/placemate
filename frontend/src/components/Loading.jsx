export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="loading" id="loading-indicator" data-testid="loading-indicator" role="status" aria-live="polite">
      {text}
    </div>
  );
}
