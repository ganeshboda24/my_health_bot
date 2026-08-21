/**
 * 404 handler - must be registered after all routes.
 */
function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

/**
 * Centralized error handler - must be registered last.
 * Never leaks stack traces to the client.
 */
function errorHandler(err, req, res, next) {
  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages[0] || "Validation failed"
    });
  }

  // Duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(400).json({
      success: false,
      message: `An account with this ${field} already exists.`
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid identifier format."
    });
  }

  // JSON body parsing errors
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON in request body."
    });
  }

  // Payload too large
  if (err.status === 413 || err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request body is too large."
    });
  }

  const status = err.statusCode || err.status || 500;

  if (status >= 500) {
    console.error("Server error:", err.message, err.stack || "");
  }

  res.status(status).json({
    success: false,
    message: err.message || "Something went wrong"
  });
}

module.exports = {
  notFound,
  errorHandler
};