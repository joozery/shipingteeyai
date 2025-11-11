const bcrypt = require('bcryptjs')
const { pool } = require('../config/database')
const { createActivityLog } = require('./activityLogController')

const getAllCustomers = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, user_id, name, email, phone, created_at, updated_at FROM customers ORDER BY created_at DESC'
    )
    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('getAllCustomers error:', error)
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลลูกค้าได้' })
  }
}

const updateCustomer = async (req, res) => {
  const { id } = req.params
  const { name, email, phone } = req.body

  if (!name || !email) {
    return res.status(400).json({ message: 'กรุณากรอกชื่อและอีเมลให้ครบถ้วน' })
  }

  try {
    const [result] = await pool.execute(
      'UPDATE customers SET name = ?, email = ?, phone = ? WHERE id = ?',
      [name, email, phone || null, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบลูกค้ารายนี้' })
    }

    const [updated] = await pool.execute(
      'SELECT id, user_id, name, email, phone, created_at, updated_at FROM customers WHERE id = ?',
      [id]
    )

    // Log activity
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'Unknown'
    await createActivityLog(
      'admin',
      req.user.id,
      'แก้ไขข้อมูลลูกค้า',
      `Customer ID: ${updated[0].user_id} - ${updated[0].name}`,
      ipAddress
    )

    res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('updateCustomer error:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' })
    }
    res.status(500).json({ message: 'ไม่สามารถอัพเดตข้อมูลลูกค้าได้' })
  }
}

const resetPassword = async (req, res) => {
  const { id } = req.params
  const { newPassword } = req.body

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' })
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10)

    const [result] = await pool.execute(
      'UPDATE customers SET password_hash = ? WHERE id = ?',
      [passwordHash, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบลูกค้ารายนี้' })
    }

    // Get customer info for logging
    const [customer] = await pool.execute('SELECT user_id, name FROM customers WHERE id = ?', [id])

    // Log activity
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'Unknown'
    await createActivityLog(
      'admin',
      req.user.id,
      'รีเซ็ตรหัสผ่านลูกค้า',
      `Customer ID: ${customer[0]?.user_id || id} - ${customer[0]?.name || 'Unknown'}`,
      ipAddress
    )

    res.json({ success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' })
  } catch (error) {
    console.error('resetPassword error:', error)
    res.status(500).json({ message: 'ไม่สามารถเปลี่ยนรหัสผ่านได้' })
  }
}

const deleteCustomer = async (req, res) => {
  const { id } = req.params

  try {
    // Get customer info before delete for logging
    const [customer] = await pool.execute('SELECT user_id, name FROM customers WHERE id = ?', [id])
    const customerInfo = customer.length > 0 ? customer[0] : null

    const [result] = await pool.execute('DELETE FROM customers WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบลูกค้ารายนี้' })
    }

    // Log activity
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'Unknown'
    await createActivityLog(
      'admin',
      req.user.id,
      'ลบลูกค้า',
      `Customer ID: ${customerInfo?.user_id || id} - ${customerInfo?.name || 'Unknown'}`,
      ipAddress
    )

    res.json({ success: true, message: 'ลบลูกค้าสำเร็จ' })
  } catch (error) {
    console.error('deleteCustomer error:', error)
    res.status(500).json({ message: 'ไม่สามารถลบลูกค้าได้' })
  }
}

module.exports = {
  getAllCustomers,
  updateCustomer,
  resetPassword,
  deleteCustomer,
}

const getCustomerProfile = async (req, res) => {
  try {
    const customerId = req.user.id
    const [rows] = await pool.execute(
      'SELECT id, user_id, name, email, phone, created_at FROM customers WHERE id = ? LIMIT 1',
      [customerId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' })
    }

    res.json({ success: true, data: rows[0] })
  } catch (error) {
    console.error('getCustomerProfile error:', error)
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลโปรไฟล์ได้' })
  }
}

const getCustomerTrackingItems = async (req, res) => {
  try {
    const customerId = req.user.id

    const [itemsRows] = await pool.execute(
      'SELECT * FROM tracking_items WHERE customer_id = ? ORDER BY created_at DESC',
      [customerId]
    )

    if (itemsRows.length === 0) {
      return res.json({ success: true, data: [] })
    }

    const ids = itemsRows.map((item) => item.id)
    const [historyRows] = await pool.query(
      'SELECT * FROM tracking_history WHERE tracking_item_id IN (?) ORDER BY created_at DESC',
      [ids]
    )

    const historyMap = new Map()
    historyRows.forEach((row) => {
      if (!historyMap.has(row.tracking_item_id)) {
        historyMap.set(row.tracking_item_id, [])
      }
      historyMap.get(row.tracking_item_id).push({
        id: row.id,
        trackingItemId: row.tracking_item_id,
        statusTitle: row.status_title,
        status: row.status,
        location: row.location,
        description: row.description,
        createdAt: row.created_at,
      })
    })

    const data = itemsRows.map((item) => ({
      id: item.id,
      trackingNumber: item.tracking_number,
      customerId: item.customer_id,
      customerName: item.customer_name,
      customerEmail: item.customer_email,
      statusTitle: item.status_title,
      status: item.status,
      currentLocation: item.current_location,
      expectedDate: item.expected_date,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      histories: historyMap.get(item.id) || [],
    }))

    res.json({ success: true, data })
  } catch (error) {
    console.error('getCustomerTrackingItems error:', error)
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลพัสดุได้' })
  }
}

module.exports = {
  getAllCustomers,
  updateCustomer,
  resetPassword,
  deleteCustomer,
  getCustomerProfile,
  getCustomerTrackingItems,
}
