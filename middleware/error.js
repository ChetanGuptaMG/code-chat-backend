const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode;
  const response = {
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  };
  res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };