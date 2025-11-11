# 🚚 Premium Logistics - ระบบขนส่งพรีเมียม

เว็บไซต์บริษัทขนส่งพรีเมียม พร้อมระบบเช็คสถานะขนส่งออนไลน์ รองรับ 3 ภาษา (ไทย, จีน, อังกฤษ)

## ✨ คุณสมบัติหลัก

### 🌐 หน้าเว็บไซต์หลัก
- **หน้าแรก (Home)**: แสดงแบนเนอร์หลักและจุดเด่นของบริษัท
- **บริการของเรา (Services)**: แสดงบริการหลัก (ขนส่งในประเทศ/ต่างประเทศ/คลังสินค้า)
- **เกี่ยวกับเรา (About)**: ข้อมูลบริษัท วิสัยทัศน์ พันธกิจ
- **บทความ/ข่าวสาร (Articles)**: ข่าวและบทความด้านโลจิสติกส์
- **ติดต่อเรา (Contact)**: แบบฟอร์มติดต่อ + แผนที่ Google Maps

### 📦 ระบบเช็คสถานะขนส่ง
- ค้นหาพัสดุได้โดย **หมายเลขขนส่ง** หรือ **เบอร์โทรศัพท์**
- ค้นหาได้โดย**ไม่ต้องล็อกอิน**
- แสดงข้อมูลสถานะปัจจุบัน วันที่-เวลาอัปเดต และประวัติการขนส่ง
- หน้าแสดงผลออกแบบให้ชัดเจน เข้าใจง่าย

### 👤 ระบบแอคเคาท์ลูกค้า
- ไม่มีระบบสมัครสมาชิกด้วยตนเอง (สร้างโดยแอดมิน)
- ข้อมูลส่วนตัว: ชื่อ-นามสกุล, เบอร์โทรศัพท์, อีเมล
- ที่อยู่ตามบัตรประชาชน และที่อยู่สำหรับจัดส่ง
- ประวัติการขนส่งทั้งหมด

### 🔐 Admin Panel
- **จัดการลูกค้า**: เพิ่ม/แก้ไข/ลบข้อมูลลูกค้า, สร้างบัญชีและรหัสลูกค้า
- **จัดการสถานะขนส่ง**: อัพเดตสถานะพัสดุพร้อมส่งอีเมลแจ้งเตือนอัตโนมัติ
- **จัดการเนื้อหา**: แก้ไขเนื้อหาเว็บไซต์แยกตามภาษา (ไทย/จีน/อังกฤษ)
- **Activity Log**: บันทึกการเปลี่ยนแปลงทุกครั้ง
- **ตั้งค่า**: เปิด/ปิดระบบแจ้งเตือน และการตั้งค่าอื่นๆ

### 📧 ระบบแจ้งเตือนทางอีเมล
- ส่งอีเมลแจ้งเตือนอัตโนมัติเมื่อแอดมินอัพเดตสถานะ
- รองรับอีเมล 3 ภาษา (ตามภาษาหลักของลูกค้า)
- แอดมินสามารถเปิด/ปิดระบบแจ้งเตือนได้

### 🌍 ระบบหลายภาษา
- รองรับ 3 ภาษา: 🇹🇭 ไทย / 🇨🇳 จีน / 🇬🇧 อังกฤษ
- ปุ่มสลับภาษาที่มุมขวาบนของเว็บไซต์
- ระบบหลังบ้านรองรับการกรอกข้อมูลแยกแต่ละภาษา

### 🔒 ความปลอดภัย
- ข้อมูลส่วนบุคคลและรหัสผ่านถูกเข้ารหัส
- จำกัดสิทธิ์การเข้าถึงหลังบ้านเฉพาะผู้ดูแลระบบ
- มีระบบ Log เก็บประวัติการอัปเดตและการเข้าสู่ระบบทุกครั้ง

## 🛠 เทคโนโลยีที่ใช้

### Frontend
- **React 19** - JavaScript Library
- **Vite** - Build Tool
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components (built on Radix UI)
- **i18next** - Internationalization
- **Lucide React** - Icons

### UI Components (shadcn/ui + Radix UI)
- Button, Input, Card, Label
- Dialog, Select, Tabs, Dropdown Menu
- และอื่นๆ อีกมากมาย

## 📦 การติดตั้ง

```bash
# Clone repository
git clone <repository-url>

# เข้าสู่โฟลเดอร์ frontend
cd shipingwepapp/frontend

# ติดตั้ง dependencies
npm install

# รันโปรเจกต์ในโหมด development
npm run dev
```

โปรเจกต์จะรันที่ `http://localhost:5173`

## 🚀 คำสั่งที่ใช้

```bash
# รันโปรเจกต์
npm run dev

# Build สำหรับ production
npm run build

# Preview build
npm run preview

# Lint โค้ด
npm run lint
```

## 🔑 Demo Credentials

### Admin Account
- Username: `admin`
- Password: `admin`
- URL: `/login` → เข้าสู่ระบบแล้วจะถูกนำไปที่ `/admin`

### Customer Account
- Username: `customer`
- Password: `customer`
- URL: `/login` → เข้าสู่ระบบแล้วจะถูกนำไปที่ `/account`

## 📁 โครงสร้างโปรเจกต์

```
frontend/
├── src/
│   ├── components/         # UI Components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── Layout.jsx     # Layout wrapper
│   │   ├── Navbar.jsx     # Navigation bar
│   │   ├── Footer.jsx     # Footer
│   │   └── LanguageSwitcher.jsx
│   ├── pages/             # Page components
│   │   ├── Home.jsx
│   │   ├── Services.jsx
│   │   ├── About.jsx
│   │   ├── Articles.jsx
│   │   ├── Contact.jsx
│   │   ├── Tracking.jsx
│   │   ├── Login.jsx
│   │   ├── CustomerAccount.jsx
│   │   └── admin/         # Admin pages
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminHome.jsx
│   │       ├── CustomerManagement.jsx
│   │       ├── TrackingManagement.jsx
│   │       ├── ContentManagement.jsx
│   │       ├── ActivityLog.jsx
│   │       └── Settings.jsx
│   ├── i18n/              # Internationalization
│   │   ├── index.js
│   │   └── locales/
│   │       ├── th.json    # Thai translations
│   │       ├── zh.json    # Chinese translations
│   │       └── en.json    # English translations
│   ├── lib/
│   │   └── utils.js       # Utility functions
│   ├── App.jsx            # Main App component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── jsconfig.json
```

## 🎨 Design System

โปรเจกต์นี้ใช้ **shadcn/ui** ซึ่งสร้างบน **Radix UI** และ **Tailwind CSS**

### สี (Colors)
- **Primary**: สีน้ำเงิน (#3B82F6)
- **Secondary**: สีเทา
- **Success**: สีเขียว
- **Warning**: สีส้ม
- **Danger**: สีแดง

### Typography
- Font: System UI stack
- Responsive font sizes

## 🌐 ภาษาที่รองรับ

- 🇹🇭 **ไทย** - Default language
- 🇨🇳 **จีน (简体中文)**
- 🇬🇧 **อังกฤษ (English)**

## 📝 หมายเหตุ

### สำหรับ Production
โปรเจกต์นี้เป็น **Frontend Demo** ที่ใช้ Mock Data สำหรับ:
- Authentication
- Customer data
- Tracking data
- Email notifications

ในการพัฒนาจริง คุณต้องมี:
1. **Backend API** สำหรับจัดการข้อมูล
2. **Database** สำหรับเก็บข้อมูล (ลูกค้า, พัสดุ, etc.)
3. **Email Service** สำหรับส่งอีเมลแจ้งเตือน
4. **Authentication Service** สำหรับจัดการการเข้าสู่ระบบ

### การพัฒนาต่อ
สิ่งที่ควรเพิ่มเติมในอนาคต:
- ✅ ระบบ SMS Notification
- ✅ ระบบ Payment Gateway
- ✅ Mobile App (React Native)
- ✅ Real-time Tracking ด้วย GPS
- ✅ Dashboard Analytics
- ✅ Multi-warehouse Management

## 🤝 Contributing

หากคุณต้องการพัฒนาหรือปรับปรุงโปรเจกต์:
1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License

## 👨‍💻 Developer

Developed by DevJuu

---

**สร้างด้วย ❤️ โดยใช้ React, Vite, Tailwind CSS, และ shadcn/ui**




