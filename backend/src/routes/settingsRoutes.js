const express = require('express')
const router = express.Router()

const { authenticateToken, requireAdmin } = require('../middleware/auth')
const settingsController = require('../controllers/settingsController')

// All routes require admin authentication
router.get('/', authenticateToken, requireAdmin, settingsController.getSettings)
router.put('/', authenticateToken, requireAdmin, settingsController.updateSettings)
router.get('/stats', authenticateToken, requireAdmin, settingsController.getSystemStats)

module.exports = router


