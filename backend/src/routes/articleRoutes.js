const express = require('express')
const router = express.Router()

const { authenticateToken, requireAdmin } = require('../middleware/auth')
const articleController = require('../controllers/articleController')

// Public routes (no authentication required)
router.get('/', articleController.getAllArticles)
router.get('/:id', articleController.getArticleById)

// Admin only routes
router.post('/', authenticateToken, requireAdmin, articleController.createArticle)
router.put('/:id', authenticateToken, requireAdmin, articleController.updateArticle)
router.delete('/:id', authenticateToken, requireAdmin, articleController.deleteArticle)

module.exports = router

