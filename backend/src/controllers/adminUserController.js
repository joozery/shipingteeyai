const { pool } = require('../config/database')
const bcrypt = require('bcryptjs')
const { createActivityLog } = require('./activityLogController')

// Map database row to response object
const mapAdminUser = (row) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  lastLoginAt: row.last_login_at,
})

// Get all admin users
const getAllAdminUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, email, name, role, created_at, updated_at, last_login_at FROM admin_users ORDER BY created_at DESC'
    )
    
    const users = rows.map(mapAdminUser)
    res.json({ success: true, data: users })
  } catch (error) {
    console.error('getAllAdminUsers error:', error)
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูล Admin Users ได้' })
  }
}

// Get admin user by ID
const getAdminUserById = async (req, res) => {
  const { id } = req.params
  
  try {
    const [rows] = await pool.execute(
      'SELECT id, email, name, role, created_at, updated_at, last_login_at FROM admin_users WHERE id = ? LIMIT 1',
      [id]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบ Admin User' })
    }
    
    res.json({ success: true, data: mapAdminUser(rows[0]) })
  } catch (error) {
    console.error('getAdminUserById error:', error)
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูล Admin User ได้' })
  }
}

// Create admin user
const createAdminUser = async (req, res) => {
  const { email, password, name, role } = req.body
  
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
  }
  
  const validRoles = ['super_admin', 'admin', 'staff']
  const finalRole = validRoles.includes(role) ? role : 'admin'
  
  try {
    // Check if email already exists
    const [existing] = await pool.execute(
      'SELECT id FROM admin_users WHERE email = ? LIMIT 1',
      [email]
    )
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' })
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Insert new admin user
    const [result] = await pool.execute(
      'INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [email, passwordHash, name, finalRole]
    )
    
    const [rows] = await pool.execute(
      'SELECT id, email, name, role, created_at, updated_at FROM admin_users WHERE id = ?',
      [result.insertId]
    )

    // Log activity
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'Unknown'
    await createActivityLog(
      'admin',
      req.user.id,
      'เพิ่ม Admin User ใหม่',
      `Admin: ${email} - ${name} (${finalRole})`,
      ipAddress
    )
    
    res.json({
      success: true,
      message: 'สร้าง Admin User สำเร็จ',
      data: mapAdminUser(rows[0])
    })
  } catch (error) {
    console.error('createAdminUser error:', error)
    res.status(500).json({ message: 'ไม่สามารถสร้าง Admin User ได้' })
  }
}

// Update admin user
const updateAdminUser = async (req, res) => {
  const { id } = req.params
  const { email, name, role } = req.body
  
  if (!email || !name) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
  }
  
  const validRoles = ['super_admin', 'admin', 'staff']
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ message: 'Role ไม่ถูกต้อง' })
  }
  
  try {
    // Check if user exists
    const [existing] = await pool.execute(
      'SELECT id FROM admin_users WHERE id = ? LIMIT 1',
      [id]
    )
    
    if (existing.length === 0) {
      return res.status(404).json({ message: 'ไม่พบ Admin User' })
    }
    
    // Check if email is already used by another user
    const [emailCheck] = await pool.execute(
      'SELECT id FROM admin_users WHERE email = ? AND id != ? LIMIT 1',
      [email, id]
    )
    
    if (emailCheck.length > 0) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' })
    }
    
    // Update admin user
    await pool.execute(
      'UPDATE admin_users SET email = ?, name = ?, role = ? WHERE id = ?',
      [email, name, role || 'admin', id]
    )
    
    const [rows] = await pool.execute(
      'SELECT id, email, name, role, created_at, updated_at FROM admin_users WHERE id = ?',
      [id]
    )

    // Log activity
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'Unknown'
    await createActivityLog(
      'admin',
      req.user.id,
      'แก้ไข Admin User',
      `Admin ID: ${id} - ${email} - ${name}`,
      ipAddress
    )
    
    res.json({
      success: true,
      message: 'อัปเดต Admin User สำเร็จ',
      data: mapAdminUser(rows[0])
    })
  } catch (error) {
    console.error('updateAdminUser error:', error)
    res.status(500).json({ message: 'ไม่สามารถอัปเดต Admin User ได้' })
  }
}

// Reset password
const resetAdminPassword = async (req, res) => {
  const { id } = req.params
  const { newPassword } = req.body
  
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
  }
  
  try {
    const [existing] = await pool.execute(
      'SELECT id FROM admin_users WHERE id = ? LIMIT 1',
      [id]
    )
    
    if (existing.length === 0) {
      return res.status(404).json({ message: 'ไม่พบ Admin User' })
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 10)
    
    await pool.execute(
      'UPDATE admin_users SET password_hash = ? WHERE id = ?',
      [passwordHash, id]
    )

    // Get admin info for logging
    const [admin] = await pool.execute('SELECT email, name FROM admin_users WHERE id = ?', [id])

    // Log activity
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'Unknown'
    await createActivityLog(
      'admin',
      req.user.id,
      'รีเซ็ตรหัสผ่าน Admin',
      `Admin ID: ${id} - ${admin[0]?.email || 'Unknown'}`,
      ipAddress
    )
    
    res.json({
      success: true,
      message: 'รีเซ็ตรหัสผ่านสำเร็จ'
    })
  } catch (error) {
    console.error('resetAdminPassword error:', error)
    res.status(500).json({ message: 'ไม่สามารถรีเซ็ตรหัสผ่านได้' })
  }
}

// Delete admin user
const deleteAdminUser = async (req, res) => {
  const { id } = req.params
  
  // Prevent deleting yourself
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ message: 'ไม่สามารถลบ Admin User ของตัวเองได้' })
  }
  
  try {
    // Get admin info before delete for logging
    const [admin] = await pool.execute('SELECT email, name FROM admin_users WHERE id = ?', [id])
    const adminInfo = admin.length > 0 ? admin[0] : null

    const [result] = await pool.execute('DELETE FROM admin_users WHERE id = ?', [id])
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบ Admin User' })
    }

    // Log activity
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'Unknown'
    await createActivityLog(
      'admin',
      req.user.id,
      'ลบ Admin User',
      `Admin ID: ${id} - ${adminInfo?.email || 'Unknown'} - ${adminInfo?.name || 'Unknown'}`,
      ipAddress
    )
    
    res.json({ success: true, message: 'ลบ Admin User สำเร็จ' })
  } catch (error) {
    console.error('deleteAdminUser error:', error)
    res.status(500).json({ message: 'ไม่สามารถลบ Admin User ได้' })
  }
}

module.exports = {
  getAllAdminUsers,
  getAdminUserById,
  createAdminUser,
  updateAdminUser,
  resetAdminPassword,
  deleteAdminUser,
}

