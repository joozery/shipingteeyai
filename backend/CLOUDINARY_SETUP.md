# การตั้งค่า Cloudinary

## ปัญหา
```
Missing required parameter - api_key
Failed to load resource: the server responded with a status of 500
```

## วิธีแก้ไข

เพิ่ม environment variables ต่อไปนี้ในไฟล์ `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=dgtgsl5sc
CLOUDINARY_API_KEY=5z2saC-8E12LtvjCaTHptK0hWMQ
CLOUDINARY_API_SECRET=your-api-secret-here
```

## วิธีหา API Secret

1. ไปที่ [Cloudinary Dashboard](https://console.cloudinary.com/)
2. Login เข้าสู่ระบบ
3. ไปที่ Settings > Security
4. คัดลอก **API Secret** (จะแสดงแค่ครั้งเดียวตอนสร้าง)

## หลังจากตั้งค่าแล้ว

1. Restart backend server:
   ```bash
   cd backend
   pkill -f "node src/server.js"
   node src/server.js
   ```

2. ทดสอบอัพโหลดรูปภาพอีกครั้ง

## หมายเหตุ

- API Secret ควรเก็บไว้เป็นความลับ
- อย่า commit `.env` ลง Git
- หาก API Secret หายไป ต้องสร้างใหม่ใน Cloudinary Dashboard

