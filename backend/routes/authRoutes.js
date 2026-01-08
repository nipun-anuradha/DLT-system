const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

// User routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Admin routes
router.post('/admin/login', authController.loginAdmin);

module.exports = router;