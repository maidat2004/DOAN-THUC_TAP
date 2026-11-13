# Hệ Thống Thu Thập và Quản Lý Dữ Liệu Môi Trường Tỉnh Vĩnh Long

## 📋 Giới Thiệu

Hệ thống web giúp thu thập, lưu trữ, quản lý và phân tích dữ liệu môi trường (nước, không khí, đất) toàn tỉnh Vĩnh Long. Được sử dụng bởi cán bộ Trung tâm chuyển đổi số nông nghiệp và môi trường.

## 🏗️ Kiến Trúc Hệ Thống

### MERN Stack
- **M** - MongoDB (Database)
- **E** - Express.js (Backend)
- **R** - React.js (Frontend)
- **N** - Node.js (Runtime)

### Công Nghệ Sử Dụng

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (JSON Web Tokens)
- Bcryptjs
- Cors
- Dotenv

**Frontend:**
- React.js (Vite)
- Axios
- React Router
- Ant Design (UI Components)
- Recharts (Biểu đồ)
- Leaflet (Bản đồ)
- TailwindCSS

## 📁 Cấu Trúc Thư Mục

```
environment-data-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── contexts/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── package.json
└── README.md
```

## 🚀 Hướng Dẫn Cài Đặt

### Yêu Cầu
- Node.js >= 16
- npm >= 7
- MongoDB >= 4.0

### Bước 1: Clone hoặc tải dự án

```bash
cd environment-data-system
```

### Bước 2: Cài Đặt Dependencies

```bash
npm run install-all
```

### Bước 3: Cấu Hình Environment

#### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/environment-data
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Bước 4: Khởi Động MongoDB

```bash
# Trên Windows
mongod

# Trên macOS/Linux
brew services start mongodb-community
```

### Bước 5: Chạy Hệ Thống

**Chạy cả Backend và Frontend:**
```bash
npm run dev
```

**Hoặc chạy riêng:**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

## 📱 Các Module Chức Năng

### 1. Quản Lý Tài Khoản
- ✅ Đăng ký tài khoản
- ✅ Đăng nhập
- ✅ Phân quyền (Admin, Cán bộ nhập dữ liệu, Người xem)
- ✅ Quản lý thông tin người dùng

### 2. Quản Lý Địa Bàn Hành Chính
- ✅ Danh sách Tỉnh (Vĩnh Long)
- ✅ Danh sách Huyện (8 huyện/thành phố)
- ✅ Danh sách Xã/Phường

### 3. Quản Lý Điểm Quan Trắc
- ✅ Thêm, sửa, xóa điểm quan trắc
- ✅ Lưu vị trí GPS
- ✅ Phân loại môi trường (nước, không khí, đất)

### 4. Thu Thập Dữ Liệu
- ✅ Nhập dữ liệu quan trắc
- ✅ Chỉ số nước: pH, DO, Nhiệt độ
- ✅ Chỉ số không khí: PM2.5, PM10, CO2
- ✅ Chỉ số đất: pH, Độ ẩm

### 5. Dashboard Phân Tích
- ✅ Tổng số điểm quan trắc
- ✅ Số dữ liệu đã thu thập
- ✅ Số lần vượt ngưỡng
- ✅ Biểu đồ dữ liệu theo thời gian

### 6. Bản Đồ Môi Trường
- ✅ Hiển thị điểm quan trắc trên bản đồ
- ✅ Mã màu: Xanh (OK), Vàng (Cảnh báo), Đỏ (Vượt ngưỡng)

### 7. Cảnh Báo Môi Trường
- ✅ Thiết lập ngưỡng chỉ số
- ✅ Cảnh báo khi vượt ngưỡng

### 8. Báo Cáo & Thống Kê
- ✅ Thống kê theo huyện
- ✅ Thống kê theo loại môi trường
- ✅ Xuất báo cáo CSV/Excel

## 🔐 Bảo Mật

- JWT cho xác thực
- Password hash với bcryptjs
- CORS middleware
- Input validation
- MongoDB injection prevention

## 📚 Tài Nguyên Hữu Ích

- [Express.js Documentation](http://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [React Documentation](https://react.dev)
- [Mongoose Documentation](https://mongoosejs.com)

## 👨‍💻 Hỗ Trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
1. MongoDB đang chạy?
2. Environment variables đã cấu hình?
3. Port 5000 và 5173 có sẵn?

## 📄 Giấy Phép

MIT License

---

**Được phát triển cho Đồ Án Tốt Nghiệp - 2026**
