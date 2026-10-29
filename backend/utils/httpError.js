// An error that carries an HTTP status code (and optional field errors).
class HttpError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors || undefined;
  }
}

module.exports = HttpError;
