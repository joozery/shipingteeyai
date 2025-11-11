# คู่มือการ Deploy Backend ไปยัง Plesk Obsidian

## 📋 สารบัญ
1. [เตรียมไฟล์สำหรับ Deploy](#เตรียมไฟล์สำหรับ-deploy)
2. [ขั้นตอนการ Deploy บน Plesk](#ขั้นตอนการ-deploy-บน-plesk)
3. [การตั้งค่า Environment Variables](#การตั้งค่า-environment-variables)
4. [การตั้งค่า Database](#การตั้งค่า-database)
5. [การตั้งค่า Node.js Application](#การตั้งค่า-nodejs-application)
6. [การตั้งค่า PM2 (Process Manager)](#การตั้งค่า-pm2-process-manager)
7. [การตรวจสอบและ Troubleshooting](#การตรวจสอบและ-troubleshooting)

---

## 🚀 เตรียมไฟล์สำหรับ Deploy

### 1. สร้างไฟล์ `.env.example` (ถ้ายังไม่มี)
```env
# Database Configuration
DB_HOST=145.223.21.117
DB_USER=debian-sys-maint
DB_PASSWORD=Str0ngP@ssw0rd!
DB_NAME=teeyai_db
DB_PORT=3306

# Server Configuration
PORT=5001
NODE_ENV=production

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dgtgsl5sc
CLOUDINARY_API_KEY=748168254995584
CLOUDINARY_API_SECRET=5z2saC-8E12LtvjCaTHptK0hWMQ
```

### 2. ไฟล์ที่ต้องอัพโหลดไปยัง Plesk
```
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   └── server.js
├── package.json
├── .env (สร้างบน Plesk)
└── .gitignore
```

---

## 📦 ขั้นตอนการ Deploy บน Plesk

### ขั้นตอนที่ 1: สร้าง Node.js Application

1. **เข้าสู่ระบบ Plesk Obsidian**
   - ไปที่ **Websites & Domains**
   - เลือก domain หรือ subdomain ที่ต้องการ

2. **เพิ่ม Node.js Application**
   - คลิก **Node.js** ในเมนู
   - คลิก **Add Node.js App**

3. **ตั้งค่า Application**
   - **Application root**: `/httpdocs/backend` หรือ `/subdomain/backend`
   - **Application startup file**: `src/server.js`
   - **Application mode**: `production`
   - **Node.js version**: เลือกเวอร์ชันล่าสุด (แนะนำ 18.x หรือ 20.x)

### ขั้นตอนที่ 2: อัพโหลดไฟล์

**วิธีที่ 1: ใช้ File Manager**
1. ไปที่ **Files** ใน Plesk
2. สร้างโฟลเดอร์ `backend` (ถ้ายังไม่มี)
3. อัพโหลดไฟล์ทั้งหมดจาก `backend/` ไปยัง `/httpdocs/backend/` หรือ `/subdomain/backend/`

**วิธีที่ 2: ใช้ Git (แนะนำ)**
```bash
# บน Plesk SSH
cd /var/www/vhosts/yourdomain.com/httpdocs
git clone https://github.com/yourusername/your-repo.git
cd your-repo/backend
npm install --production
```

**วิธีที่ 3: ใช้ FTP/SFTP**
- ใช้ FileZilla หรือ WinSCP
- อัพโหลดไฟล์ทั้งหมดไปยัง `/httpdocs/backend/`

### ขั้นตอนที่ 3: ติดตั้ง Dependencies

1. **เปิด Terminal/SSH ใน Plesk**
   - ไปที่ **Tools & Settings** → **SSH Access**
   - หรือใช้ **File Manager** → **Terminal**

2. **รันคำสั่ง**
```bash
cd /var/www/vhosts/yourdomain.com/httpdocs/backend
npm install --production
```

---

## ⚙️ การตั้งค่า Environment Variables

### วิธีที่ 1: ใช้ Plesk Node.js Environment Variables

1. ไปที่ **Node.js** ใน Plesk
2. เลือก Application ของคุณ
3. คลิก **Environment Variables**
4. เพิ่มตัวแปรต่อไปนี้:

```
DB_HOST=145.223.21.117
DB_USER=debian-sys-maint
DB_PASSWORD=Str0ngP@ssw0rd!
DB_NAME=teeyai_db
DB_PORT=3306
PORT=5001
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLOUDINARY_CLOUD_NAME=dgtgsl5sc
CLOUDINARY_API_KEY=748168254995584
CLOUDINARY_API_SECRET=5z2saC-8E12LtvjCaTHptK0hWMQ
```

### วิธีที่ 2: สร้างไฟล์ `.env` (ถ้า Plesk รองรับ)

1. ใช้ **File Manager** สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/`
2. ใส่ค่าตาม `.env.example` ด้านบน

---

## 🗄️ การตั้งค่า Database

### 1. ตรวจสอบ Database Connection

- Database อยู่ที่ `145.223.21.117`
- ตรวจสอบว่า Plesk server สามารถเชื่อมต่อได้:
  - เปิด **Firewall** สำหรับ port 3306 (ถ้าจำเป็น)
  - ตรวจสอบว่า MySQL user มีสิทธิ์เชื่อมต่อจาก IP ของ Plesk server

### 2. รัน SQL Script

1. ใช้ **phpMyAdmin** หรือ **Database** ใน Plesk
2. เลือก database `teeyai_db`
3. Import ไฟล์ `src/config/database.sql`

---

## 🔧 การตั้งค่า Node.js Application

### 1. ตั้งค่า Application Startup

ใน Plesk Node.js:
- **Application startup file**: `src/server.js`
- **Application URL**: `http://yourdomain.com:5001` หรือใช้ reverse proxy

### 2. ตั้งค่า Reverse Proxy (แนะนำ)

เพื่อให้ API ทำงานที่ `http://yourdomain.com/api` แทน `http://yourdomain.com:5001`:

1. ไปที่ **Apache & nginx Settings**
2. เพิ่มใน **Additional nginx directives**:

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

### 3. ตั้งค่า CORS (ถ้าจำเป็น)

ตรวจสอบว่า `CORS_ORIGIN` ใน `.env` ตั้งค่าเป็น domain ของ frontend

---

## 🔄 การตั้งค่า PM2 (Process Manager)

### วิธีที่ 1: ใช้ Plesk Built-in PM2

Plesk Obsidian มี PM2 built-in:
1. ไปที่ **Node.js** → เลือก Application
2. **Application mode**: `production` (จะใช้ PM2 อัตโนมัติ)
3. **Restart application** เมื่อมีการเปลี่ยนแปลง

### วิธีที่ 2: ใช้ PM2 แบบ Manual (SSH)

```bash
# ติดตั้ง PM2
npm install -g pm2

# สร้างไฟล์ ecosystem.config.js
cd /var/www/vhosts/yourdomain.com/httpdocs/backend
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'teeyai-backend',
    script: './src/server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
```

```bash
# เริ่มต้น PM2
pm2 start ecosystem.config.js

# บันทึก configuration
pm2 save

# ตั้งค่าให้รันอัตโนมัติเมื่อ restart server
pm2 startup
```

---

## ✅ การตรวจสอบและ Troubleshooting

### 1. ตรวจสอบ Logs

**Plesk Logs:**
- ไปที่ **Logs** → **Error Log**
- หรือ **Node.js** → **Application Logs**

**PM2 Logs:**
```bash
pm2 logs teeyai-backend
```

**Application Logs:**
```bash
tail -f /var/www/vhosts/yourdomain.com/httpdocs/backend/logs/out.log
tail -f /var/www/vhosts/yourdomain.com/httpdocs/backend/logs/err.log
```

### 2. ทดสอบ API

```bash
# Health check
curl http://yourdomain.com:5001/health

# หรือถ้าใช้ reverse proxy
curl http://yourdomain.com/api/health
```

### 3. ตรวจสอบ Process

```bash
# ดู PM2 processes
pm2 list

# ดู process details
pm2 show teeyai-backend

# Restart application
pm2 restart teeyai-backend

# Stop application
pm2 stop teeyai-backend
```

### 4. ปัญหาที่พบบ่อย

**ปัญหา: Port 5001 ถูกใช้งานแล้ว**
```bash
# ตรวจสอบ port
netstat -tulpn | grep 5001

# เปลี่ยน port ใน .env
PORT=5002
```

**ปัญหา: Database connection failed**
- ตรวจสอบ firewall
- ตรวจสอบ MySQL user permissions
- ตรวจสอบ database credentials ใน `.env`

**ปัญหา: Module not found**
```bash
# ติดตั้ง dependencies อีกครั้ง
cd /var/www/vhosts/yourdomain.com/httpdocs/backend
rm -rf node_modules
npm install --production
```

**ปัญหา: Permission denied**
```bash
# เปลี่ยน ownership
chown -R psacln:psacln /var/www/vhosts/yourdomain.com/httpdocs/backend
chmod -R 755 /var/www/vhosts/yourdomain.com/httpdocs/backend
```

---

## 🔐 Security Checklist

- [ ] เปลี่ยน `JWT_SECRET` เป็นค่าที่ปลอดภัย
- [ ] ตั้งค่า `NODE_ENV=production`
- [ ] ตรวจสอบ CORS settings
- [ ] ใช้ HTTPS (SSL Certificate)
- [ ] ตั้งค่า Firewall
- [ ] ตรวจสอบ file permissions
- [ ] ไม่ commit `.env` file

---

## 📝 หมายเหตุ

1. **Port Configuration**: 
   - ถ้าใช้ reverse proxy ไม่ต้องเปิด port 5001 สาธารณะ
   - ถ้าไม่ใช้ reverse proxy ต้องเปิด port 5001 ใน firewall

2. **Frontend Configuration**:
   - อัพเดต `VITE_API_URL` ใน frontend `.env` เป็น `https://yourdomain.com/api`

3. **Database**:
   - ตรวจสอบว่า MySQL server อนุญาตการเชื่อมต่อจาก Plesk server IP

4. **Backup**:
   - สำรองไฟล์ `.env` และ database เป็นประจำ

---

## 🆘 ติดต่อ Support

หากพบปัญหาการ deploy:
1. ตรวจสอบ logs ตามขั้นตอนด้านบน
2. ตรวจสอบ Plesk documentation
3. ติดต่อ hosting provider support

