const express = require('express')
const router = express.Router()

const { authenticateToken, requireAdmin } = require('../middleware/auth')
const trackingController = require('../controllers/trackingController')

// Public route - no authentication required
router.get('/search', trackingController.searchTrackingItem)

// Admin routes - authentication required
router.get('/', authenticateToken, requireAdmin, trackingController.getTrackingItems)
router.post('/', authenticateToken, requireAdmin, trackingController.createTrackingItem)
router.put('/:id', authenticateToken, requireAdmin, trackingController.updateTrackingItem)
router.delete('/:id', authenticateToken, requireAdmin, trackingController.deleteTrackingItem)

module.exports = router
