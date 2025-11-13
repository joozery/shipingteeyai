-- เพิ่มฟิลด์ tax_id และ address ใน customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50) NULL COMMENT 'หมายเลขนิติบุคคล',
ADD COLUMN IF NOT EXISTS address TEXT NULL COMMENT 'ที่อยู่';

-- ตรวจสอบว่าเพิ่มสำเร็จ
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE, 
  COLUMN_COMMENT 
FROM 
  INFORMATION_SCHEMA.COLUMNS 
WHERE 
  TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'customers'
ORDER BY ORDINAL_POSITION;

