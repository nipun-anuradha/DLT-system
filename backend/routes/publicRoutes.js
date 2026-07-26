const express = require('express');
const router = express.Router();
const { getRegistrationData } = require('../controllers/publicController');

// Public routes - no authentication required
router.get('/registration-data', getRegistrationData);

module.exports = router;
