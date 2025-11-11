const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { createActivityLog } = require('./activityLogController');

// สร้าง JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email และ Password จำเป็นต้องกรอก' });
    }

    // ค้นหา admin
    const [users] = await pool.execute(
      'SELECT * FROM admin_users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = users[0];

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // อัพเดต last_login_at
    await pool.execute(
      'UPDATE admin_users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    // สร้าง token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'Unknown'
    await createActivityLog(
      'admin',
      user.id,
      'เข้าสู่ระบบ',
      `เข้าสู่ระบบ Admin Panel - ${user.email}`,
      ipAddress
    )

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
};

// Customer Login
const customerLogin = async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'User ID และ Password จำเป็นต้องกรอก' });
    }

    // ค้นหา customer
    const [users] = await pool.execute(
      'SELECT * FROM customers WHERE user_id = ? OR email = ?',
      [userId, userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'User ID หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = users[0];

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'User ID หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // อัพเดต last_login_at
    await pool.execute(
      'UPDATE customers SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    // สร้าง token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'customer'
    });

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'Unknown'
    await createActivityLog(
      'customer',
      user.id,
      'เข้าสู่ระบบ',
      `เข้าสู่ระบบ Customer Dashboard - ${user.user_id || user.email}`,
      ipAddress
    )

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.id,
        userId: user.user_id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: 'customer'
      }
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
};

// Register Admin (สำหรับ Super Admin เท่านั้น)
const registerAdmin = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // ตรวจสอบว่ามี email ซ้ำหรือไม่
    const [existing] = await pool.execute(
      'SELECT id FROM admin_users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin
    const [result] = await pool.execute(
      'INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, role || 'admin']
    );

    res.status(201).json({
      message: 'สร้างบัญชี Admin สำเร็จ',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Register admin error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างบัญชี' });
  }
};

module.exports = {
  adminLogin,
  customerLogin,
  registerAdmin
};

