const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Public routes - no authentication required
router.get('/branches', publicController.getBranches);
router.get('/departments', publicController.getDepartments);

module.exports = router;

