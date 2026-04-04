const AppError = require("../utils/appError");

const handleCastError = (err, req) => {
  const message = req.t('errors.cast_error', { 
    type: err.path, 
    value: err.value 
  });
  return new AppError(message, 400);
};

const handleDuplicateError = (err, req) => {
  const value = err.keyValue ? JSON.stringify(err.keyValue) : '';
  const message = req.t('errors.duplicate_field', { field: value });
  return new AppError(message, 400);
};

const handleValidationError = (err, req) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = req.t('errors.validation_error', { details: errors.join('. ') });
  return new AppError(message, 400);
};

const handleJWTError = (req) => {
  return new AppError(req.t('errors.invalid_token'), 401);
};

const handleJWTExpiredError = (req) => {
  return new AppError(req.t('errors.token_expired'), 401);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else if (process.env.NODE_ENV === "production") {
    console.error("ERROR 💥", err);

    let error = Object.create(err);
    error.message = err.message;
    error.name = err.name;

    if (error.name === "CastError") error = handleCastError(error, req);
    if (error.code === 11000) error = handleDuplicateError(error, req);
    if (error.name === "ValidationError") error = handleValidationError(error, req);
    if (error.name === "JsonWebTokenError") error = handleJWTError(req);
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError(req);

    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      // Unexpected error
      return res.status(500).json({
        status: "error",
        message: req.t('errors.server_error'),
      });
    }
  }
};
