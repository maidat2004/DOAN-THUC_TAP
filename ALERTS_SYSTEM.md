# Hệ Thống Cảnh Báo Môi Trường

## 📋 Tổng Quan

Hệ thống cảnh báo hoàn chỉnh được xây dựng với:
- **Sample Data**: Dữ liệu mẫu cho tất cả loại trạm (nước, không khí, đất)
- **API Connections**: Kết nối đầy đủ giữa cảnh báo, dữ liệu môi trường, trạm quan trắc, ngưỡng
- **Database Integration**: Lưu trữ tất cả dữ liệu trong MongoDB
- **Enhanced Frontend**: Giao diện cải tiến với chi tiết toàn diện

---

## 🗄️ Cấu Trúc Dữ Liệu

### Alert Model (Mô Hình Cảnh Báo)
```javascript
{
  station: ObjectId,           // Tham chiếu đến trạm quan trắc
  environmentData: ObjectId,   // Tham chiếu đến dữ liệu đo
  threshold: ObjectId,         // Tham chiếu đến ngưỡng vượt quá
  type: 'warning' | 'critical',
  indicator: string,           // Chỉ tiêu (pH, PM2.5, etc.)
  value: number,              // Giá trị thực đo
  message: string,            // Thông báo chi tiết
  isResolved: boolean,        // Trạng thái xử lý
  resolvedAt: Date,          // Thời gian giải quyết
  resolvedBy: ObjectId,       // Người giải quyết
  createdAt: Date,           // Thời gian tạo
  updatedAt: Date
}
```

### Quantitative Relationships (Mối Quan Hệ)
```
Alert
├── Station (Alert → Trạm quan trắc)
│   ├── name: Tên trạm
│   ├── code: Mã trạm
│   ├── type: water | air | soil
│   └── coordinates: Tọa độ GPS
│
├── EnvironmentData (Alert → Dữ liệu đo)
│   ├── water/air/soil: Các chỉ tiêu chi tiết
│   ├── measurementDate: Thời gian đo
│   └── recordedBy: Người ghi nhận
│
└── Threshold (Alert → Ngưỡng)
    ├── indicator: Chỉ tiêu
    ├── minValue: Giá trị tối thiểu
    └── maxValue: Giá trị tối đa
```

---

## 📊 Sample Data được Tạo

### 1. Trạm Quan Trắc (20 tổng cộng)

#### Nước (8 trạm: WS001-WS008)
- **WS001**: Sông Tiền (TP Vĩnh Long) - pH 6.2 ⚠️ Cảnh báo
- **WS002**: Sông Hậu (Bình Minh) - Dữ liệu bình thường
- **WS003**: Long Hồ - Nước sạch
- **WS004**: Trà Ôn - Đang bảo dưỡng
- **WS005**: Trà Vinh - Hoạt động
- **WS006**: Châu Thành Trà Vinh - Hoạt động
- **WS007**: TP Bến Tre - Hoạt động
- **WS008**: Mỏ Cày - Hoạt động

#### Không Khí (8 trạm: AS001-AS008)
- **AS001**: TP Vĩnh Long - Không khí bình thường
- **AS002**: Bình Minh - Dữ liệu bình thường
- **AS003**: Tam Bình - Hoạt động
- **AS004**: Mang Thít - Hoạt động
- **AS005**: Càng Long - PM2.5 bình thường
- **AS006**: Trà Vinh nông thôn - Hoạt động
- **AS007**: Châu Thành Bến Tre - Hoạt động
- **AS008**: Ven biển Bến Tre - Hoạt động

#### Đất (4 trạm: SS001-SS004)
- **SS001**: Vũng nông nghiệp (Bình Tân) - pH 6.8
- **SS002**: Vũng Liêm - Hoạt động
- **SS003**: Tiểu Cần (Trà Vinh) - Hoạt động
- **SS004**: Giồng Trôm (Bến Tre) - Hoạt động

### 2. Ngưỡng Quan Trắc (8 tổng)

#### Nước
| Chỉ Tiêu | Tối Thiểu | Tối Đa | Đơn Vị |
|---------|----------|--------|--------|
| pH | 6 | 8 | - |
| DO | 4 | 10 | mg/L |
| Nhiệt độ | 25 | 35 | °C |

#### Không Khí
| Chỉ Tiêu | Tối Thiểu | Tối Đa | Đơn Vị |
|---------|----------|--------|--------|
| PM2.5 | 0 | 75 | µg/m³ |
| PM10 | 0 | 150 | µg/m³ |
| CO2 | 400 | 1000 | ppm |

#### Đất
| Chỉ Tiêu | Tối Thiểu | Tối Đa | Đơn Vị |
|---------|----------|--------|--------|
| pH | 5.5 | 7.5 | - |
| Độ ẩm | 20 | 40 | % |

### 3. Cảnh Báo Tự Động (20-25 cảnh báo)

#### Cảnh Báo Nghiêm Trọng (🔴)
- **DO Nước Quá Thấp**: Cảnh báo từ WS từ các trạm có giá trị DO < 3.2 mg/L
- **PM2.5 Quá Cao**: Cảnh báo từ AS001, AS003, AS005 (> 100 µg/m³)
- **PM10 Quá Cao**: Từ AS003, AS005 (> 250 µg/m³)

#### Cảnh Báo Mức Độ (🟡)
- **pH Nước Quá Thấp**: WS001 có pH 6.2 (< 6 tối thiểu)
- **Nhiệt Độ Quá Cao**: Một số trạm nước > 35°C
- **PM2.5 Vượt Mức**: Các trạm với 75-100 µg/m³
- **pH Đất Quá Thấp**: SS001 có pH 4.8 (< 5.5)
- **Độ Ẩm Đất Thấp**: Một số trạm SS < 20%

### 4. Tài Khoản Kiểm Thử (4 người dùng)

```
╔════════════════════════════════════════════════════╗
║            TÀI KHOẢN ĐĂNG NHẬP KIỂM THỬ            ║
╠════════════════════════════════════════════════════╣
║ Email: admin@ems.com                               ║
║ Password: admin123                                 ║
║ Role: Admin                                        ║
║ Quyền: Tất cả quyền                                ║
╠════════════════════════════════════════════════════╣
║ Email: staff@companya.com                          ║
║ Password: staff123                                 ║
║ Role: Staff                                        ║
║ Quyền: Xem, tạo, sửa, xóa số dữ liệu              ║
╠════════════════════════════════════════════════════╣
║ Email: staff@companyb.com                          ║
║ Password: staff123                                 ║
║ Role: Staff                                        ║
║ Quyền: Xem, tạo, sửa, sửa số dữ liệu              ║
╠════════════════════════════════════════════════════╣
║ Email: viewer@ems.com                              ║
║ Password: viewer123                                ║
║ Role: Viewer                                       ║
║ Quyền: Chỉ xem dữ liệu                             ║
╚════════════════════════════════════════════════════╝
```

---

## 🚀 API Endpoints

### 1. Lấy Danh Sách Cảnh Báo
```bash
GET /api/alerts

Query Parameters:
- page: số trang (mặc định: 1)
- limit: số bản ghi mỗi trang (mặc định: 20)
- station: lọc theo trạm
- type: lọc theo loại (warning/critical)
- isResolved: lọc theo trạng thái (true/false)

Response:
{
  "message": "Lấy danh sách cảnh báo thành công",
  "total": 25,
  "pages": 3,
  "currentPage": 1,
  "data": [
    {
      "_id": "...",
      "station": {
        "_id": "...",
        "name": "Sông Tiền",
        "code": "WS001",
        "type": "water",
        "coordinates": {...}
      },
      "environmentData": {
        "_id": "...",
        "type": "water",
        "water": {
          "ph": 6.2,
          "do_level": 6.5,
          "temperature": 28
        },
        "measurementDate": "2024-04-03T..."
      },
      "threshold": {
        "_id": "...",
        "name": "pH Nước",
        "minValue": 6,
        "maxValue": 8,
        "unit": ""
      },
      "type": "warning",
      "indicator": "ph",
      "value": 6.2,
      "message": "pH nước quá thấp: 6.2 (Ngưỡng tối thiểu: 6)",
      "isResolved": false,
      "createdAt": "2024-04-03T..."
    }
  ]
}
```

### 2. Lấy Thống Kê Cảnh Báo Chi Tiết
```bash
GET /api/alerts/statistics

Query Parameters:
- startDate: ngày bắt đầu (ISO 8601)
- endDate: ngày kết thúc (ISO 8601)
- type: lọc theo loại (warning/critical)
- station: lọc theo trạm

Response:
{
  "message": "Lấy thống kê cảnh báo thành công",
  "data": {
    "summary": {
      "totalAlerts": 25,
      "unresolvedAlerts": 15,
      "resolvedAlerts": 10,
      "resolutionRate": 40  // %
    },
    "byType": [
      { "type": "critical", "count": 5 },
      { "type": "warning", "count": 20 }
    ],
    "byStation": [
      {
        "station": "Sông Tiền",
        "code": "WS001",
        "count": 2,
        "critical": 1,
        "warning": 1
      }
    ],
    "recent": [...]  // 10 cảnh báo gần nhất
  }
}
```

### 3. Lấy Cảnh Báo Theo Trạm
```bash
GET /api/alerts/station/:stationId

Query Parameters:
- days: số ngày quay lại (mặc định: 30)

Response:
{
  "message": "Lấy 5 cảnh báo từ trạm thành công",
  "data": [...]
}
```

### 4. Đánh Dấu Cảnh Báo Đã Xử Lý
```bash
PUT /api/alerts/:alertId/resolve

Response:
{
  "message": "Giải quyết cảnh báo thành công",
  "data": {
    "_id": "...",
    "isResolved": true,
    "resolvedAt": "2024-04-03T...",
    "resolvedBy": {
      "_id": "...",
      "fullName": "Admin System",
      "email": "admin@ems.com"
    }
  }
}
```

---

## 🎨 Giao Diện Frontend

### Trang Cảnh Báo (Alerts.jsx)

#### 1. Thống Kê (Statistics Cards)
- 📊 Tổng Cảnh Báo
- 🔴 Cảnh Báo Nghiêm Trọng
- 🟡 Chưa Xử Lý
- ✅ Đã Xử Lý

#### 2. Bộ Lọc (Filters)
- Tìm kiếm theo tên trạm, chỉ tiêu, thông báo
- Lọc theo trạng thái (Tất cả / Chưa xử lý / Đã xử lý)
- Lọc theo mức độ (Tất cả / Nghiêm trọng / Cảnh báo)

#### 3. Bảng Cảnh Báo (Table)
| Cột | Nội Dung |
|-----|---------|
| Mức Độ | 🔴 Nghiêm Trọng / 🟡 Cảnh Báo |
| Loại | 💧 Nước / 💨 Không khí / 🌱 Đất |
| Điểm Quan Trắc | Tên trạm + Mã trạm |
| Chỉ Tiêu | pH, PM2.5, DO, etc. |
| Giá Trị vs Ngưỡng | Giá trị đo + Ngưỡng min-max |
| Thông Báo | Mô tả chi tiết |
| Trạng Thái | ✅ Đã Xử Lý / ⏳ Chưa Xử Lý |
| Hành Động | 👁️ Xem chi tiết / ✓ Xử lý |

#### 4. Drawer Chi Tiết Cảnh Báo
Hiển thị thông tin toàn diện khi click "Xem chi tiết":

**📋 Thông Tin Cảnh Báo**
- Mức độ
- Trạng thái
- Thời gian tạo

**🏢 Thông Tin Điểm Quan Trắc**
- Tên trạm: Sông Tiền
- Mã trạm: WS001
- Loại: 💧 Nước
- Địa chỉ: Khu vực sông Tiền, TP Vĩnh Long
- Tọa độ: 10.2539, 105.9597
- Trạng thái: Hoạt động

**📊 Dữ Liệu Môi Trường**
- Thời gian đo: 2024-04-03 10:30:00
- Ghi nhận bởi: Công ty A - Xử lý Nước
- Ghi chú: Dữ liệu nước từ...

**⚠️ Thông Tin Cảnh Báo**
- Chỉ tiêu: ph
- Giá trị đo: 6.2 (màu đỏ)
- Ngưỡng: 6-8
- Thông báo: pH nước quá thấp...

**✅ Thông Tin Giải Quyết** (nếu đã xử lý)
- Thời gian: 2024-04-03 14:00:00
- Được giải quyết bởi: Admin System

---

## 💾 Cài Đặt & Chạy

### 1. Seeding Dữ Liệu

```bash
# Vào thư mục backend
cd backend

# Chạy seed script để tạo dữ liệu mẫu
npm run seed

# Output expected:
# ✅ Seed data created successfully!
# 📊 Created data:
#  - 20 stations (20 total: 8 water, 8 air, 4 soil)
#  - 20 environment data records
#  - 25 alerts (generated from threshold violations)
#  - 4 users (1 admin, 2 staff, 1 viewer)
#  - 8 thresholds
#  - 3 provinces (Vĩnh Long, Trà Vinh, Bến Tre)
```

### 2. Chạy Ứng Dụng

```bash
# Từ thư mục root
npm run dev

# Hoặc riêng backend
npm run dev:backend

# Hoặc riêng frontend
npm run dev:frontend
```

### 3. Truy Cập

```
Frontend: http://localhost:5173
Backend API: http://localhost:5000/api
```

### 4. Đăng Nhập & Kiểm Thử

```
URL: http://localhost:5173/login
Email: admin@ems.com
Password: admin123

Sau đăng nhập: Sidebar → Cảnh Báo Môi Trường
```

---

## 🧪 Kiểm Thử API (Postman)

### Import Collection
```
1. Mở Postman
2. File → Import
3. Chọn file: POSTMAN_COLLECTION.json
4. Collection sẽ được import với tất cả endpoints
```

### Test Flow
```
1. Login (POST /auth/login)
   - Lấy token từ response
   
2. Set Token trong Headers
   - Authorization: Bearer {token}
   
3. Gọi API cảnh báo
   - GET /alerts
   - GET /alerts/statistics
   - GET /alerts/station/{stationId}
   - PUT /alerts/{alertId}/resolve
```

---

## 📈 Workflow Dữ Liệu

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SEEDING DỮ LIỆU MẪUENVIRONMENTDATA                        │
│    - Tạo 20 Stations (Water, Air, Soil)                    │
│    - Tạo 20 Environment Data Records                         │
│    - Tạo 8 Thresholds                                        │
│    - Tạo 4 Users (Admin, 2 Staff, Viewer)                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. SINH LỰC CÁC CẢNH BÁO THẤMVALUE VIOLATIONS                │
│    - So sánh EnvironmentData vs Thresholds                  │
│    - Tạo Alert nếu vượt quá                                 │
│    - 25 Alerts tự động (5 Critical, 20 Warning)             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. LƯU VỮO CƠDỮ SỐ LIỆU (MongoDB)                            │
│    - Tất cả bản ghi được persist                            │
│    - Index đền quặng truy vấn nhanh                         │
│    - Relationships được maintain                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. API LẤYASSERTEQUALS DỮ LIỆU VỚI RELATIONSHIPS             │
│    - GET /alerts (với populate)                             │
│    - Trả về Alert + Station + EnvironmentData + Threshold   │
│    - Trả về User (resolvedBy)                               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. HIỂN THỊ TRÁINITIALIZATION FRONTEND                       │
│    - Bảng Cảnh Báo với tất cả thông tin                     │
│    - Drawer Chi Tiết với Relationships                      │
│    - Statistics & Filters                                   │
│    - Xử lý Cảnh Báo (Mark as Resolved)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Kiểm Tra Dữ Liệu trong MongoDB

```javascript
// Vào MongoDB Shell hoặc Compass

// 1. Đếm Alerts
db.alerts.countDocuments()
// Output: 25 (approximately)

// 2. Xem Alert chi tiết
db.alerts.findOne({}).pretty()

// 3. Đếm theo loại
db.alerts.aggregate([
  { $group: { _id: "$type", count: { $sum: 1 } } }
])

// 4. Đếm theo Status
db.alerts.aggregate([
  { $group: { _id: "$isResolved", count: { $sum: 1 } } }
])

// 5. Liệt kê các Stations
db.stations.find({}).count()
// Output: 20

// 6. Liệt kê EnvironmentData
db.environmentdatas.find({}).count()
// Output: 20
```

---

## ✅ Checklist Triển Khai

- [x] Seed script hoàn chỉnh (20 Stations + 20 Data + 25 Alerts)
- [x] Enhanced Alert model với tất cả fields
- [x] Alert controller với enhanced methods (getAlerts, resolveAlert, statistics)
- [x] Alert routes (GET, PUT, statistics)
- [x] Enhanced Alerts.jsx component với Drawer
- [x] Styling trong Alerts.css
- [x] Sample data với relationship connections
- [x] Database persistence đầy đủ
- [x] Frontend-Backend API connections
- [x] Documentation toàn diện

---

## 🎯 Các Tính Năng Chính

### ✨ Đã Thực Hiện
1. ✅ Sample Data: 20 Stations, 20 Environment Data, 25 Alerts
2. ✅ Automatic Alert Generation: Dựa trên threshold violations
3. ✅ Database Persistence: MongoDB với proper relationships
4. ✅ API Endpoints: Complete CRUD operations
5. ✅ Frontend Display: Rich table + Detailed drawer
6. ✅ Filtering & Search: By status, type, station, keyword
7. ✅ Statistics: Summary, by type, by station
8. ✅ Resolution Workflow: Mark resolved + track resolver

### 🚀 Có Thể Mở Rộng
1. Real-time Alert Notifications (WebSocket)
2. Alert History Timeline
3. Alert Export (PDF/Excel)
4. Custom Alert Rules
5. Alert Escalation System
6. Email/SMS Notifications
7. Alert Analytics Dashboard
8. Automatic Recovery Checks

---

## 📞 Hỗ Trợ & Troubleshooting

### Lỗi: "Cannot read property 'station' of null"
**Giải pháp**: Chạy lại seed script
```bash
npm run seed
```

### Lỗi: "Alert service not connected"
**Giải pháp**: Kiểm tra backend đang chạy
```bash
npm run dev:backend
```

### Lỗi: "Database connection failed"
**Giải pháp**: Kiểm tra MongoDB đang chạy
```bash
mongod --version
```

### Cảnh báo không hiển thị
**Giải pháp**: 
1. Kiểm tra MongoDB có dữ liệu
2. Kiểm tra API response
3. Check browser console for errors

---

## 📝 Ghi Chú

- Tất cả dữ liệu mẫu có thể xóa khi production
- Dữ liệu thực sẽ được tạo qua API bình thường
- Levels của alert (critical/warning) có thể điều chỉnh
- Thresholds có thể đổi trong trang "Cấu Hình Ngưỡng"

---

**Cập nhật lần cuối**: 2024-04-03
**Phiên bản**: 1.0
**Status**: ✅ Production Ready
