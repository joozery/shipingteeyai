const { pool } = require('../config/database')

// Map database row to response object
const mapDeliveryAddress = (row) => ({
  id: row.id,
  customerId: row.customer_id,
  receiverName: row.receiver_name,
  receiverAddress: row.receiver_address,
  receiverPhone: row.receiver_phone,
  shippingCompany: row.shipping_company,
  isDefault: Boolean(row.is_default),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

// Get all delivery addresses (Admin only)
const getAllDeliveryAddresses = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT da.*, c.name as customer_name, c.user_id as customer_user_id
      FROM delivery_addresses da
      LEFT JOIN customers c ON da.customer_id = c.id
      ORDER BY da.created_at DESC
    `)
    
    const addresses = rows.map(row => ({
      ...mapDeliveryAddress(row),
      customerName: row.customer_name,
      customerUserId: row.customer_user_id,
    }))
    
    res.json({ success: true, data: addresses })
  } catch (error) {
    console.error('getAllDeliveryAddresses error:', error)
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลที่อยู่จัดส่งได้' })
  }
}

// Get delivery addresses by customer ID (Admin & Customer)
const getDeliveryAddressesByCustomer = async (req, res) => {
  const { customerId } = req.params
  
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM delivery_addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC',
      [customerId]
    )
    
    const addresses = rows.map(mapDeliveryAddress)
    res.json({ success: true, data: addresses })
  } catch (error) {
    console.error('getDeliveryAddressesByCustomer error:', error)
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลที่อยู่จัดส่งได้' })
  }
}

// Get customer's own delivery addresses (Customer only)
const getMyDeliveryAddresses = async (req, res) => {
  const customerId = req.user.id // From auth middleware
  
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM delivery_addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC',
      [customerId]
    )
    
    const addresses = rows.map(mapDeliveryAddress)
    res.json({ success: true, data: addresses })
  } catch (error) {
    console.error('getMyDeliveryAddresses error:', error)
    res.status(500).json({ message: 'ไม่สามารถดึงข้อมูลที่อยู่จัดส่งได้' })
  }
}

// Create delivery address
const createDeliveryAddress = async (req, res) => {
  const { customerId, receiverName, receiverAddress, receiverPhone, shippingCompany, isDefault } = req.body
  
  // If customer is creating their own address
  const finalCustomerId = req.user.role === 'customer' ? req.user.id : customerId
  
  if (!finalCustomerId || !receiverName || !receiverAddress || !receiverPhone || !shippingCompany) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
  }
  
  const connection = await pool.getConnection()
  
  try {
    await connection.beginTransaction()
    
    // If this address is set as default, unset other defaults
    if (isDefault) {
      await connection.execute(
        'UPDATE delivery_addresses SET is_default = FALSE WHERE customer_id = ?',
        [finalCustomerId]
      )
    }
    
    const [result] = await connection.execute(
      `INSERT INTO delivery_addresses 
        (customer_id, receiver_name, receiver_address, receiver_phone, shipping_company, is_default)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [finalCustomerId, receiverName, receiverAddress, receiverPhone, shippingCompany, isDefault || false]
    )
    
    await connection.commit()
    
    const [rows] = await connection.execute(
      'SELECT * FROM delivery_addresses WHERE id = ?',
      [result.insertId]
    )
    
    res.json({ 
      success: true, 
      message: 'เพิ่มที่อยู่จัดส่งสำเร็จ',
      data: mapDeliveryAddress(rows[0])
    })
  } catch (error) {
    await connection.rollback()
    console.error('createDeliveryAddress error:', error)
    res.status(500).json({ message: 'ไม่สามารถเพิ่มที่อยู่จัดส่งได้' })
  } finally {
    connection.release()
  }
}

// Update delivery address
const updateDeliveryAddress = async (req, res) => {
  const { id } = req.params
  const { receiverName, receiverAddress, receiverPhone, shippingCompany, isDefault } = req.body
  
  const connection = await pool.getConnection()
  
  try {
    await connection.beginTransaction()
    
    // Check if address exists and belongs to customer (if customer)
    const [existing] = await connection.execute(
      'SELECT * FROM delivery_addresses WHERE id = ?',
      [id]
    )
    
    if (existing.length === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'ไม่พบที่อยู่จัดส่ง' })
    }
    
    // If customer is updating, verify ownership
    if (req.user.role === 'customer' && existing[0].customer_id !== req.user.id) {
      await connection.rollback()
      return res.status(403).json({ message: 'ไม่มีสิทธิ์แก้ไขที่อยู่นี้' })
    }
    
    // If this address is set as default, unset other defaults
    if (isDefault) {
      await connection.execute(
        'UPDATE delivery_addresses SET is_default = FALSE WHERE customer_id = ? AND id != ?',
        [existing[0].customer_id, id]
      )
    }
    
    await connection.execute(
      `UPDATE delivery_addresses 
       SET receiver_name = ?, receiver_address = ?, receiver_phone = ?, 
           shipping_company = ?, is_default = ?
       WHERE id = ?`,
      [receiverName, receiverAddress, receiverPhone, shippingCompany, isDefault || false, id]
    )
    
    await connection.commit()
    
    const [rows] = await connection.execute(
      'SELECT * FROM delivery_addresses WHERE id = ?',
      [id]
    )
    
    res.json({ 
      success: true, 
      message: 'อัปเดตที่อยู่จัดส่งสำเร็จ',
      data: mapDeliveryAddress(rows[0])
    })
  } catch (error) {
    await connection.rollback()
    console.error('updateDeliveryAddress error:', error)
    res.status(500).json({ message: 'ไม่สามารถอัปเดตที่อยู่จัดส่งได้' })
  } finally {
    connection.release()
  }
}

// Delete delivery address
const deleteDeliveryAddress = async (req, res) => {
  const { id } = req.params
  
  try {
    // Check if address exists and belongs to customer (if customer)
    const [existing] = await pool.execute(
      'SELECT * FROM delivery_addresses WHERE id = ?',
      [id]
    )
    
    if (existing.length === 0) {
      return res.status(404).json({ message: 'ไม่พบที่อยู่จัดส่ง' })
    }
    
    // If customer is deleting, verify ownership
    if (req.user.role === 'customer' && existing[0].customer_id !== req.user.id) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์ลบที่อยู่นี้' })
    }
    
    await pool.execute('DELETE FROM delivery_addresses WHERE id = ?', [id])
    
    res.json({ success: true, message: 'ลบที่อยู่จัดส่งสำเร็จ' })
  } catch (error) {
    console.error('deleteDeliveryAddress error:', error)
    res.status(500).json({ message: 'ไม่สามารถลบที่อยู่จัดส่งได้' })
  }
}

module.exports = {
  getAllDeliveryAddresses,
  getDeliveryAddressesByCustomer,
  getMyDeliveryAddresses,
  createDeliveryAddress,
  updateDeliveryAddress,
  deleteDeliveryAddress,
}

