const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const {
  createTicket,
  getTickets,
  getTicketById,
  getDashboardCounts,
  addMessage,
  getNotices
} = require('../controllers/userController');

// All routes require user authentication
router.use(authenticateUser);

// Dashboard counts - must be before /:id route
router.get('/tickets/dashboard/counts', getDashboardCounts);

// Ticket routes
router.post('/tickets', upload.array('attachments', 5), handleUploadError, createTicket);
router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicketById);
router.post('/tickets/:id/messages', upload.array('attachments', 5), handleUploadError, addMessage);

// Notice routes
router.get('/notices', getNotices);

module.exports = router;
