const { authenticateUser, authenticateAdmin } = require('./auth');
const { errorHandler, notFound } = require('./errorHandler');

module.exports = {
  authenticateUser,
  authenticateAdmin,
  errorHandler,
  notFound
};
