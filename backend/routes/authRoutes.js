const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// User routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/microsoft', authController.microsoftAuth);

// Admin routes
router.post('/admin/login', authController.loginAdmin);

module.exports = router;