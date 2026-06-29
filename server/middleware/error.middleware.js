function errorHandler(
  err,
  req,
  res,
  next
) {
  let statusCode =
    err.statusCode || 500;

  let message =
    err.message ||
    "Internal Server Error";

  // PostgreSQL unique violation
  if (err.code === "23505") {
    statusCode = 409;
    message =
      "Resource already exists";
  }

  // PostgreSQL foreign key violation
  if (err.code === "23503") {
    statusCode = 400;
    message =
      "Invalid reference";
  }

  // PostgreSQL invalid input
  if (err.code === "22P02") {
    statusCode = 400;
    message =
      "Invalid input";
  }

  console.error(err);

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    ...(process.env.NODE_ENV ===
      "development" && {
      stack: err.stack,
    }),
  });
}

export default errorHandler;