const express = require('express')
const router = express.Router()
const { authenticateToken, requireAdmin } = require('../middleware/auth')
const customerController = require('../controllers/customerController')

// Admin routes
router.get('/all', authenticateToken, requireAdmin, customerController.getAllCustomers)
router.put('/:id', authenticateToken, requireAdmin, customerController.updateCustomer)
router.post('/:id/reset-password', authenticateToken, requireAdmin, customerController.resetPassword)
router.delete('/:id', authenticateToken, requireAdmin, customerController.deleteCustomer)

// Customer routes (authenticated user only)
router.get('/profile', authenticateToken, customerController.getCustomerProfile)
router.get('/tracking', authenticateToken, customerController.getCustomerTrackingItems)

module.exports = router
