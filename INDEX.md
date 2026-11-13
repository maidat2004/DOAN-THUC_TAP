# 📂 DANH SÁCH FILE & ĐỀ XUẤT THỨ TỰ ĐỌC

## 🚀 DANH SÁCH ĐƯỢC KHUYẾN CÁO

### Bước 1: Tổng Quan Dự Án (10 phút)
1. **[README.md](README.md)** - Giới thiệu & mục tiêu
2. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Tóm tắt đầy đủ

### Bước 2: Cài Đặt & Chạy Dự Án (30 phút)
3. **[SETUP.md](SETUP.md)** - Hướng dẫn cài đặt chi tiết
   - Bước 1-8 để có hệ thống chạy được

### Bước 3: Hiểu API (20 phút - tuỳ chọn)
4. **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Tài liệu API đầy đủ
5. **[POSTMAN_COLLECTION.json](POSTMAN_COLLECTION.json)** - Test API

### Bước 4: Khám Phá Code
5. Backend structure
6. Frontend structure

---

## 📁 CẤU TRÚC BACKEND

### ⚙️ Cấu Hình & Khởi Động
| File | Mô Tả |
|------|-------|
| [backend/server.js](backend/server.js) | 🚀 Main server file |
| [backend/package.json](backend/package.json) | 📦 Dependencies |
| [backend/.env.example](backend/.env.example) | 🔑 Environment variables |

### 🗂️ Configuration
| File | Mô Tả |
|------|-------|
| [backend/config/database.js](backend/config/database.js) | 🗄️ MongoDB connection |
| [backend/config/jwt.js](backend/config/jwt.js) | 🔐 JWT token handling |

### 🏗️ Database Models (Mongoose Schemas)
| Model | File | Bảng | Mô Tả |
|-------|------|------|-------|
| User | [models/User.js](backend/models/User.js) | `users` | Ng dùng, auth |
| Province | [models/Province.js](backend/models/Province.js) | `provinces` | Tỉnh Vĩnh Long |
| District | [models/District.js](backend/models/District.js) | `districts` | 8 Huyện |
| Commune | [models/Commune.js](backend/models/Commune.js) | `communes` | Xã/Phường |
| Station | [models/Station.js](backend/models/Station.js) | `stations` | Điểm quan trắc |
| EnvironmentData | [models/EnvironmentData.js](backend/models/EnvironmentData.js) | `environment_data` | Dữ liệu môi tr |
| Threshold | [models/Threshold.js](backend/models/Threshold.js) | `thresholds` | Ngưỡng cảnh báo |
| Alert | [models/Alert.js](backend/models/Alert.js) | `alerts` | Cảnh báo |

### 🎮 Controllers (Business Logic)
| Controller | File | Endpoints | Mô Tả |
|------------|------|-----------|-------|
| authController | [controllers/authController.js](backend/controllers/authController.js) | 7 | Đăng ký, login, profile |
| stationController | [controllers/stationController.js](backend/controllers/stationController.js) | 7 | CRUD điểm quan trắc |
| dataController | [controllers/dataController.js](backend/controllers/dataController.js) | 7 | Thu thập & quản lý dữ liệu |
| locationController | [controllers/locationController.js](backend/controllers/locationController.js) | 6 | Tỉnh, huyện, xã/phường |
| thresholdController | [controllers/thresholdController.js](backend/controllers/thresholdController.js) | 5 | CRUD ngưỡng cảnh báo |
| alertController | [controllers/alertController.js](backend/controllers/alertController.js) | 3 | Cảnh báo |

### 🛣️ Routes (API Endpoints)
| Route | File | Prefix | Mô Tả |
|-------|------|--------|-------|
| auth | [routes/auth.js](backend/routes/auth.js) | `/api/auth` | Authentication |
| station | [routes/station.js](backend/routes/station.js) | `/api/stations` | Stations |
| data | [routes/data.js](backend/routes/data.js) | `/api/data` | Environment data |
| location | [routes/location.js](backend/routes/location.js) | `/api/locations` | Locations |
| threshold | [routes/threshold.js](backend/routes/threshold.js) | `/api/thresholds` | Thresholds |
| alert | [routes/alert.js](backend/routes/alert.js) | `/api/alerts` | Alerts |

### 🛡️ Middleware
| Middleware | File | Mô Tả |
|------------|------|-------|
| auth | [middleware/auth.js](backend/middleware/auth.js) | JWT authentication, role-based access |
| errorHandler | [middleware/errorHandler.js](backend/middleware/errorHandler.js) | Global error handling |

### 🌱 Scripts
| Script | File | Mô Tả |
|--------|------|-------|
| seed | [scripts/seed.js](backend/scripts/seed.js) | Tạo dữ liệu mẫu |

---

## 🎨 CẤU TRÚC FRONTEND

### ⚙️ Cấu Hình
| File | Mô Tả |
|------|-------|
| [frontend/package.json](frontend/package.json) | 📦 Dependencies |
| [frontend/vite.config.js](frontend/vite.config.js) | ⚡ Vite configuration |
| [frontend/index.html](frontend/index.html) | 🌐 HTML entry |
| [frontend/.env.example](frontend/.env.example) | 🔑 Environment |

### 📄 Main App
| File | Mô Tả |
|------|-------|
| [frontend/src/main.jsx](frontend/src/main.jsx) | 🪨 React entry point |
| [frontend/src/App.jsx](frontend/src/App.jsx) | 📱 Main app component & routes |
| [frontend/src/App.css](frontend/src/App.css) | 🎨 Global styles |
| [frontend/src/index.css](frontend/src/index.css) | 🎨 CSS imports |

### 📄 Pages (6 Main Pages)
| Page | File | Route | Mô Tả |
|------|------|-------|-------|
| Login | [pages/Login.jsx](frontend/src/pages/Login.jsx) | `/login` | Trang đăng nhập |
| Register | [pages/Register.jsx](frontend/src/pages/Register.jsx) | `/register` | Trang đăng ký |
| Dashboard | [pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx) | `/dashboard` | Dashboard chính |
| Stations | [pages/Stations.jsx](frontend/src/pages/Stations.jsx) | `/stations` | Quản lý điểm quan trắc |
| DataCollection | [pages/DataCollection.jsx](frontend/src/pages/DataCollection.jsx) | `/data-collection` | Nhập dữ liệu |
| Alerts | [pages/Alerts.jsx](frontend/src/pages/Alerts.jsx) | `/alerts` | Quản lý cảnh báo |

### 🧩 Components
| Component | File | Mô Tả |
|-----------|------|-------|
| Sidebar | [components/Sidebar.jsx](frontend/src/components/Sidebar.jsx) | 🗂️ Navigation sidebar |
| ProtectedRoute | [components/ProtectedRoute.jsx](frontend/src/components/ProtectedRoute.jsx) | 🔒 Route protection |

### 🔌 Services (API Integration)
| Service | File | Mô Tả |
|---------|------|-------|
| api | [services/api.js](frontend/src/services/api.js) | ⚙️ Axios instance & interceptors |
| All services | [services/index.js](frontend/src/services/index.js) | 📡 API service functions |

### 🎯 Contexts (State Management)
| Context | File | Mô Tả |
|---------|------|-------|
| AuthContext | [contexts/AuthContext.jsx](frontend/src/contexts/AuthContext.jsx) | 🔐 Auth state & functions |

### 🎨 Styles
| Style | File | Dùng Cho |
|-------|------|----------|
| App.css | [styles/App.css](frontend/src/App.css) | Global styles |
| Sidebar.css | [styles/Sidebar.css](frontend/src/styles/Sidebar.css) | Sidebar |
| Auth.css | [styles/Auth.css](frontend/src/styles/Auth.css) | Login/Register |
| Dashboard.css | [styles/Dashboard.css](frontend/src/styles/Dashboard.css) | Dashboard |
| Stations.css | [styles/Stations.css](frontend/src/styles/Stations.css) | Stations |
| DataCollection.css | [styles/DataCollection.css](frontend/src/styles/DataCollection.css) | Data form |
| Alerts.css | [styles/Alerts.css](frontend/src/styles/Alerts.css) | Alerts |

---

## 📚 TÀI LIỆU

| Tài Liệu | File | Loại |
|----------|------|------|
| README | [README.md](README.md) | 📝 Giới thiệu |
| Setup Guide | [SETUP.md](SETUP.md) | 📖 Hướng dẫn |
| API Docs | [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | 📚 API reference |
| Postman Collection | [POSTMAN_COLLECTION.json](POSTMAN_COLLECTION.json) | 🧪 Testing |
| Project Summary | [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | 📊 Tóm tắt |
| File Index | [INDEX.md](INDEX.md) | 🗂️ File này |

---

## 🚀 HÀNH ĐỘNG NHANH

### Cài đặt & chạy
```bash
cd environment-data-system
npm run install-all
npm run dev
```

### Tạo dữ liệu mẫu
```bash
npm run seed --workspace=backend
```

### Chỉ backend
```bash
npm run dev:backend
```

### Chỉ frontend
```bash
npm run dev:frontend
```

---

## 📊 THỐNG KÊ DỰ ÁN

| Chỉ Số | Số Lượng |
|--------|----------|
| 🗂️ Thư mục | 20+ |
| 📄 File | 60+ |
| 📝 Dòng code | 3000+ |
| 🏗️ Schemas | 8 |
| 🎮 Controllers | 6 |
| 🛣️ Routes | 6 |
| 📱 Pages | 6 |
| 🔌 Services | 8 |
| 🧩 Components | 2 |
| 🔌 API Endpoints | 43 |
| 📚 Tài liệu | 5 |

---

## 🎯 THỨ TỰ ĐỌC CODE

### Nếu bạn mới
1. [README.md](README.md) - Hiểu mục tiêu
2. [SETUP.md](SETUP.md) - Chạy project
3. [frontend/src/App.jsx](frontend/src/App.jsx) - Hiểu flow
4. [frontend/src/contexts/AuthContext.jsx](frontend/src/contexts/AuthContext.jsx) - Auth
5. [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx) - UI example

### Nếu bạn muốn hiểu backend
1. [backend/server.js](backend/server.js) - Main server
2. [backend/config/database.js](backend/config/database.js) - DB connection
3. [backend/models/User.js](backend/models/User.js) - Schema example
4. [backend/controllers/authController.js](backend/controllers/authController.js) - Logic example
5. [backend/routes/auth.js](backend/routes/auth.js) - Routes example

### Nếu bạn muốn hiểu frontend
1. [frontend/src/App.jsx](frontend/src/App.jsx) - Main app
2. [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx) - Auth flow
3. [frontend/src/services/index.js](frontend/src/services/index.js) - API calls
4. [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx) - Data display
5. [frontend/src/pages/DataCollection.jsx](frontend/src/pages/DataCollection.jsx) - Forms

---

## ✅ KIỂM DANH SÁCH

- [x] Tất cả file đã được tạo
- [x] Backend configurations
- [x] Database models
- [x] API controllers & routes
- [x] Frontend components
- [x] React pages
- [x] Services & state management
- [x] Styles
- [x] Documentation
- [x] Seed script

---

## 🆘 HELP

- **Cần cài đặt?** → [SETUP.md](SETUP.md)
- **Cần hiểu API?** → [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Cần test API?** → [POSTMAN_COLLECTION.json](POSTMAN_COLLECTION.json)
- **Cần overview?** → [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

**Happy Coding! 🚀**
