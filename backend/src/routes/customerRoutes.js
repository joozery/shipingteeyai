const express = require('express')
const router = express.Router()
const { authenticateToken, requireAdmin } = require('../middleware/auth')
const customerController = require('../controllers/customerController')

// Admin routes
router.get('/all', authenticateToken, requireAdmin, customerController.getAllCustomers)
router.post('/', authenticateToken, requireAdmin, customerController.createCustomer)
router.put('/:id', authenticateToken, requireAdmin, customerController.updateCustomer)
router.post('/:id/reset-password', authenticateToken, requireAdmin, customerController.resetPassword)
router.delete('/:id', authenticateToken, requireAdmin, customerController.deleteCustomer)

// Customer routes (authenticated user only)
// Note: More specific routes must come before general routes
router.get('/profile', authenticateToken, customerController.getCustomerProfile)
router.put('/tracking/:id/location', authenticateToken, customerController.updateTrackingItemLocation)
router.get('/tracking', authenticateToken, customerController.getCustomerTrackingItems)

module.exports = router

