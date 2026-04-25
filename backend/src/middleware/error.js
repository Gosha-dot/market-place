/**
 * Central error handler.
 * - Avoid leaking stack traces in production
 * - Normalize mongoose errors into 400s where appropriate
 */
function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-unused-vars
  const _next = next;
  const status = err.statusCode || 500;

  // Mongoose validation errors -> 400
  if (err?.name === 'ValidationError') {
    return res.status(400).json({
      error: 'ValidationError',
      message: err.message
    });
  }

  // CastError (invalid ObjectId) -> 400
  if (err?.name === 'CastError') {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'Invalid id'
    });
  }

  res.status(status).json({
    error: err.code || 'ServerError',
    message: err.message || 'Something went wrong'
  });
}

module.exports = { errorHandler };

