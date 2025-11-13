-- เพิ่มฟิลด์ product_name และ product_quantity ใน tracking_items
ALTER TABLE tracking_items 
ADD COLUMN product_name VARCHAR(255) NULL COMMENT 'ชื่อสินค้า';

ALTER TABLE tracking_items 
ADD COLUMN product_quantity INT DEFAULT 1 COMMENT 'จำนวนของสินค้า';

