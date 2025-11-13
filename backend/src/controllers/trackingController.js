const bcrypt = require('bcryptjs')
const { pool } = require('../config/database')
const { createActivityLog } = require('./activityLogController')

const mapTrackingItem = (row) => {
  // Format expected_date as YYYY-MM-DD to avoid timezone issues
  let expectedDate = null
  if (row.expected_date) {
    // If it's a Date object, format it as YYYY-MM-DD
    if (row.expected_date instanceof Date) {
      const year = row.expected_date.getFullYear()
      const month = String(row.expected_date.getMonth() + 1).padStart(2, '0')
      const day = String(row.expected_date.getDate()).padStart(2, '0')
      expectedDate = `${year}-${month}-${day}`
    } else if (typeof row.expected_date === 'string') {
      // If it's already a string, extract YYYY-MM-DD part
      expectedDate = row.expected_date.split('T')[0].split(' ')[0]
    }
  }
  
  return {
    id: row.id,
    trackingNumber: row.tracking_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    productName: row.product_name,
    productQuantity: row.product_quantity,
    statusTitle: row.status_title,
    status: row.status,
    currentLocation: row.current_location,
    expectedDate: expectedDate,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const mapTrackingHistory = (row) => ({
  id: row.id,
  trackingItemId: row.tracking_item_id,
  statusTitle: row.status_title,
  status: row.status,
  location: row.location,
  description: row.description,
  createdAt: row.created_at,
})

const getTrackingItems = async (req, res) => {
  try {
    const [itemsRows] = await pool.execute(
      'SELECT * FROM tracking_items ORDER BY created_at DESC'
    )

    const items = itemsRows.map(mapTrackingItem)

    if (items.length === 0) {
      return res.json({ success: true, data: [] })
    }

    const ids = items.map((item) => item.id)
    const [historyRows] = await pool.query(
      `SELECT * FROM tracking_history WHERE tracking_item_id IN (?) ORDER BY created_at DESC`,
      [ids]
    )

    const historyMap = new Map()
    historyRows.forEach((row) => {
      const history = mapTrackingHistory(row)
      if (!historyMap.has(history.trackingItemId)) {
        historyMap.set(history.trackingItemId, [])
      }
      historyMap.get(history.trackingItemId).push(history)
    })

    const data = items.map((item) => ({
      ...item,
      histories: historyMap.get(item.id) || [],
    }))

    res.json({ success: true, data })
  } catch (error) {
    console.error('getTrackingItems error:', error)
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลรายการพัสดุได้' })
  }
}

const createTrackingItem = async (req, res) => {
  const {
    trackingNumber,
    customerId,
    productName,
    productQuantity,
    statusTitle,
    status,
    expectedDate,
    currentLocation,
    description,
  } = req.body

  if (!trackingNumber || !customerId) {
    return res.status(400).json({ message: 'กรุณากรอกหมายเลข TRACKING และเลือกลูกค้า' })
  }

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    // Get customer info
    const [customers] = await connection.execute(
      'SELECT id, name, email FROM customers WHERE id = ? LIMIT 1',
      [customerId]
    )

    if (customers.length === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'ไม่พบข้อมูลลูกค้า' })
    }

    const customer = customers[0]

    // Convert expectedDate to MySQL format (YYYY-MM-DD) if provided
    let formattedExpectedDate = null
    if (expectedDate) {
      console.log('[createTrackingItem] Received expectedDate:', expectedDate, 'Type:', typeof expectedDate)
      // If already in YYYY-MM-DD format, use it directly to avoid timezone issues
      if (typeof expectedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(expectedDate)) {
        formattedExpectedDate = expectedDate
        console.log('[createTrackingItem] Using date directly:', formattedExpectedDate)
      } else {
        // Otherwise, parse and format
        const date = new Date(expectedDate)
        if (!isNaN(date.getTime())) {
          // Use local date components to avoid timezone shift
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          formattedExpectedDate = `${year}-${month}-${day}`
          console.log('[createTrackingItem] Parsed date:', formattedExpectedDate)
        }
      }
    }

    // Try to insert with product fields, fallback to basic fields if columns don't exist
    let insertResult
    try {
      [insertResult] = await connection.execute(
        `INSERT INTO tracking_items 
          (tracking_number, customer_id, customer_name, customer_email, product_name, product_quantity, status_title, status, current_location, expected_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
        [
          trackingNumber,
          customerId,
          customer.name,
          customer.email,
          productName || null,
          productQuantity || 1,
          statusTitle || 'order_completed',
          status || 'pending',
          currentLocation || null,
          formattedExpectedDate,
        ]
      )
    } catch (error) {
      // If product columns don't exist, use basic insert
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        [insertResult] = await connection.execute(
          `INSERT INTO tracking_items 
            (tracking_number, customer_id, customer_name, customer_email, status_title, status, current_location, expected_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)` ,
          [
            trackingNumber,
            customerId,
            customer.name,
            customer.email,
            statusTitle || 'order_completed',
            status || 'pending',
            currentLocation || null,
            formattedExpectedDate,
          ]
        )
      } else {
        throw error
      }
    }

    const trackingItemId = insertResult.insertId

    await connection.execute(
      `INSERT INTO tracking_history (tracking_item_id, status_title, status, location, description)
       VALUES (?, ?, ?, ?, ?)` ,
      [
        trackingItemId,
        statusTitle || 'order_completed',
        status || 'pending',
        currentLocation || null,
        description || null,
      ]
    )

    await connection.commit()

    const [itemRows] = await connection.execute(
      'SELECT * FROM tracking_items WHERE id = ? LIMIT 1',
      [trackingItemId]
    )
    const [historyRows] = await connection.execute(
      'SELECT * FROM tracking_history WHERE tracking_item_id = ? ORDER BY created_at DESC',
      [trackingItemId]
    )

    const data = {
      ...mapTrackingItem(itemRows[0]),
      histories: historyRows.map(mapTrackingHistory),
    }

    // Log activity
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'Unknown'
    await createActivityLog(
      'admin',
      req.user.id,
      'เพิ่มรายการพัสดุใหม่',
      `Tracking: ${trackingNumber} - ${customer.name}`,
      ipAddress
    )

    res.status(201).json({ success: true, data })
  } catch (error) {
    await connection.rollback()
    console.error('createTrackingItem error:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'หมายเลขพัสดุนี้ถูกใช้งานแล้ว' })
    }
    res.status(500).json({ message: 'ไม่สามารถสร้างรายการพัสดุได้' })
  } finally {
    connection.release()
  }
}

const updateTrackingItem = async (req, res) => {
  const { id } = req.params
  const {
    statusTitle,
    status,
    currentLocation,
    expectedDate,
    description,
  } = req.body

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const [existingRows] = await connection.execute(
      'SELECT * FROM tracking_items WHERE id = ? LIMIT 1',
      [id]
    )

    if (existingRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'ไม่พบรายการพัสดุที่ต้องการอัพเดต' })
    }

    const existing = existingRows[0]

    const nextStatusTitle = statusTitle || existing.status_title
    const nextStatus = status || existing.status
    const nextLocation = currentLocation ?? existing.current_location
    
    // Convert expectedDate to MySQL format (YYYY-MM-DD) if provided
    let nextExpectedDate = null
    if (expectedDate) {
      console.log('[updateTrackingItem] Received expectedDate:', expectedDate, 'Type:', typeof expectedDate)
      // If already in YYYY-MM-DD format, use it directly to avoid timezone issues
      if (typeof expectedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(expectedDate)) {
        nextExpectedDate = expectedDate
        console.log('[updateTrackingItem] Using date directly:', nextExpectedDate)
      } else {
        // Otherwise, parse and format
        const date = new Date(expectedDate)
        if (!isNaN(date.getTime())) {
          // Use local date components to avoid timezone shift
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          nextExpectedDate = `${year}-${month}-${day}`
          console.log('[updateTrackingItem] Parsed date:', nextExpectedDate)
        }
      }
    }

    await connection.execute(
      `UPDATE tracking_items SET status_title = ?, status = ?, current_location = ?, expected_date = ? WHERE id = ?`,
      [nextStatusTitle, nextStatus, nextLocation, nextExpectedDate, id]
    )

    await connection.execute(
      `INSERT INTO tracking_history (tracking_item_id, status_title, status, location, description)
       VALUES (?, ?, ?, ?, ?)` ,
      [id, nextStatusTitle, nextStatus, nextLocation, description || null]
    )

    await connection.commit()

    const [itemRows] = await connection.execute(
      'SELECT * FROM tracking_items WHERE id = ? LIMIT 1',
      [id]
    )
    const [historyRows] = await connection.execute(
      'SELECT * FROM tracking_history WHERE tracking_item_id = ? ORDER BY created_at DESC',
      [id]
    )

    const data = {
      ...mapTrackingItem(itemRows[0]),
      histories: historyRows.map(mapTrackingHistory),
    }

    // Log activity
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'Unknown'
    await createActivityLog(
      'admin',
      req.user.id,
      'อัพเดตสถานะพัสดุ',
      `Tracking: ${existing.tracking_number} → ${statusTitle || existing.status_title}`,
      ipAddress
    )

    res.json({ success: true, data })
  } catch (error) {
    await connection.rollback()
    console.error('updateTrackingItem error:', error)
    res.status(500).json({ message: 'ไม่สามารถอัพเดตสถานะพัสดุได้' })
  } finally {
    connection.release()
  }
}

const deleteTrackingItem = async (req, res) => {
  const { id } = req.params
  try {
    // Get tracking number before delete for logging
    const [itemRows] = await pool.execute('SELECT tracking_number FROM tracking_items WHERE id = ?', [id])
    const trackingNumber = itemRows.length > 0 ? itemRows[0].tracking_number : 'Unknown'

    const [result] = await pool.execute('DELETE FROM tracking_items WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบรายการพัสดุ' })
    }

    // Log activity
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'Unknown'
    await createActivityLog(
      'admin',
      req.user.id,
      'ลบรายการพัสดุ',
      `Tracking: ${trackingNumber}`,
      ipAddress
    )

    res.json({ success: true, message: 'ลบรายการพัสดุสำเร็จ' })
  } catch (error) {
    console.error('deleteTrackingItem error:', error)
    res.status(500).json({ message: 'ไม่สามารถลบรายการพัสดุได้' })
  }
}

const searchTrackingItem = async (req, res) => {
  const { trackingNumber } = req.query
  
  if (!trackingNumber) {
    return res.status(400).json({ 
      success: false, 
      message: 'กรุณาระบุหมายเลขพัสดุ' 
    })
  }

  try {
    const [itemRows] = await pool.execute(
      'SELECT * FROM tracking_items WHERE tracking_number = ? LIMIT 1',
      [trackingNumber]
    )

    if (itemRows.length === 0) {
      return res.json({ 
        success: false, 
        message: 'ไม่พบข้อมูลพัสดุ',
        data: null
      })
    }

    const [historyRows] = await pool.execute(
      'SELECT * FROM tracking_history WHERE tracking_item_id = ? ORDER BY created_at DESC',
      [itemRows[0].id]
    )

    const data = {
      ...mapTrackingItem(itemRows[0]),
      histories: historyRows.map(mapTrackingHistory),
    }

    res.json({ 
      success: true, 
      data 
    })
  } catch (error) {
    console.error('searchTrackingItem error:', error)
    res.status(500).json({ 
      success: false,
      message: 'เกิดข้อผิดพลาดในการค้นหา' 
    })
  }
}

module.exports = {
  getTrackingItems,
  createTrackingItem,
  updateTrackingItem,
  deleteTrackingItem,
  searchTrackingItem,
}
