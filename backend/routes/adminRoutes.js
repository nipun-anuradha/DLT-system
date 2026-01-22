const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const {
  // Dashboard
  getDashboardCounts,
  getRecentTickets,
  // Tickets
  getAllTickets,
  getTicketById,
  updateTicket,
  addAdminMessage,
  // Users
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  // Notices
  getAllNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  publishNotice,
  deleteNotice
} = require('../controllers/adminController');

// All routes require admin authentication
router.use(authenticateAdmin);

// ==================== DASHBOARD ====================
router.get('/dashboard/counts', getDashboardCounts);
router.get('/dashboard/recent-tickets', getRecentTickets);

// ==================== TICKETS ====================
router.get('/tickets', getAllTickets);
router.get('/tickets/:id', getTicketById);
router.put('/tickets/:id', updateTicket);
router.post('/tickets/:id/messages', upload.array('attachments', 5), handleUploadError, addAdminMessage);

// ==================== USERS ====================
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// ==================== NOTICES ====================
router.get('/notices', getAllNotices);
router.get('/notices/:id', getNoticeById);
router.post('/notices', createNotice);
router.put('/notices/:id', updateNotice);
router.put('/notices/:id/publish', publishNotice);
router.delete('/notices/:id', deleteNotice);

module.exports = router;
