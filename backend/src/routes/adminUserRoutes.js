const express = require('express')
const router = express.Router()

const { authenticateToken, requireAdmin } = require('../middleware/auth')
const adminUserController = require('../controllers/adminUserController')

// All routes require admin authentication
router.get('/', authenticateToken, requireAdmin, adminUserController.getAllAdminUsers)
router.get('/:id', authenticateToken, requireAdmin, adminUserController.getAdminUserById)
router.post('/', authenticateToken, requireAdmin, adminUserController.createAdminUser)
router.put('/:id', authenticateToken, requireAdmin, adminUserController.updateAdminUser)
router.post('/:id/reset-password', authenticateToken, requireAdmin, adminUserController.resetAdminPassword)
router.delete('/:id', authenticateToken, requireAdmin, adminUserController.deleteAdminUser)

module.exports = router


