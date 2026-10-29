// One label + input/select/textarea + error message. "id" doubles as the data-testid.
export default function FormField({ id, label, error, as = 'input', options, hint, children, ...rest }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const common = { id, name: id, 'data-testid': id, 'aria-invalid': error ? 'true' : 'false', 'aria-describedby': describedBy, ...rest };

  let control;
  if (as === 'select') {
    control = (
      <select {...common}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else if (as === 'textarea') {
    control = <textarea rows={5} {...common} />;
  } else {
    control = <input {...common} />;
  }

  return (
    <div className={`form-field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {control}
      {children}
      {hint && !error && (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${id}-error`} data-testid={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
