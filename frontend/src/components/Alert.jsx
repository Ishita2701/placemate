// type: "success" | "error". Gives data-testid="success-message" or "error-message".
export default function Alert({ type, message, children }) {
  if (!message && !children) return null;
  return (
    <div className={`alert alert-${type}`} id={`${type}-message`} data-testid={`${type}-message`} role={type === 'error' ? 'alert' : 'status'}>
      {message}
      {children}
    </div>
  );
}
