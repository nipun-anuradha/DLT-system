// Utility helper functions

/**
 * Async handler to wrap async route handlers
 * Eliminates the need for try-catch in every route
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Format date to MySQL datetime format
 */
const formatDateTime = (date = new Date()) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Sanitize object - remove undefined and null values
 */
const sanitizeObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v != null && v !== undefined)
  );
};

/**
 * Paginate results
 */
const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { limit: parseInt(limit), offset };
};

module.exports = {
  asyncHandler,
  formatDateTime,
  sanitizeObject,
  paginate
};
