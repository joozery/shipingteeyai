-- สร้างฐานข้อมูล
CREATE DATABASE IF NOT EXISTS teeyai_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE teeyai_db;

-- ตาราง admin_users (ผู้ดูแลระบบ)
CREATE TABLE IF NOT EXISTS admin_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin', 'staff') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง customers (ลูกค้า)
CREATE TABLE IF NOT EXISTS customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  tax_id VARCHAR(50) NULL COMMENT 'หมายเลขนิติบุคคล',
  address TEXT NULL COMMENT 'ที่อยู่',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง tracking_items (รายการพัสดุ)
CREATE TABLE IF NOT EXISTS tracking_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tracking_number VARCHAR(100) NOT NULL UNIQUE,
  customer_id INT,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  status_title ENUM('order_completed', 'china_in_transit', 'overseas_warehouse', 'expected_delivery', 'delivery_completed') DEFAULT 'order_completed',
  status ENUM('pending', 'processing', 'in_transit', 'delivered', 'cancelled') DEFAULT 'pending',
  current_location VARCHAR(255),
  expected_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_tracking_number (tracking_number),
  INDEX idx_customer_id (customer_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง tracking_history (ประวัติการอัพเดตสถานะ)
CREATE TABLE IF NOT EXISTS tracking_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tracking_item_id INT NOT NULL,
  status_title VARCHAR(255),
  status VARCHAR(50),
  location VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tracking_item_id) REFERENCES tracking_items(id) ON DELETE CASCADE,
  INDEX idx_tracking_item_id (tracking_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง articles (บทความ)
CREATE TABLE IF NOT EXISTS articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT,
  content LONGTEXT NOT NULL,
  image VARCHAR(500),
  author VARCHAR(255) DEFAULT 'ทีมงาน teeyaiimport',
  read_time VARCHAR(50) DEFAULT '5 นาที',
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง delivery_addresses (ที่อยู่จัดส่ง)
CREATE TABLE IF NOT EXISTS delivery_addresses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  receiver_name VARCHAR(255) NOT NULL,
  receiver_address TEXT NOT NULL,
  receiver_phone VARCHAR(20) NOT NULL,
  shipping_company VARCHAR(255) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_customer_id (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง activity_logs (บันทึกการทำงาน)
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_type ENUM('admin', 'customer') NOT NULL,
  user_id INT NOT NULL,
  action VARCHAR(255) NOT NULL,
  description TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_type, user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตาราง system_settings (การตั้งค่าระบบ)
CREATE TABLE IF NOT EXISTS system_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type ENUM('boolean', 'string', 'number', 'json') DEFAULT 'string',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- เพิ่มการตั้งค่าเริ่มต้น
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('email_notifications', 'true', 'boolean', 'เปิด/ปิดการแจ้งเตือนทางอีเมล'),
('sms_notifications', 'false', 'boolean', 'เปิด/ปิดการแจ้งเตือนทาง SMS'),
('auto_status_update', 'true', 'boolean', 'อัพเดตสถานะอัตโนมัติ'),
('maintenance_mode', 'false', 'boolean', 'โหมดบำรุงรักษา')
ON DUPLICATE KEY UPDATE setting_key=setting_key;

-- เพิ่มข้อมูล admin ตัวอย่าง (password: admin123)
INSERT INTO admin_users (email, password_hash, name, role) VALUES
('admin@teeyai.com', '$2a$10$Xv7zG5H8fKZ5Y8C9W0Z5F.N5Y8C9W0Z5F.N5Y8C9W0Z5F.N5Y8C9W0', 'Admin ระบบ', 'super_admin')
ON DUPLICATE KEY UPDATE email=email;

