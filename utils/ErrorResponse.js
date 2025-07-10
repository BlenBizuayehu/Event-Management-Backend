/**
 * Custom Error class to create errors with a specific HTTP status code.
 * This allows us to standardize the error responses sent back by the API.
 *
 * Example Usage:
 * return next(new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404));
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    // Call the parent constructor (Error) with the message
    super(message);
    // Add the custom statusCode property
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;