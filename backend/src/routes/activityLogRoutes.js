const express = require('express')
const router = express.Router()

const { authenticateToken, requireAdmin } = require('../middleware/auth')
const activityLogController = require('../controllers/activityLogController')

// All routes require admin authentication
router.get('/', authenticateToken, requireAdmin, activityLogController.getAllActivityLogs)
router.get('/user/:userType/:userId', authenticateToken, requireAdmin, activityLogController.getActivityLogsByUser)

module.exports = router


