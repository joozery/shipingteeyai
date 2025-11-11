const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.post('/admin/login', authController.adminLogin);
router.post('/customer/login', authController.customerLogin);

// Protected routes
router.post('/admin/register', authenticateToken, requireAdmin, authController.registerAdmin);

module.exports = router;

