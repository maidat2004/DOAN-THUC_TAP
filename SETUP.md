# 🚀 HƯỚNG DẪN CHẠY HỆ THỐNG

## 📋 Yêu Cầu Cài Đặt

- **Node.js**: >= 16.x
- **npm**: >= 7.x (hoặc yarn, pnpm)
- **MongoDB**: >= 4.0 (Local hoặc Atlas)
- **Git**: Để clone repository

---

## 🔧 Bước 1: Cài Đặt Môi Trường

### 1.1 Cài đặt Node.js

**Trên Windows:**
- Tải từ: https://nodejs.org
- Chọn phiên bản LTS (Long Term Support)
- Cài đặt với các tùy chọn mặc định

**Kiểm tra cài đặt:**
```bash
node --version
npm --version
```

### 1.2 Cài đặt MongoDB

**Option A: MongoDB Local (Windows)**
```bash
# Tải từ: https://www.mongodb.com/try/download/community
# Cài đặt và khởi động MongoDB Service

# Hoặc dùng MongoDB Shell
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Đăng ký tại https://www.mongodb.com/cloud/atlas
2. Tạo cluster miễn phí
3. Lấy connection string

---

## 📁 Bước 2: Clone & Cài Đặt Project

```bash
# Di chuyển đến thư mục project
cd d:\DA_TT\environment-data-system

# Cài đặt tất cả dependencies
npm run install-all

# Hoặc cài đặt từng phần
npm install                    # Cài dependencies chính
npm install --workspace=backend    # Cài backend
npm install --workspace=frontend   # Cài frontend
```

---

## 🔐 Bước 3: Cấu Hình Environment

### Backend (.env)

**Tạo file `backend/.env`:**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/environment-data
# Hoặc sử dụng MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/environment-data

# JWT
JWT_SECRET=your_jwt_secret_key_change_this_in_production_12345
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

**Tạo file `frontend/.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🌱 Bước 4: Khởi Động MongoDB

### Windows - MongoDB Local:
```bash
# Mở Command Prompt hoặc PowerShell
# MongoDB sẽ tự động chạy nếu đã cài MongoDB Service

# Hoặc khởi động bằng tay:
mongod
```

### Verify MongoDB đang chạy:
```bash
# Mở terminal mới
mongo
# Hoặc
mongosh
```

---

## 🌱 Bước 5: Seed Dữ Liệu Mẫu

```bash
# Di chuyển vào thư mục backend
cd backend

# Chạy seed script
npm run seed

# Kết quả sẽ in ra: ✅ Seed data created successfully!
```

**Dữ Liệu Được Tạo:**
- Tỉnh Vĩnh Long
- 8 Huyện/Thành phố
- Các Xã/Phường mẫu
- Các ngưỡng cảnh báo cho nước, không khí, đất

---

## 🚀 Bước 6: Chạy Hệ Thống

### Option A: Chạy cả Backend & Frontend cùng lúc

```bash
# Quay lại thư mục gốc
cd ..

# Chạy dev mode
npm run dev
```

Hệ thống sẽ tự động mở:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

### Option B: Chạy riêng

**Terminal 1 - Backend:**
```bash
npm run dev:backend

# Output: 🚀 Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend

# Output: VITE v4.5.0 ready in xxx ms
```

---

## 🧪 Bước 7: Kiểm Tra Hệ Thống

### Kiểm tra Backend API:

```bash
# Health check
curl http://localhost:5000/api/health

# Kết quả: {"message":"✅ Server is running"}
```

### Kiểm tra Frontend:

Mở browser:
```
http://localhost:5173
```

Bạn sẽ thấy trang Login.

---

## 👤 Bước 8: Đăng Nhập Lần Đầu

### Tạo User đầu tiên bằng MongoDB:

```bash
# Mở MongoDB
mongosh

# Chọn database
use environment-data

# Thêm user mẫu
db.users.insertOne({
  fullName: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$...", // Hash bcrypt của "password123"
  phone: "0123456789",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Hoặc Đăng Ký Tài Khoản Mới:**
1. Click "Đăng ký tại đây"
2. Điền thông tin
3. Click "Đăng Ký"

---

## 🛠️ Các Lệnh Hữu Ích

### Backend:
```bash
cd backend

# Chạy dev mode (auto reload)
npm run dev

# Chạy production
npm start

# Seed dữ liệu
npm run seed
```

### Frontend:
```bash
cd frontend

# Chạy dev mode
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

### Từ thư mục gốc:
```bash
# Cài đặt tất cả
npm run install-all

# Chạy cả backend & frontend
npm run dev

# Build tất cả
npm run build

# Chạy backend riêng
npm run dev:backend

# Chạy frontend riêng
npm run dev:frontend
```

---

## 🐛 Khắc Phục Sự Cố

### MongoDB Connection Error:
```
❌ Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Giải pháp:**
- Kiểm tra MongoDB đang chạy: `mongosh`
- Kiểm tra `MONGODB_URI` trong `.env`
- Nếu dùng MongoDB Atlas, kiểm tra password và whitelist IP

### Port Already in Use:
```
❌ Error: listen EADDRINUSE :::5000
```
**Giải pháp:**
```bash
# Tìm process đang dùng port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Hoặc đổi port trong .env
PORT=5001
```

### Module Not Found:
```
❌ Cannot find module 'express'
```
**Giải pháp:**
```bash
# Cài lại dependencies
cd backend
npm install
```

### CORS Error:
```
❌ Access to XMLHttpRequest blocked by CORS policy
```
**Giải pháp:**
- Kiểm tra `CORS_ORIGIN` trong backend `.env`
- Frontend URL phải khớp với `CORS_ORIGIN`

---

## 📊 API Endpoints Chính

### Authentication
```
POST   /api/auth/register - Đăng ký
POST   /api/auth/login - Đăng nhập
GET    /api/auth/me - Lấy user hiện tại
PUT    /api/auth/profile - Cập nhật profile
POST   /api/auth/change-password - Đổi mật khẩu
```

### Stations
```
GET    /api/stations - Lấy danh sách
POST   /api/stations - Tạo mới
GET    /api/stations/:id - Chi tiết
PUT    /api/stations/:id - Cập nhật
DELETE /api/stations/:id - Xóa
GET    /api/stations/statistics - Thống kê
```

### Environment Data
```
GET    /api/data - Lấy dữ liệu
POST   /api/data - Tạo dữ liệu
GET    /api/data/:id - Chi tiết
PUT    /api/data/:id - Cập nhật
DELETE /api/data/:id - Xóa
GET    /api/data/statistics - Thống kê
```

### Locations
```
GET    /api/locations/provinces - Tỉnh
GET    /api/locations/districts/:provinceId - Huyện
GET    /api/locations/communes/:districtId - Xã/Phường
```

### Alerts
```
GET    /api/alerts - Lấy cảnh báo
PUT    /api/alerts/:id/resolve - Giải quyết
GET    /api/alerts/statistics - Thống kê
```

### Thresholds
```
GET    /api/thresholds - Lấy ngưỡng
POST   /api/thresholds - Tạo ngưỡng
PUT    /api/thresholds/:id - Cập nhật
DELETE /api/thresholds/:id - Xóa
```

---

## 📁 Cấu Trúc Project

```
environment-data-system/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── jwt.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── stationController.js
│   │   ├── dataController.js
│   │   ├── locationController.js
│   │   ├── thresholdController.js
│   │   └── alertController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Station.js
│   │   ├── EnvironmentData.js
│   │   ├── Province.js
│   │   ├── District.js
│   │   ├── Commune.js
│   │   ├── Threshold.js
│   │   └── Alert.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── station.js
│   │   ├── data.js
│   │   ├── location.js
│   │   ├── threshold.js
│   │   └── alert.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── scripts/
│   │   └── seed.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Stations.jsx
│   │   │   ├── DataCollection.jsx
│   │   │   └── Alerts.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── index.js
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── styles/
│   │   │   ├── Sidebar.css
│   │   │   ├── Auth.css
│   │   │   ├── Dashboard.css
│   │   │   ├── Stations.css
│   │   │   ├── DataCollection.css
│   │   │   └── Alerts.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── App.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env
├── package.json
├── README.md
└── .gitignore
```

---

## 🎓 Hướng Dẫn Phát Triển Thêm

### Thêm Page Mới

1. **Tạo Component:**
```jsx
// frontend/src/pages/NewPage.jsx
export const NewPage = () => {
  return <div>New Page</div>;
};
```

2. **Thêm Route:**
```jsx
// Trong App.jsx
<Route path="/new-page" element={<NewPage />} />
```

3. **Thêm Menu Item:**
```jsx
// Trong Sidebar.jsx
{
  key: '9',
  label: 'Trang Mới',
  onClick: () => navigate('/new-page'),
}
```

### Thêm API Endpoint

1. **Tạo Controller:**
```javascript
// backend/controllers/newController.js
exports.getData = async (req, res, next) => {
  try {
    // Logic here
  } catch (error) {
    next(error);
  }
};
```

2. **Tạo Route:**
```javascript
// backend/routes/new.js
const express = require('express');
const router = express.Router();
const newController = require('../controllers/newController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', newController.getData);

module.exports = router;
```

3. **Thêm vào server.js:**
```javascript
app.use('/api/new', require('./routes/new'));
```

### Thêm Service Axios

```javascript
// frontend/src/services/index.js
export const newService = {
  getData: async () => {
    return api.get('/new');
  },
};
```

---

## 📚 Tài Liệu Hữu Ích

- [Express.js Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Mongoose Docs](https://mongoosejs.com)
- [React Docs](https://react.dev)
- [Ant Design](https://ant.design)
- [Vite Docs](https://vitejs.dev)

---

## 🤝 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra bảng "Khắc Phục Sự Cố" ở trên
2. Xem console logs (Terminal & Browser DevTools)
3. Kiểm tra MongoDB đang chạy
4. Kiểm tra ports 5000 và 5173 có sẵn

---

**✅ Chúc bạn thành công với dự án! 🎉**
