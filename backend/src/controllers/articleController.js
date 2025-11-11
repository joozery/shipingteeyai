const { pool } = require('../config/database')
const { createActivityLog } = require('./activityLogController')

// Map database row to response object
const mapArticle = (row) => {
  let tags = []
  if (row.tags) {
    try {
      // Try to parse as JSON if it's a string
      if (typeof row.tags === 'string') {
        tags = JSON.parse(row.tags)
      } else if (Array.isArray(row.tags)) {
        tags = row.tags
      }
    } catch (error) {
      // If parsing fails, treat as empty array
      tags = []
    }
  }
  
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    image: row.image,
    author: row.author,
    readTime: row.read_time,
    tags: tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Get all articles
const getAllArticles = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM articles ORDER BY created_at DESC'
    )
    
    const articles = rows.map(mapArticle)
    res.json({ success: true, data: articles })
  } catch (error) {
    console.error('getAllArticles error:', error)
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลบทความได้' })
  }
}

// Get article by ID
const getArticleById = async (req, res) => {
  const { id } = req.params
  
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM articles WHERE id = ? LIMIT 1',
      [id]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบบทความ' })
    }
    
    res.json({ success: true, data: mapArticle(rows[0]) })
  } catch (error) {
    console.error('getArticleById error:', error)
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลบทความได้' })
  }
}

// Create article
const createArticle = async (req, res) => {
  const { title, excerpt, content, image, author, readTime, tags } = req.body
  
  if (!title || !content) {
    return res.status(400).json({ message: 'กรุณากรอกหัวข้อและเนื้อหาให้ครบถ้วน' })
  }
  
  try {
    // Ensure tags is an array before stringifying
    let tagsJson = null
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(t => t) : [])
      tagsJson = tagsArray.length > 0 ? JSON.stringify(tagsArray) : null
    }
    
    const [result] = await pool.execute(
      `INSERT INTO articles (title, excerpt, content, image, author, read_time, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        excerpt || null,
        content,
        image || null,
        author || 'ทีมงาน teeyaiimport',
        readTime || '5 นาที',
        tagsJson,
      ]
    )
    
    const [rows] = await pool.execute(
      'SELECT * FROM articles WHERE id = ?',
      [result.insertId]
    )
    
    // Log activity
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'Unknown'
    await createActivityLog(
      'admin',
      req.user.id,
      'เพิ่มบทความใหม่',
      `Article: ${title}`,
      ipAddress
    )

    res.status(201).json({
      success: true,
      message: 'เพิ่มบทความสำเร็จ',
      data: mapArticle(rows[0])
    })
  } catch (error) {
    console.error('createArticle error:', error)
    res.status(500).json({ message: 'ไม่สามารถเพิ่มบทความได้', error: process.env.NODE_ENV === 'development' ? error.message : undefined })
  }
}

// Update article
const updateArticle = async (req, res) => {
  const { id } = req.params
  const { title, excerpt, content, image, author, readTime, tags } = req.body
  
  if (!title || !content) {
    return res.status(400).json({ message: 'กรุณากรอกหัวข้อและเนื้อหาให้ครบถ้วน' })
  }
  
  try {
    // Check if article exists
    const [existing] = await pool.execute(
      'SELECT id FROM articles WHERE id = ? LIMIT 1',
      [id]
    )
    
    if (existing.length === 0) {
      return res.status(404).json({ message: 'ไม่พบบทความ' })
    }
    
    // Ensure tags is an array before stringifying
    let tagsJson = null
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(t => t) : [])
      tagsJson = tagsArray.length > 0 ? JSON.stringify(tagsArray) : null
    }
    
    await pool.execute(
      `UPDATE articles 
       SET title = ?, excerpt = ?, content = ?, image = ?, author = ?, read_time = ?, tags = ?
       WHERE id = ?`,
      [
        title,
        excerpt || null,
        content,
        image || null,
        author || 'ทีมงาน teeyaiimport',
        readTime || '5 นาที',
        tagsJson,
        id
      ]
    )
    
    const [rows] = await pool.execute(
      'SELECT * FROM articles WHERE id = ?',
      [id]
    )

    // Log activity
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'Unknown'
    await createActivityLog(
      'admin',
      req.user.id,
      'อัพเดตบทความ',
      `Article ID: ${id} - ${title}`,
      ipAddress
    )
    
    res.json({
      success: true,
      message: 'อัปเดตบทความสำเร็จ',
      data: mapArticle(rows[0])
    })
  } catch (error) {
    console.error('updateArticle error:', error)
    res.status(500).json({ message: 'ไม่สามารถอัปเดตบทความได้' })
  }
}

// Delete article
const deleteArticle = async (req, res) => {
  const { id } = req.params
  
  try {
    // Get article title before delete for logging
    const [articleRows] = await pool.execute('SELECT title FROM articles WHERE id = ?', [id])
    const articleTitle = articleRows.length > 0 ? articleRows[0].title : 'Unknown'

    const [result] = await pool.execute('DELETE FROM articles WHERE id = ?', [id])
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบบทความ' })
    }

    // Log activity
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'Unknown'
    await createActivityLog(
      'admin',
      req.user.id,
      'ลบบทความ',
      `Article ID: ${id} - ${articleTitle}`,
      ipAddress
    )
    
    res.json({ success: true, message: 'ลบบทความสำเร็จ' })
  } catch (error) {
    console.error('deleteArticle error:', error)
    res.status(500).json({ message: 'ไม่สามารถลบบทความได้' })
  }
}

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
}

