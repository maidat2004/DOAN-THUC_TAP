# 📊 Hướng Dẫn Dữ Liệu Mẫu và API

## 🎯 Tổng Quan Dữ Liệu Mẫu

Script `npm run seed` đã tạo dữ liệu mẫu đầy đủ cho tất cả các phần của ứng dụng:

```
✅ 45 Điểm quan trắc (Stations) - quản lý bởi Admin
✅ 45 Bản ghi dữ liệu môi trường (Environment Data) - nhập bởi Staff
✅ 38 Cảnh báo (Alerts) - tự động tạo
✅ 4 Người dùng (Users)
✅ 8 Ngưỡng (Thresholds) - cấu hình bởi Admin
```

---

## 👤 Tài Khoản Người Dùng & Quyền

| Email | Mật khẩu | Vai trò | Quyền |
|-------|----------|--------|-------|
| `admin@ems.com` | `admin123` | Admin | ✅ Quản lý trạm, người dùng, ngưỡng<br>✅ Xem & **xử lý cảnh báo** (đánh dấu đã xử lý)<br>✅ Xem báo cáo, thống kê |
| `staff@companya.com` | `staff123` | Staff | ✅ **Nhập dữ liệu** từ các trạm<br>✅ Xem danh sách trạm (khi nhập)<br>✅ **Xem cảnh báo** (chỉ xem, không xử lý)<br>✅ Xem báo cáo & thống kê<br>❌ Không được quản lý trạm<br>❌ Không được xử lý cảnh báo |
| `staff@companyb.com` | `staff123` | Staff | ✅ **Nhập dữ liệu** từ các trạm<br>✅ Xem danh sách trạm (khi nhập)<br>✅ **Xem cảnh báo** (chỉ xem, không xử lý)<br>✅ Xem báo cáo & thống kê<br>❌ Không được quản lý trạm<br>❌ Không được xử lý cảnh báo |
| `viewer@ems.com` | `viewer123` | Viewer | ✅ Xem dữ liệu & báo cáo (chỉ đọc)<br>✅ Xem cảnh báo (chỉ xem, không xử lý)<br>❌ Không được nhập dữ liệu<br>❌ Không được xử lý cảnh báo |

---

## 🏴 Trạm Quan Trắc (Stations)

### 1️⃣ Trạm Nước

| Mã | Tên | Loại | Vị trí | Trạng thái |
|----|----|------|--------|-----------|
| `WS001` | Trạm Một - Sông Tiền | Water | TP. Vĩnh Long | Active |
| `WS002` | Trạm Hai - Sông Hậu | Water | Huyện Bình Minh | Active |

**Dữ liệu mẫu:**
```json
{
  "type": "water",
  "water": {
    "ph": 6.2,          // ⚠️ Dưới ngưỡng (≥6) → Cảnh báo
    "do_level": 7.5,    // Độ ô xy hòa tan (mg/L)
    "temperature": 29,  // Nhiệt độ (°C)
    "turbidity": 3,     // Độ đục (NTU)
    "conductivity": 950 // Độ dẫn điện (µS/cm)
  }
}
```

### 2️⃣ Trạm Không Khí

| Mã | Tên | Loại | Vị trí | Trạng thái |
|----|----|------|--------|-----------|
| `AS001` | Trạm Không Khí - TT Vĩnh Long | Air | TP. Vĩnh Long | Active |
| `AS002` | Trạm Không Khí - Bình Minh | Air | Huyện Bình Minh | Active |

**Dữ liệu mẫu:**
```json
{
  "type": "air",
  "air": {
    "pm25": 95,         // 🚨 Vượt ngưỡng (>75) → Cảnh báo Nghiêm Trọng
    "pm10": 180,        // 🚨 Vượt ngưỡng (>150) → Cảnh báo Nghiêm Trọng
    "co2": 520,         // CO2 (ppm)
    "temperature": 33,  // Nhiệt độ (°C)
    "humidity": 75,     // Độ ẩm (% RH)
    "pressure": 1012    // Áp suất (hPa)
  }
}
```

### 3️⃣ Trạm Đất

| Mã | Tên | Loại | Vị trí | Trạng thái |
|----|----|------|--------|-----------|
| `SS001` | Trạm Đất - Vùng Nông Nghiệp | Soil | Huyện Bình Tân | Active |

**Dữ liệu mẫu:**
```json
{
  "type": "soil",
  "soil": {
    "ph": 6.8,          // Độ pH
    "moisture": 32,     // Độ ẩm (%)
    "nitrogen": 320,    // Nitơ (mg/kg)
    "phosphorus": 45,   // Phốt phô (mg/kg)
    "potassium": 250,   // Kali (mg/kg)
    "organicMatter": 4.5 // Chất hữu cơ (%)
  }
}
```

---

## ⚠️ Cảnh Báo (Alerts)

Hệ thống tự động tạo cảnh báo khi dữ liệu vượt ngưỡng:

### Cảnh Báo Được Tạo:

1. **🟡 Cảnh báo (Warning)** - pH Nước
   - Giá trị: 6.2
   - Ngưỡng: 6-8
   - Trạm: WS001 (Sông Tiền)
   - Tin nhắn: "⚠️ pH nước thấp: 6.20 (dưới 6)"

2. **🔴 Cảnh báo Nghiêm Trọng (Critical)** - PM2.5
   - Giá trị: 95 µg/m³
   - Ngưỡng: ≤75 µg/m³
   - Trạm: AS001 (TP. Vĩnh Long)
   - Tin nhắn: "🚨 PM2.5 có hại: 95.0 µg/m³ (vượt 75)"

3. **🔴 Cảnh báo Nghiêm Trọng (Critical)** - PM10
   - Giá trị: 180 µg/m³
   - Ngưỡng: ≤150 µg/m³
   - Trạm: AS002 (Huyện Bình Minh)
   - Tin nhắn: "🚨 PM10 quá cao: 180.0 µg/m³ (vượt 150)"

### Xem Cảnh Báo:
```bash
GET /api/alerts              # Danh sách tất cả cảnh báo
GET /api/alerts/:id          # Chi tiết cảnh báo
PATCH /api/alerts/:id/resolve # Đánh dấu đã xử lý
```

---

## 📋 Ngưỡng (Thresholds)

Tất cả 8 ngưỡng đã được tạo:

### 💧 Nước (Water) - 3 ngưỡng

| Chỉ số | Min | Max | Đơn vị | Mô tả |
|-------|-----|-----|--------|-------|
| pH | 6 | 8 | - | Độ pH nước |
| DO | 4 | 10 | mg/L | Độ ô xy hòa tan |
| Nhiệt độ | 25 | 35 | °C | Nhiệt độ nước |

### 🌡️ Không Khí (Air) - 3 ngưỡng

| Chỉ số | Min | Max | Đơn vị | Mô tả |
|-------|-----|-----|--------|-------|
| PM2.5 | 0 | 75 | µg/m³ | Chất lượng không khí |
| PM10 | 0 | 150 | µg/m³ | Chất lượng không khí |
| CO2 | 400 | 1000 | ppm | Nồng độ CO2 |

### 🌱 Đất (Soil) - 2 ngưỡng

| Chỉ số | Min | Max | Đơn vị | Mô tả |
|-------|-----|-----|--------|-------|
| pH | 5.5 | 7.5 | - | Độ pH đất |
| Độ Ẩm | 20 | 40 | % | Độ ẩm đất |

---

## 🔌 API Endpoints - Ví Dụ Sử Dụng

### 1. Đăng Nhập
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@ems.com",
  "password": "admin123"
}

Response: { token, user }
```

### 2. Dánh Sách Trạm
```bash
GET /api/stations
Authorization: Bearer <token>

Response: [
  {
    "_id": "...",
    "code": "WS001",
    "name": "Trạm Một - Sông Tiền",
    "type": "water",
    "status": "active",
    "coordinates": { "latitude": 10.2539, "longitude": 105.9597 },
    "address": "Khu vực sông Tiền, thành phố Vĩnh Long"
  },
  ...
]
```

### 3. Dữ Liệu Môi Trường
```bash
GET /api/data?type=water&stationId=<id>&page=1&limit=10
Authorization: Bearer <token>

Response: {
  total: 2,
  pages: 1,
  data: [
    {
      "_id": "...",
      "station": { "_id": "...", "code": "WS001", "name": "..." },
      "type": "water",
      "measurementDate": "2024-...",
      "water": { "ph": 6.2, "do_level": 7.5, ... },
      "status": "submitted",
      "recordedBy": { "fullName": "Nhân viên Công ty A" }
    }
  ]
}
```

### 4. Cảnh Báo
```bash
GET /api/alerts?type=critical&isResolved=false
Authorization: Bearer <token>

Response: [
  {
    "_id": "...",
    "station": { "code": "AS001", "name": "Trạm Không Khí - TT Vĩnh Long" },
    "type": "critical",
    "indicator": "pm25",
    "value": 95,
    "message": "🚨 PM2.5 có hại: 95.0 µg/m³ (vượt 75)",
    "isResolved": false,
    "createdAt": "2024-..."
  }
]
```

### 5. Xử Lý Cảnh Báo
```bash
PATCH /api/alerts/<alertId>/resolve
Authorization: Bearer <token>

Response: { success: true, message: "Alert marked as resolved" }
```

### 6. Danh Sách Người Dùng (Admin)
```bash
GET /api/auth/users
Authorization: Bearer <token>

Response: [
  {
    "_id": "...",
    "fullName": "Admin System",
    "email": "admin@ems.com",
    "role": "admin",
    "company": "Admin System",
    "isActive": true
  },
  ...
]
```

---

## � Menu & Chức Năng Theo Vai Trò

### 👨‍💼 **Admin - Quản Lý Hệ Thống**
Menu hiển thị:
- ✅ Dashboard (xem tổng quan)
- ✅ Bản đồ môi trường
- ✅ Cảnh báo (**có nút xử lý** - đánh dấu đã giải quyết)
- ✅ Báo cáo & Thống kê
- ✅ **Quản lý điểm quan trắc** (tạo/sửa/xóa trạm)
- ✅ **Quản lý người dùng** (tạo/sửa/xóa tài khoản)
- ✅ **Cấu hình ngưỡng** (thiết lập giá trị cảnh báo)
- ✅ Thông tin cá nhân

### 👨‍🔧 **Staff - Nhập Dữ Liệu**
Menu hiển thị:
- ✅ Dashboard (xem tổng quan)
- ✅ Bản đồ môi trường
- ✅ Cảnh báo (**xem chỉ**, không hiển thị nút xử lý)
- ✅ Báo cáo & Thống kê
- ✅ **Nhập dữ liệu** (điểm quan trắc được tạo sẵn)
- ✅ Thông tin cá nhân
- ❌ Quản lý điểm quan trắc
- ❌ Quản lý người dùng
- ❌ Cấu hình ngưỡng
- ❌ **Xử lý cảnh báo** (chỉ Admin làm)

### 👁️ **Viewer - Xem Dữ Liệu**
Menu hiển thị:
- ✅ Dashboard (xem tổng quan)
- ✅ Bản đồ môi trường
- ✅ Cảnh báo (**xem chỉ**, không hiển thị nút xử lý)
- ✅ Báo cáo & Thống kê (chỉ xem)
- ✅ Thông tin cá nhân
- ❌ Nhập dữ liệu
- ❌ Quản lý điểm quan trắc
- ❌ Quản lý người dùng
- ❌ Cấu hình ngưỡng
- ❌ **Xử lý cảnh báo** (chỉ Admin làm)

---

## �💾 Tạo Dữ Liệu Mới Từ Giao Diện

### 📌 Các Bước:

**0️⃣ Admin: Tạo & Quản lý Điểm Quan Trắc (Một lần)**
```
- Đăng nhập: admin@ems.com / admin123
- Menu: "Quản lý điểm quan trắc"
- Tạo các trạm cần theo dõi (nước, khí, đất)
- Các trạm này sẽ sẵn sàng cho Staff nhập dữ liệu
```

**1️⃣ Staff: Nhập Dữ Liệu (Liên Tục)**
```
- Đăng nhập: staff@companya.com / staff123
- Menu: "Nhập dữ liệu"
- Chọn **trạm từ danh sách** (Admin đã tạo)
- Chọn loại dữ liệu (nước/khí/đất)
- Nhập các chỉ tiêu
- Nhấn "Lưu Dữ Liệu"
  → ✅ Dữ liệu được **lưu & công bố tự động**
  → 📊 Cảnh báo tạo ngay (nếu vượt ngưỡng)
```

**2️⃣ Staff: Xem Cảnh Báo & Báo Cáo (Chỉ Xem)**
```
- Khi nhập dữ liệu vượt ngưỡng → cảnh báo tạo tự động
- Menu: "Cảnh báo" → xem các cảnh báo (không có nút xử lý)
- Menu: "Báo cáo & Thống kê" → xem thống kê dữ liệu
```

**3️⃣ Admin: Xử Lý Cảnh Báo & Cấu Hình**
```
- Menu: "Cảnh báo" → xem cảnh báo & nhấn "Xử Lý" (đánh dấu đã giải quyết)
- Menu: "Cấu hình ngưỡng" → thiết lập giá trị Min/Max
- Menu: "Quản lý người dùng" → tạo tài khoản Staff mới
- Menu: "Quản lý trạm" → tạo/sửa/xóa điểm quan trắc
```

---

## 🔄 Quy Trình Lưu Dữ Liệu

```
┌─────────────────────────────────────┐
│ 1. Staff nhập dữ liệu               │
│    (Frontend: Nhập dữ liệu)         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. API POST /api/data               │
│    Validate & Save to MongoDB       │
│    Status: "approved" (tự động)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. Hệ thống tạo Alerts              │
│    Nếu vượt ngưỡng:                 │
│    POST /api/alerts (tự động)       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. Hiển thị ở Cảnh Báo              │
│    Staff & Admin có thể xem         │
│    Đánh dấu "Đã xử lý"              │
└─────────────────────────────────────┘
```

---

## 🧪 Kiểm Tra API Với Postman

1. **Import** `POSTMAN_COLLECTION.json` vào Postman
2. **Thiết lập biến:**
   - `base_url`: `http://localhost:5000/api`
   - `token`: Lấy từ endpoint login
3. **Chạy các request:**
   - Get Stations
   - Create Data
   - Get Alerts
   - Resolve Alert

---

## 📊 Thống Kê Dữ Liệu

```
Tổng số trạm (Admin quản lý):  45
├─ Vĩnh Long (8 huyện):     19 trạm
├─ Trà Vinh (4 huyện):      13 trạm
└─ Bến Tre (4 huyện):       13 trạm

Loại trạm:
├─ Nước (Water):   15 trạm
├─ Khí (Air):      15 trạm
└─ Đất (Soil):     15 trạm

Tổng dữ liệu (Staff nhập):  45 bản ghi
├─ Nước:                  15
├─ Khí:                   15
└─ Đất:                   15

Cảnh báo (Tự động tạo):      38
├─ Critical:            5 (cao nhất)
├─ Warning:            29 (trung bình)
└─ Resolved:            9 (đã xử lý)

Người dùng:                  4
├─ Admin:               1
├─ Staff:               2
└─ Viewer:              1
```

---

## ⚙️ Tạo Lại Dữ Liệu Mẫu

Nếu muốn reset và tạo lại 45 trạm + dữ liệu:

```bash
cd backend
npm run seed
```

⚠️ **Lưu ý:** Lệnh này sẽ **xóa tất cả dữ liệu cũ** và tạo mới:
- 45 điểm quan trắc (8+4+4 huyện từ 3 tỉnh)
- 45 bản ghi dữ liệu môi trường
- 38 cảnh báo tự động
- 4 tài khoản người dùng

---

## 🚀 Bước Tiếp Theo

### 1️⃣ **Chuẩn Bị (Admin)**
- ✅ Tạo/Quản lý các điểm quan trắc (Quản lý trạm)
- ✅ Cấu hình ngưỡng cảnh báo (Cấu hình ngưỡng)
- ✅ Tạo tài khoản Staff (Quản lý người dùng)

### 2️⃣ **Hoạt Động Liên Tục (Staff)**
- ✅ Nhập dữ liệu từ các trạm (Nh  Dữ liệu)
- ✅ Xem cảnh báo khi có vợt ngưỡng (Cảnh báo)
- ✅ Xem báo cáo thống kê (Báo cáo & Thống kê)

### 3️⃣ **Giám Sát (Admin & Staff)**
- ✅ Xem Dashboard tổng quan
- ✅ Xem Bản đồ môi trường
- ✅ Xem các Cảnh báo & Báo cáo

---

## 🎯 Khởi động ứng dụng:

```bash
# Terminal 1 - Backend
cd backend
npm install  # Lần đầu
npm run seed # Tạo dữ liệu mẫu
npm run dev:backend  # Chạy server (port 5000)

# Terminal 2 - Frontend
cd frontend
npm install  # Lần đầu
npm run dev:frontend # Chạy app (port 5173)
```

**Truy cập:** http://localhost:5173
- Login bằng Staff để test nhập dữ liệu
- Login bằng Admin để quản lý hệ thống

---

## 📞 Hỗ Trợ

Nếu có vấn đề:
1. Kiểm tra MongoDB đã kết nối?
2. Back-end đã chạy trên port 5000?
3. Frontend đã chạy trên port 5173?
4. Xem logs: `npm run seed` để kiểm tra tạo dữ liệu

---

**Cập nhật:** April 3, 2026
**Status:** ✅ Hệ thống hoàn chỉnh - Phân quyền đúng theo nghiệp vụ
- Admin: Quản lý trạm, người dùng, cấu hình + **XỬ LÝ cảnh báo**
- Staff: Nhập dữ liệu (45 trạm đã sẵn) + **CHỈ XEM** cảnh báo
- Viewer: Xem dữ liệu (chỉ đọc) + **CHỈ XEM** cảnh báo
- 38 cảnh báo tự động tạo khi vượt ngưỡng
