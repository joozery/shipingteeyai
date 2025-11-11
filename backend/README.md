# TEEYAI Backend API

Backend API สำหรับระบบนำเข้า-ส่งออกและติดตามสถานะสินค้า TEEYAI Import Master

## 🚀 Technologies

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-Origin Resource Sharing

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

## 🗄️ Database Setup

1. เชื่อมต่อ MySQL server:
```bash
mysql -h 145.223.21.117 -u debian-sys-maint -p
```

2. สร้างฐานข้อมูลและตาราง:
```bash
mysql -h 145.223.21.117 -u debian-sys-maint -p < src/config/database.sql
```

## 🏃 Running the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start

# Production mode with PM2
npm run pm2:start
```

Server จะเริ่มทำงานที่ `http://localhost:5001` (หรือตาม PORT ใน .env)

## 🚀 Deployment

### Deploy to Plesk Obsidian

ดูคู่มือฉบับเต็ม: [DEPLOY_PLESK.md](./DEPLOY_PLESK.md)

**Quick Start:**
1. อัพโหลดไฟล์ `backend/` ไปยัง Plesk
2. สร้าง Node.js Application ใน Plesk
3. ตั้งค่า Environment Variables
4. ติดตั้ง dependencies: `npm install --production`
5. Restart application

ดูคู่มือฉบับย่อ: [PLESK_QUICK_START.md](./PLESK_QUICK_START.md)

## 📚 API Endpoints

### Authentication

#### Admin Login
```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@teeyai.com",
  "password": "your_password"
}
```

#### Customer Login
```http
POST /api/auth/customer/login
Content-Type: application/json

{
  "userId": "USER12345",
  "password": "customer_password"
}
```

#### Register Admin (Protected - Super Admin only)
```http
POST /api/auth/admin/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newadmin@teeyai.com",
  "password": "secure_password",
  "name": "New Admin",
  "role": "admin"
}
```

### Customers (Admin Protected)

#### Get All Customers
```http
GET /api/customers/all
Authorization: Bearer <admin_token>
```

#### Create Customer
```http
POST /api/customers/create
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "USER12345",
  "password": "customer_password",
  "name": "ชื่อลูกค้า",
  "email": "customer@example.com",
  "phone": "0812345678"
}
```

#### Delete Customer
```http
DELETE /api/customers/:id
Authorization: Bearer <admin_token>
```

### Customer Profile (Customer Protected)

#### Get Profile
```http
GET /api/customers/profile
Authorization: Bearer <customer_token>
```

#### Update Profile
```http
PUT /api/customers/profile
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "name": "ชื่อใหม่",
  "phone": "0898765432"
}
```

### Health Check
```http
GET /health
```


## ☁️ Cloudinary Uploads

Image uploads will be handled via Cloudinary.

1. Set the following environment variables in `.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
2. Ensure the credentials have permissions to upload images.
3. Upload images by sending a `POST` request to `/api/uploads/image` with `multipart/form-data` (field name: `image`).

Sample cURL:
```bash
curl -X POST http://localhost:5000/api/uploads/image \
  -F "image=@/path/to/image.jpg"
```

The API responds with the secure Cloudinary URL that can be stored client-side.

## 🔐 Authentication

API ใช้ JWT (JSON Web Tokens) สำหรับ authentication

1. Login ผ่าน `/api/auth/admin/login` หรือ `/api/auth/customer/login`
2. ได้รับ `token` กลับมา
3. ใช้ token ใน header: `Authorization: Bearer <your_token>`

## 🗃️ Database Schema

### admin_users
- id, email, password_hash, name, role, created_at, updated_at, last_login_at

### customers
- id, user_id, password_hash, name, email, phone, created_at, updated_at, last_login_at

### tracking_items
- id, tracking_number, customer_id, customer_name, customer_email, status_title, status, current_location, expected_date, created_at, updated_at

### tracking_history
- id, tracking_item_id, status_title, status, location, description, created_at

### articles
- id, title, excerpt, content, image, author, read_time, tags, created_at, updated_at

### delivery_addresses
- id, customer_id, receiver_name, receiver_address, receiver_phone, shipping_company, is_default, created_at, updated_at

### activity_logs
- id, user_type, user_id, action, description, ip_address, created_at

## 🔧 Environment Variables

```env
PORT=5000
NODE_ENV=development

DB_HOST=145.223.21.117
DB_PORT=3306
DB_USER=debian-sys-maint
DB_PASSWORD=Str0ngP@ssw0rd!
DB_NAME=teeyai_db

JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
```

## 📝 Scripts

```bash
# Development
npm run dev          # Start with nodemon (auto-reload)

# Production
npm start            # Start server
npm run prod         # Start with NODE_ENV=production

# PM2 Management
npm run pm2:start    # Start with PM2
npm run pm2:stop    # Stop PM2 process
npm run pm2:restart # Restart PM2 process
npm run pm2:logs    # View PM2 logs
```

## 📞 Support

สำหรับคำถามหรือปัญหา ติดต่อ:
- Email: support@teeyai.com
- Phone: 094-4555697 (คุณ ไบรอัน)

