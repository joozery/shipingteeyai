const { pool } = require('../config/database')

// Map database row to response object
const mapActivityLog = (row) => ({
  id: row.id,
  userType: row.user_type,
  userId: row.user_id,
  action: row.action,
  description: row.description,
  ipAddress: row.ip_address,
  createdAt: row.created_at,
})

// Get all activity logs
const getAllActivityLogs = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query
    
    // Get activity logs with user information
    // Ensure values are integers for MySQL
    const limitNum = parseInt(limit, 10) || 100
    const offsetNum = parseInt(offset, 10) || 0
    
    // Validate that values are valid integers
    if (isNaN(limitNum) || limitNum < 0) {
      return res.status(400).json({ message: 'Invalid limit parameter' })
    }
    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({ message: 'Invalid offset parameter' })
    }
    
    // Use query instead of execute for LIMIT/OFFSET to avoid parameter binding issues
    const [rows] = await pool.query(
      `SELECT 
        al.*,
        CASE 
          WHEN al.user_type = 'admin' THEN au.name
          WHEN al.user_type = 'customer' THEN c.name
          ELSE 'Unknown'
        END as user_name
      FROM activity_logs al
      LEFT JOIN admin_users au ON al.user_type = 'admin' AND al.user_id = au.id
      LEFT JOIN customers c ON al.user_type = 'customer' AND al.user_id = c.id
      ORDER BY al.created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}`
    )
    
    // Get total count
    const [countRows] = await pool.execute('SELECT COUNT(*) as total FROM activity_logs')
    const total = countRows[0].total
    
    const logs = rows.map((row) => ({
      ...mapActivityLog(row),
      userName: row.user_name || 'Unknown',
      // Extract type from action for frontend compatibility
      type: extractTypeFromAction(row.action),
    }))
    
    res.json({ 
      success: true, 
      data: logs,
      total,
      limit: limitNum,
      offset: offsetNum,
    })
  } catch (error) {
    console.error('getAllActivityLogs error:', error)
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูล Activity Logs ได้' })
  }
}

// Extract activity type from action for frontend
const extractTypeFromAction = (action) => {
  const actionLower = action.toLowerCase()
  if (actionLower.includes('พัสดุ') || actionLower.includes('tracking') || actionLower.includes('สถานะ')) {
    return 'tracking'
  }
  if (actionLower.includes('ลูกค้า') || actionLower.includes('customer')) {
    return 'customer'
  }
  if (actionLower.includes('บทความ') || actionLower.includes('content') || actionLower.includes('article')) {
    return 'content'
  }
  if (actionLower.includes('ตั้งค่า') || actionLower.includes('settings')) {
    return 'settings'
  }
  if (actionLower.includes('เข้าสู่ระบบ') || actionLower.includes('login') || actionLower.includes('logout')) {
    return 'auth'
  }
  if (actionLower.includes('admin') || actionLower.includes('ผู้ดูแล')) {
    return 'admin'
  }
  return 'other'
}

// Get client IP address from request
const getClientIp = (req) => {
  if (req) {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 
           req.headers?.['x-real-ip'] || 
           'Unknown'
  }
  return 'Unknown'
}

// Create activity log (helper function for other controllers)
const createActivityLog = async (userType, userId, action, description, ipAddress = null) => {
  try {
    await pool.execute(
      'INSERT INTO activity_logs (user_type, user_id, action, description, ip_address) VALUES (?, ?, ?, ?, ?)',
      [userType, userId, action, description, ipAddress || 'Unknown']
    )
  } catch (error) {
    console.error('createActivityLog error:', error)
    // Don't throw error, just log it - activity logging shouldn't break main functionality
  }
}

module.exports.getClientIp = getClientIp

// Get activity logs by user
const getActivityLogsByUser = async (req, res) => {
  try {
    const { userType, userId } = req.params
    
    const [rows] = await pool.execute(
      `SELECT 
        al.*,
        CASE 
          WHEN al.user_type = 'admin' THEN au.name
          WHEN al.user_type = 'customer' THEN c.name
          ELSE 'Unknown'
        END as user_name
      FROM activity_logs al
      LEFT JOIN admin_users au ON al.user_type = 'admin' AND al.user_id = au.id
      LEFT JOIN customers c ON al.user_type = 'customer' AND al.user_id = c.id
      WHERE al.user_type = ? AND al.user_id = ?
      ORDER BY al.created_at DESC
      LIMIT 50`,
      [userType, userId]
    )
    
    const logs = rows.map((row) => ({
      ...mapActivityLog(row),
      userName: row.user_name || 'Unknown',
      type: extractTypeFromAction(row.action),
    }))
    
    res.json({ success: true, data: logs })
  } catch (error) {
    console.error('getActivityLogsByUser error:', error)
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูล Activity Logs ได้' })
  }
}

module.exports = {
  getAllActivityLogs,
  getActivityLogsByUser,
  createActivityLog, // Export for use in other controllers
}

