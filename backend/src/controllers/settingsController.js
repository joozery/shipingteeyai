const { pool } = require('../config/database')

// Get all settings
const getSettings = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT setting_key, setting_value, setting_type FROM system_settings'
    )
    
    // Convert to object format
    const settings = {}
    rows.forEach(row => {
      let value = row.setting_value
      
      // Convert based on type
      if (row.setting_type === 'boolean') {
        value = value === 'true' || value === '1'
      } else if (row.setting_type === 'number') {
        value = parseFloat(value) || 0
      } else if (row.setting_type === 'json') {
        try {
          value = JSON.parse(value)
        } catch (e) {
          value = value
        }
      }
      
      settings[row.setting_key] = value
    })
    
    res.json({ success: true, data: settings })
  } catch (error) {
    console.error('getSettings error:', error)
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลการตั้งค่าได้' })
  }
}

// Update settings
const updateSettings = async (req, res) => {
  try {
    const settings = req.body
    
    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      let stringValue = String(value)
      
      // Get setting type
      const [existing] = await pool.execute(
        'SELECT setting_type FROM system_settings WHERE setting_key = ?',
        [key]
      )
      
      if (existing.length > 0) {
        // Update existing setting
        await pool.execute(
          'UPDATE system_settings SET setting_value = ? WHERE setting_key = ?',
          [stringValue, key]
        )
      } else {
        // Insert new setting (default to boolean)
        await pool.execute(
          'INSERT INTO system_settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)',
          [key, stringValue, 'boolean']
        )
      }
    }
    
    res.json({ success: true, message: 'อัพเดตการตั้งค่าสำเร็จ' })
  } catch (error) {
    console.error('updateSettings error:', error)
    res.status(500).json({ message: 'ไม่สามารถอัพเดตการตั้งค่าได้' })
  }
}

// Get system statistics
const getSystemStats = async (req, res) => {
  try {
    // Get total customers
    const [customerRows] = await pool.execute('SELECT COUNT(*) as total FROM customers')
    const totalCustomers = customerRows[0]?.total || 0
    
    // Get total tracking items
    const [trackingRows] = await pool.execute('SELECT COUNT(*) as total FROM tracking_items')
    const totalTracking = trackingRows[0]?.total || 0
    
    // Get total activity logs
    const [activityRows] = await pool.execute('SELECT COUNT(*) as total FROM activity_logs')
    const totalActivities = activityRows[0]?.total || 0
    
    // Get total articles
    const [articleRows] = await pool.execute('SELECT COUNT(*) as total FROM articles')
    const totalArticles = articleRows[0]?.total || 0
    
    // Get total admin users
    const [adminRows] = await pool.execute('SELECT COUNT(*) as total FROM admin_users')
    const totalAdmins = adminRows[0]?.total || 0
    
    res.json({
      success: true,
      data: {
        totalCustomers,
        totalTracking,
        totalActivities,
        totalArticles,
        totalAdmins,
      }
    })
  } catch (error) {
    console.error('getSystemStats error:', error)
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลสถิติได้' })
  }
}

module.exports = {
  getSettings,
  updateSettings,
  getSystemStats,
}


