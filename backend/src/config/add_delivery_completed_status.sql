-- เพิ่มสถานะใหม่ "จัดส่งสินค้าสำเร็จ ขอบคุณที่ใช้บริการ" ในตาราง tracking_items
-- รัน SQL นี้บน production database

ALTER TABLE tracking_items 
MODIFY COLUMN status_title ENUM(
  'order_completed', 
  'china_in_transit', 
  'overseas_warehouse', 
  'expected_delivery', 
  'delivery_completed'
) DEFAULT 'order_completed';

