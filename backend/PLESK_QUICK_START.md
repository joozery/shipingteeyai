# 🚀 คู่มือ Deploy Backend ไปยัง Plesk Obsidian (ฉบับย่อ)

## 📝 ขั้นตอนหลัก

### 1. เตรียมไฟล์
- อัพโหลดโฟลเดอร์ `backend/` ทั้งหมดไปยัง Plesk
- วางไว้ที่ `/httpdocs/backend/` หรือ `/subdomain/backend/`

### 2. สร้าง Node.js Application ใน Plesk

1. ไปที่ **Websites & Domains** → เลือก domain
2. คลิก **Node.js** → **Add Node.js App**
3. ตั้งค่า:
   - **Application root**: `/httpdocs/backend`
   - **Application startup file**: `src/server.js`
   - **Application mode**: `production`
   - **Node.js version**: 18.x หรือ 20.x

### 3. ตั้งค่า Environment Variables

ใน Plesk Node.js → **Environment Variables** เพิ่ม:

```
DB_HOST=145.223.21.117
DB_USER=debian-sys-maint
DB_PASSWORD=Str0ngP@ssw0rd!
DB_NAME=teeyai_db
DB_PORT=3306
PORT=5001
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this
CLOUDINARY_CLOUD_NAME=dgtgsl5sc
CLOUDINARY_API_KEY=748168254995584
CLOUDINARY_API_SECRET=5z2saC-8E12LtvjCaTHptK0hWMQ
CORS_ORIGIN=https://yourdomain.com
```

### 4. ติดตั้ง Dependencies

เปิด **Terminal/SSH** ใน Plesk:

```bash
cd /var/www/vhosts/yourdomain.com/httpdocs/backend
npm install --production
```

### 5. ตั้งค่า Reverse Proxy (แนะนำ)

ใน **Apache & nginx Settings** → **Additional nginx directives**:

```nginx
location /api {
    proxy_pass http://localhost:5001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

### 6. Restart Application

ใน Plesk Node.js → คลิก **Restart application**

### 7. ทดสอบ

```bash
# Health check
curl http://yourdomain.com/api/health
```

---

## ⚠️ หมายเหตุสำคัญ

1. **เปลี่ยน JWT_SECRET** เป็นค่าที่ปลอดภัย
2. **อัพเดต CORS_ORIGIN** เป็น URL ของ frontend
3. **ตรวจสอบ Database** ว่าสามารถเชื่อมต่อได้
4. **ตรวจสอบ Logs** หากมีปัญหา

---

## 📚 ดูคู่มือฉบับเต็ม

ดูไฟล์ `DEPLOY_PLESK.md` สำหรับรายละเอียดเพิ่มเติม


