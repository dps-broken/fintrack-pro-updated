// server/middleware/errorHandler.middleware.js
const NODE_ENV = process.env.NODE_ENV;

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let errorsArray; // For express-validator style errors

  // Check if the error object itself contains an 'errors' array (from express-validator via handleValidationErrors)
  // This check is actually redundant if handleValidationErrors already sent the response.
  // This errorHandler is more for errors thrown *after* express-validator.
  if (err.errors && Array.isArray(err.errors)) {
    // This case might not be hit often if express-validator's handleValidationErrors already responded.
    // statusCode = 400; // Already set by express-validator middleware
    // message = 'Validation failed'; // General message
    // errorsArray = err.errors;
  }
  // Specific error types
  else if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found (Invalid ID format).';
  } else if (err.code === 11000) { // Mongoose duplicate key error
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with that ${field} already exists.`;
    if (field === 'email') {
        message = 'An account with this email address already exists. Please try logging in or use a different email.'
    }
  } else if (err.name === 'ValidationError') { // Mongoose validation error
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(' '); // Join with space for a single message string
    // If you want to send an array of Mongoose validation errors similar to express-validator:
    // errorsArray = Object.values(err.errors).map(e => ({ msg: e.message, path: e.path }));
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }
  // If a specific status code was set on the error object by a controller
  else if (err.statusCode) {
    statusCode = err.statusCode;
  }


  const responsePayload = {
    message: message,
    // Conditionally add the errors array if it exists (for more detailed field errors)
    ...(errorsArray && { errors: errorsArray }),
    stack: NODE_ENV === 'production' ? undefined : err.stack, // only show stack in dev
  };

  res.status(statusCode).json(responsePayload);
};

export { notFound, errorHandler };