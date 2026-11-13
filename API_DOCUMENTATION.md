# 📖 Tài Liệu API

## Cấu Trúc Request

Tất cả requests phải có header:
```
Content-Type: application/json
Authorization: Bearer {token}
```

---

## 🔐 Authentication APIs

### 1. Đăng Ký Tài Khoản

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "password123",
  "phone": "0123456789"
}
```

**Response (201):**
```json
{
  "message": "Đăng ký thành công",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "65abc123...",
    "fullName": "Nguyễn Văn A",
    "email": "user@example.com",
    "role": "viewer"
  }
}
```

---

### 2. Đăng Nhập

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Đăng nhập thành công",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "65abc123...",
    "fullName": "Nguyễn Văn A",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

---

## 🗺️ Station APIs

### 3. Lấy Danh Sách Điểm Quan Trắc

**Endpoint:** `GET /api/stations`

**Query Parameters:**
- `type` (optional): 'water', 'air', 'soil'
- `district` (optional): District ID
- `commune` (optional): Commune ID

**Response (200):**
```json
{
  "message": "Lấy danh sách điểm quan trắc thành công",
  "total": 5,
  "data": [
    {
      "_id": "65abc123...",
      "code": "STATION01",
      "name": "Điểm Quan Trắc Nước 1",
      "type": "water",
      "status": "active",
      "coordinates": {
        "latitude": 10.0833,
        "longitude": 105.6667
      },
      "address": "Huyện Bình Minh",
      "district": {
        "_id": "65abc124...",
        "name": "Bình Minh"
      }
    }
  ]
}
```

---

### 4. Tạo Điểm Quan Trắc

**Endpoint:** `POST /api/stations`

**Required Role:** `admin` hoặc `staff`

**Request Body:**
```json
{
  "code": "STATION01",
  "name": "Điểm Quan Trắc Nước 1",
  "type": "water",
  "province": "65abc124...",
  "district": "65abc125...",
  "commune": "65abc126...",
  "coordinates": {
    "latitude": 10.0833,
    "longitude": 105.6667
  },
  "address": "Huyện Bình Minh"
}
```

**Response (201):**
```json
{
  "message": "Tạo điểm quan trắc thành công",
  "station": { ... }
}
```

---

### 5. Cập Nhật Điểm Quan Trắc

**Endpoint:** `PUT /api/stations/{id}`

**Request Body:**
```json
{
  "name": "Tên mới",
  "coordinates": {
    "latitude": 10.1,
    "longitude": 105.7
  },
  "status": "maintenance"
}
```

---

### 6. Xóa Điểm Quan Trắc

**Endpoint:** `DELETE /api/stations/{id}`

**Required Role:** `admin`

---

### 7. Thống Kê Điểm Quan Trắc

**Endpoint:** `GET /api/stations/statistics`

**Response:**
```json
{
  "data": {
    "totalStations": 5,
    "stationsByType": [
      { "_id": "water", "count": 2 },
      { "_id": "air", "count": 2 },
      { "_id": "soil", "count": 1 }
    ]
  }
}
```

---

## 📊 Environment Data APIs

### 8. Thu Thập Dữ Liệu Nước

**Endpoint:** `POST /api/data`

**Required Role:** `staff`

**Request Body:**
```json
{
  "station": "65abc123...",
  "type": "water",
  "measurementDate": "2024-03-11T10:30:00Z",
  "water": {
    "ph": 7.2,
    "do_level": 6.5,
    "temperature": 28.5,
    "turbidity": 2.1,
    "conductivity": 800
  },
  "notes": "Điều kiện bình thường"
}
```

---

### 9. Thu Thập Dữ Liệu Không Khí

**Endpoint:** `POST /api/data`

**Request Body:**
```json
{
  "station": "65abc123...",
  "type": "air",
  "measurementDate": "2024-03-11T10:30:00Z",
  "air": {
    "pm25": 45.5,
    "pm10": 95.2,
    "co2": 650,
    "temperature": 30,
    "humidity": 65,
    "pressure": 1013
  }
}
```

---

### 10. Thu Thập Dữ Liệu Đất

**Endpoint:** `POST /api/data`

**Request Body:**
```json
{
  "station": "65abc123...",
  "type": "soil",
  "measurementDate": "2024-03-11T10:30:00Z",
  "soil": {
    "ph": 6.8,
    "moisture": 35,
    "nitrogen": 120,
    "phosphorus": 50,
    "potassium": 150,
    "organicMatter": 2.5
  }
}
```

---

### 11. Lấy Dữ Liệu

**Endpoint:** `GET /api/data`

**Query Parameters:**
- `station`: Station ID
- `type`: 'water', 'air', 'soil'
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD
- `page`: 1, 2, ...
- `limit`: 10, 20, ...

**Response:**
```json
{
  "message": "Lấy dữ liệu môi trường thành công",
  "total": 100,
  "pages": 10,
  "currentPage": 1,
  "data": [
    {
      "_id": "65abc123...",
      "station": { "_id": "...", "name": "Station 1" },
      "type": "water",
      "measurementDate": "2024-03-11T10:30:00Z",
      "water": { ... }
    }
  ]
}
```

---

### 12. Thống Kê Dữ Liệu

**Endpoint:** `GET /api/data/statistics`

**Response:**
```json
{
  "data": {
    "totalRecords": 150,
    "recordsByType": [
      { "_id": "water", "count": 50 }
    ]
  }
}
```

---

## ⚠️ Alert APIs

### 13. Lấy Cảnh Báo

**Endpoint:** `GET /api/alerts`

**Query Parameters:**
- `isResolved`: 'true', 'false'
- `type`: 'warning', 'critical'

**Response:**
```json
{
  "data": [
    {
      "_id": "65abc123...",
      "type": "critical",
      "indicator": "ph",
      "value": 8.5,
      "message": "pH vượt ngưỡng",
      "isResolved": false,
      "createdAt": "2024-03-11T10:30:00Z"
    }
  ]
}
```

---

### 14. Giải Quyết Cảnh Báo

**Endpoint:** `PUT /api/alerts/{id}/resolve`

**Required Role:** `admin` hoặc `staff`

---

## 📍 Location APIs

### 15. Lấy Danh Sách Tỉnh

**Endpoint:** `GET /api/locations/provinces`

**Response:**
```json
{
  "data": [
    {
      "_id": "65abc123...",
      "code": "VL",
      "name": "Vĩnh Long"
    }
  ]
}
```

---

### 16. Lấy Danh Sách Huyện

**Endpoint:** `GET /api/locations/districts/{provinceId}`

---

### 17. Lấy Danh Sách Xã/Phường

**Endpoint:** `GET /api/locations/communes/{districtId}`

---

## ⚙️ Threshold APIs

### 18. Lấy Ngưỡng Cảnh Báo

**Endpoint:** `GET /api/thresholds`

**Query Parameters:**
- `type`: 'water', 'air', 'soil'

**Response:**
```json
{
  "data": [
    {
      "_id": "65abc123...",
      "type": "water",
      "indicator": "ph",
      "minValue": 6,
      "maxValue": 8,
      "unit": "",
      "name": "pH Nước"
    }
  ]
}
```

---

### 19. Tạo Ngưỡng Cảnh Báo

**Endpoint:** `POST /api/thresholds`

**Required Role:** `admin`

**Request Body:**
```json
{
  "name": "DO Nước",
  "type": "water",
  "indicator": "do_level",
  "minValue": 4,
  "maxValue": 10,
  "unit": "mg/L"
}
```

---

## 🔑 Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": ["Email is required"]
}
```

### 401 Unauthorized
```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

### 403 Forbidden
```json
{
  "message": "Bạn không có quyền truy cập"
}
```

### 404 Not Found
```json
{
  "message": "Tài nguyên không tồn tại"
}
```

### 500 Server Error
```json
{
  "message": "Lỗi máy chủ"
}
```

---

## 🧪 Ví Dụ Sử Dụng với Axios (Frontend)

```javascript
import { authService, stationService, dataService } from '../services';

// Login
const result = await authService.login('user@example.com', 'password');
const token = result.data.token;

// Lấy danh sách station
const stations = await stationService.getAllStations();

// Tạo dữ liệu nước
const data = await dataService.createData({
  station: 'stationId',
  type: 'water',
  measurementDate: new Date(),
  water: {
    ph: 7.2,
    do_level: 6.5,
    temperature: 28.5
  }
});
```

---

## 📝 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

**✅ Tài liệu API hoàn chỉnh!**
