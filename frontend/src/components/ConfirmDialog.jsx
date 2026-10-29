// In-app confirmation (used instead of the browser's confirm() popup).
export default function ConfirmDialog({ title, message, onConfirm, onCancel, busy }) {
  return (
    <div className="modal-backdrop" id="confirm-dialog" data-testid="confirm-dialog">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <h2 id="confirm-dialog-title">{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" id="cancel-delete-button" data-testid="cancel-delete-button" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" id="confirm-delete-button" data-testid="confirm-delete-button" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
