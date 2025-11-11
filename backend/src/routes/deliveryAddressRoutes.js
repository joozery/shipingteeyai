const express = require('express')
const router = express.Router()

const { authenticateToken, requireAdmin } = require('../middleware/auth')
const deliveryAddressController = require('../controllers/deliveryAddressController')

// Customer routes - authentication required
router.get('/my', authenticateToken, deliveryAddressController.getMyDeliveryAddresses)
router.post('/my', authenticateToken, deliveryAddressController.createDeliveryAddress)
router.put('/:id', authenticateToken, deliveryAddressController.updateDeliveryAddress)
router.delete('/:id', authenticateToken, deliveryAddressController.deleteDeliveryAddress)

// Admin routes - authentication + admin required
router.get('/', authenticateToken, requireAdmin, deliveryAddressController.getAllDeliveryAddresses)
router.get('/customer/:customerId', authenticateToken, requireAdmin, deliveryAddressController.getDeliveryAddressesByCustomer)

module.exports = router

