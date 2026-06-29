class ApiError extends Error {
  constructor(
    statusCode,
    message,
    errors = []
  ) {
    super(message);

    this.name =
      this.constructor.name;

    this.statusCode =
      statusCode;

    this.errors = errors;

    this.success = false;

    Error.captureStackTrace(
      this,
      this.constructor
    );
  }
}

export default ApiError;