const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/auth');
const { upload, csvUpload, handleUploadError } = require('../middleware/upload');
const {
  // Dashboard
  getDashboardCounts,
  getRecentTickets,
  // Inventory
  getInventorySummary,
  getAssetTypes,
  getInventoryItems,
  getInventoryItemById,
  getInventoryUserHistory,
  getInventoryItemHistory,
  createInventoryItem,
  updateInventoryItem,
  importInventoryItems,
  exportInventoryItemsCsv,
  transferInventoryItem,
  // Tickets
  getAllTickets,
  getTicketById,
  updateTicket,
  takeTicket,
  addAdminMessage,
  getAllAdmins,
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

// ==================== INVENTORY ====================
router.get('/inventory/summary', getInventorySummary);
router.get('/inventory/asset-types', getAssetTypes);
router.get('/inventory/items', getInventoryItems);
router.get('/inventory/items/:id', getInventoryItemById);
router.get('/inventory/items/:id/history', getInventoryItemHistory);
router.get('/inventory/users/:id/history', getInventoryUserHistory);
router.post('/inventory/items', createInventoryItem);
router.put('/inventory/items/:id', updateInventoryItem);
router.post('/inventory/import', csvUpload.single('file'), handleUploadError, importInventoryItems);
router.get('/inventory/export', exportInventoryItemsCsv);
router.post('/inventory/items/:id/transfer', transferInventoryItem);

// ==================== TICKETS ====================
router.get('/tickets', getAllTickets);
router.get('/tickets/:id', getTicketById);
router.put('/tickets/:id', updateTicket);
router.put('/tickets/:id/take', takeTicket);
router.post('/tickets/:id/messages', upload.array('attachments', 5), handleUploadError, addAdminMessage);
router.get('/admins', getAllAdmins);

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
