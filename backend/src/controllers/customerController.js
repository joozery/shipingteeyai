const bcrypt = require('bcryptjs')
const { pool } = require('../config/database')
const { createActivityLog } = require('./activityLogController')

// Generate username (format: TEEYAI + 6 digits)
const generateUsername = async () => {
  let username
  let exists = true
  let attempts = 0
  
  while (exists && attempts < 100) {
    const randomNum = Math.floor(100000 + Math.random() * 900000) // 6 digits
    username = `TEEYAI${randomNum}`
    
    const [rows] = await pool.execute(
      'SELECT id FROM customers WHERE user_id = ? LIMIT 1',
      [username]
    )
    
    exists = rows.length > 0
    attempts++
  }
  
  if (exists) {
    throw new Error('ไม่สามารถสร้าง Username ได้ กรุณาลองอีกครั้ง')
  }
  
  return username
}

// Generate password (8 characters: uppercase, lowercase, numbers)
const generatePassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const all = uppercase + lowercase + numbers
  
  let password = ''
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  
  // Fill the rest randomly
  for (let i = password.length; i < 8; i++) {
    password += all[Math.floor(Math.random() * all.length)]
  }
  
  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

const getAllCustomers = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, user_id, name, email, phone, tax_id, address, created_at, updated_at FROM customers ORDER BY created_at DESC'
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

const createCustomer = async (req, res) => {
  const { name, email, phone, taxId, address, username, password } = req.body

  if (!name || !email) {
    return res.status(400).json({ message: 'กรุณากรอกชื่อและอีเมลให้ครบถ้วน' })
  }

  if (!username || !password) {
    return res.status(400).json({ message: 'กรุณาระบุ Username และ Password' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password ต้องมีอย่างน้อย 6 ตัวอักษร' })
  }

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    // Check if email already exists
    const [existingEmail] = await connection.execute(
      'SELECT id FROM customers WHERE email = ? LIMIT 1',
      [email]
    )

    if (existingEmail.length > 0) {
      await connection.rollback()
      return res.status(409).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' })
    }

    // Check if username already exists
    const [existingUsername] = await connection.execute(
      'SELECT id FROM customers WHERE user_id = ? LIMIT 1',
      [username]
    )

    if (existingUsername.length > 0) {
      await connection.rollback()
      return res.status(409).json({ message: 'Username นี้ถูกใช้งานแล้ว' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // Insert customer
    const [result] = await connection.execute(
      'INSERT INTO customers (user_id, password_hash, name, email, phone, tax_id, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, passwordHash, name, email, phone || null, taxId || null, address || null]
    )

    const customerId = result.insertId

    const [newCustomer] = await connection.execute(
      'SELECT id, user_id, name, email, phone, tax_id, address, created_at, updated_at FROM customers WHERE id = ?',
      [customerId]
    )

    await connection.commit()

    // Log activity
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'Unknown'
    await createActivityLog(
      'admin',
      req.user.id,
      'เพิ่มลูกค้าใหม่',
      `Customer: ${username} - ${name}`,
      ipAddress
    )

    res.status(201).json({
      success: true,
      data: {
        ...newCustomer[0]
      }
    })
  } catch (error) {
    await connection.rollback()
    console.error('createCustomer error:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'ข้อมูลซ้ำกับที่มีอยู่แล้ว' })
    }
    res.status(500).json({ message: 'ไม่สามารถสร้างลูกค้าได้' })
  } finally {
    connection.release()
  }
}

module.exports = {
  getAllCustomers,
  createCustomer,
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

    // Query expected_date as string to avoid timezone issues
    const [itemsRows] = await pool.execute(
      `SELECT 
        id,
        tracking_number,
        customer_id,
        customer_name,
        customer_email,
        product_name,
        product_quantity,
        status_title,
        status,
        current_location,
        DATE_FORMAT(expected_date, '%Y-%m-%d') as expected_date,
        created_at,
        updated_at
      FROM tracking_items 
      WHERE customer_id = ? 
      ORDER BY created_at DESC`,
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

    const data = itemsRows.map((item) => {
      // expected_date is already formatted as YYYY-MM-DD string from SQL query
      const expectedDate = item.expected_date || null
      
      return {
        id: item.id,
        trackingNumber: item.tracking_number,
        customerId: item.customer_id,
        customerName: item.customer_name,
        customerEmail: item.customer_email,
        productName: item.product_name,
        productQuantity: item.product_quantity,
        statusTitle: item.status_title,
        status: item.status,
        currentLocation: item.current_location,
        expectedDate: expectedDate,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        histories: historyMap.get(item.id) || [],
      }
    })

    res.json({ success: true, data })
  } catch (error) {
    console.error('getCustomerTrackingItems error:', error)
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลพัสดุได้' })
  }
}

const updateTrackingItemLocation = async (req, res) => {
  try {
    const customerId = req.user.id
    const { id } = req.params
    const { currentLocation } = req.body

    if (!currentLocation) {
      return res.status(400).json({ message: 'กรุณาระบุที่อยู่ปลายทาง' })
    }

    // Verify that the tracking item belongs to this customer
    const [itemRows] = await pool.execute(
      'SELECT * FROM tracking_items WHERE id = ? AND customer_id = ? LIMIT 1',
      [id, customerId]
    )

    if (itemRows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบรายการพัสดุหรือไม่มีสิทธิ์แก้ไข' })
    }

    // Update current location
    await pool.execute(
      'UPDATE tracking_items SET current_location = ?, updated_at = NOW() WHERE id = ?',
      [currentLocation, id]
    )

    // Fetch updated item
    const [updatedRows] = await pool.execute(
      'SELECT * FROM tracking_items WHERE id = ? LIMIT 1',
      [id]
    )

    const data = {
      id: updatedRows[0].id,
      trackingNumber: updatedRows[0].tracking_number,
      customerId: updatedRows[0].customer_id,
      customerName: updatedRows[0].customer_name,
      customerEmail: updatedRows[0].customer_email,
      statusTitle: updatedRows[0].status_title,
      status: updatedRows[0].status,
      currentLocation: updatedRows[0].current_location,
      expectedDate: updatedRows[0].expected_date,
      createdAt: updatedRows[0].created_at,
      updatedAt: updatedRows[0].updated_at,
    }

    res.json({ success: true, data })
  } catch (error) {
    console.error('updateTrackingItemLocation error:', error)
    res.status(500).json({ message: 'ไม่สามารถอัพเดตที่อยู่ปลายทางได้' })
  }
}

module.exports = {
  getAllCustomers,
  createCustomer,
  updateCustomer,
  resetPassword,
  deleteCustomer,
  getCustomerProfile,
  getCustomerTrackingItems,
  updateTrackingItemLocation,
}
