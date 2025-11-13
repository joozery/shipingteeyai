-- เพิ่มฟิลด์ใหม่ในตาราง customers
-- รัน SQL นี้บน production database

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50) NULL COMMENT 'หมายเลขนิติบุคคล',
ADD COLUMN IF NOT EXISTS address TEXT NULL COMMENT 'ที่อยู่';

