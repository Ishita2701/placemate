// Unknown API route -> 404 JSON
function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Every error ends up here and is returned as { success: false, message, errors? }.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Server error';
  let errors = err.errors;

  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON in request body';
  } else if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    message = 'Validation failed';
    errors = Object.fromEntries(Object.entries(err.errors).map(([key, e]) => [key, e.message]));
  } else if (err.name === 'CastError') {
    status = 404;
    message = 'Resource not found';
  } else if (err.code === 11000) {
    status = 409;
    message = 'This record already exists';
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, message: status >= 500 ? 'Internal server error' : message, ...(errors ? { errors } : {}) });
}

module.exports = { notFound, errorHandler };
