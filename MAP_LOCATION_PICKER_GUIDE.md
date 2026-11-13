# 📍 Hướng Dẫn Sử Dụng Map Location Picker

## 🎯 Tổng Quan

Thay vì nhập thủ công kinh độ và vĩ độ, bạn giờ có 2 cách **dễ dàng** để chọn vị trí:

1. **🖱️ Click Trực Tiếp Trên Bản Đồ**
2. **📍 Chọn Huyện/Xã (Tự động đặt vị trí)**

---

## 📖 Cách Thêm Điểm Quan Trắc Mới

### Bước 1: Mở Modal Thêm Điểm

```
Quản Lý Điểm Quan Trắc
│
├─ [+ Thêm Điểm] ← Click vào đây
│
▼
Modal: "Thêm Điểm Quan Trắc"
```

### Bước 2: Điền Thông Tin Cơ Bản

```
┌────────────────────────────────────────────┐
│ Thêm Điểm Quan Trắc                        │
├────────────────────────────────────────────┤
│ Mã Điểm:      [ST001           ]           │ ← Nhập mã
│ Tên Điểm:     [Sông Tiền       ]           │ ← Nhập tên
│ Loại:         [💧 Nước      ▼] │ ← Chọn loại
│ Trạng Thái:   [✅ Hoạt Động ▼] │ ← Chọn trạng thái
│ Địa Chỉ:      [Khu vực sông     │
│                Tiền, TP VL...] │ ← Nhập địa chỉ
│                                 │
│ ════════════════════════════════ │
│ 💡 Chọn vị trí: Click trực tiếp  │
│    trên bản đồ HOẶC chọn        │
│    huyện/xã để tự động đặt      │
│ ════════════════════════════════ │
│                                 │
│ [Chọn Tỉnh]    [Chọn Huyện/Xã]   │ ← Dropdowns
│                                 │
│ 🖱️ Click Trên Bản Đồ            │ ← Active button
│ 📍 Chọn Huyện Tự Động           │ ← Inactive lúc đầu
│                                 │
│ ╔═════════════════════════════╗ │
│ ║                             ║ │
│ ║    BẢN ĐỒ (400px height)    ║ │ ← Chọn vị trí ở đây
│ ║                             ║ │
│ ║    📍 Marker hiển thị tại các║ │
│ ║       điểm đã chọn          ║ │
│ ║                             ║ │
│ ║    🖱️ Click để đặt marker    ║ │
│ ║    🖐️ Kéo marker để di chuyển║ │
│ ║                             ║ │
│ ╚═════════════════════════════╝ │
│                                 │
│ Vĩ Độ:    10.2539 (blue)        │ ← Auto-fill
│ Kinh Độ:  105.9597 (blue)       │ ← Auto-fill
│ Huyện:    Thành phố Vĩnh Long   │ ← Auto-fill (nếu chọn)
│                                 │
│ [✓ Xác Nhận Vị Trí] [Sao Chép] │ ← Buttons
│                                 │
│ Mô Tả:    [Điểm quan trắc...  ] │ ← Nhập mô tả (optional)
│                                 │
│                   [Hủy] [Lưu]   │ ← Modal buttons
└────────────────────────────────────────────┘
```

---

## 🎮 Chi Tiết Các Cách Chọn Vị Trí

### Cách 1️⃣ : Click Trực Tiếp Trên Bản Đồ

**Các Bước:**

1. Nút **"🖱️ Click Trên Bản Đồ"** sẽ tự động được active (khi lần đầu load)
2. Nhấp vào **bất kỳ vị trí nào trên bản đồ**
3. Một **marker (ghim) màu xanh** sẽ xuất hiện
4. Tọa độ sẽ tự động cập nhật ⬇️

**Ví Dụ:**
```
Bản Đồ Vĩnh Long (Default View)
┌─────────────────────────────┐
│                             │
│         *  ← Click       📍 ← Marker hiển thị
│      Vĩnh Long              │
│         *                   │
│                             │
│    Vĩ Độ: 10.2539         │
│    Kinh Độ: 105.9597      │
└─────────────────────────────┘
```

**✨ Tính Năng:**
- ✅ Marker có thể **kéo dễ dàng** để điều chỉnh vị trí fine
- ✅ Tọa độ **cập nhật real-time** khi kéo marker
- ✅ Hiển thị **4 chữ số thập phân** (độ chính xác cao)

---

### Cách 2️⃣ : Chọn Huyện Tự Động

**Các Bước:**

1. Từ dropdown **"Chọn Tỉnh"**, chọn một tỉnh:
   - 🏙️ Vĩnh Long
   - 🏙️ Trà Vinh
   - 🏙️ Bến Tre

2. Bản đồ sẽ **tự động zoom** tới tỉnh đó

3. Từ dropdown **"Chọn Huyện/Xã"**, chọn huyện:
   - Thành phố Vĩnh Long
   - Bình Minh
   - Bình Tân
   - Long Hồ
   - Mang Thít
   - Tam Bình
   - Trà Ôn
   - Vũng Liêm
   - *(và huyện khác trong TV, BT)*

4. Marker sẽ **tự động đặt** tại tọa độ của huyện
5. Bản đồ sẽ **tự động zoom** tới huyện đó

**Ví Dụ:**
```
Chọn Tỉnh: Vĩnh Long ✓
    ↓ (Bản đồ zoom to VL)

Chọn Huyện: Bình Minh ✓
    ↓ (Marker đặt ở tọa độ default của Bình Minh)

Kết Quả:
┌─────────────────────────────┐
│  Bình Minh                  │
│     📍 ← Marker auto-placed │
│                             │
│  Vĩ Độ: 10.0833           │
│  Kinh Độ: 105.6667        │
│  Huyện: Bình Minh          │
└─────────────────────────────┘
```

**✨ Tính Năng:**
- ✅ **16 huyện/xã pre-defined** với tọa độ chính xác
- ✅ Tự động **zoom** bản đồ
- ✅ Marker có thể **điều chỉnh tiếp** bằng cách kéo

---

### Cách 3️⃣ : Kết Hợp Cả 2 Cách

**Sẽ không bao giờ bị xung đột!** Bạn có thể:

1. Chọn Tỉnh → Chọn Huyện (Marker auto-place)
2. Nhấp "🖱️ Click Trên Bản Đồ" button
3. Click một điểm mới trên bản đồ (Marker sẽ di chuyển)
4. Thay đổi lại dropdown Huyện (Marker sẽ reset tới huyện)

---

## 📍 Kiểm Tra & Xác Nhận Vị Trí

### Hiển Thị Thông Tin

```
Sau khi chọn vị trí:
┌─────────────────────────────┐
│ Vĩ Độ (Latitude)            │
│ ─────────────────────────   │
│ 10.0833                     │ ← Blue highlight
│                             │
│ Kinh Độ (Longitude)         │
│ ─────────────────────────   │
│ 105.6667                    │ ← Blue highlight
│                             │
│ Huyện/Xã                    │
│ ─────────────────────────   │
│ Bình Minh                   │ ← Nếu chọn từ dropdown
│                             │
│ [✓ Xác Nhận Vị Trí]         │ ← Click này
│ [📋 Sao Chép Tọa Độ]        │ ← Hoặc click này
└─────────────────────────────┘
```

### Nút "✓ Xác Nhận Vị Trí"

```
Click nó để:
  ✔️ Ghi lại tọa độ vào Form
  ✔️ Tọa độ lưu trong field "coordinates"
  ✔️ Tiếp tục điền các field khác
  ✔️ Cuối cùng nhấp "Lưu" để save Station
```

### Nút "📋 Sao Chép Tọa Độ"

```
Click nó để:
  ✔️ Copy tọa độ: "10.0833, 105.6667"
  ✔️ Dán vào chỗ khác (chia sẻ, ghi chú, etc.)
```

---

## 🔄 Chỉnh Sửa Điểm Quan Trắc Hiện Tại

Khi **click nút "Sửa"** trên một Station:

```
1. Modal mở với dữ liệu cũ
2. Bản đồ sẽ hiển thị tọa độ CŨ
3. Marker đặt tại vị trí cũ
4. Có thể:
   ├─ Click để di chuyển marker (vĩ độ)
   ├─ Kéo marker để điều chỉnh (kinh độ)
   ├─ Chọn huyện khác (reset tại huyện mới)
   └─ Xác nhận vị trí mới
5. Nhấp "Lưu" để cập nhật Station
```

---

## 🗺️ Phạm Vi Bản Đồ

### Tỉnh Vĩnh Long (Default - Khi Load)

```
Tâm: 10.2415, 105.7841
Zoom Level: 9
Phạm vi: Toàn tỉnh Vĩnh Long
```

### Tỉnh Trà Vinh

```
Tâm: 9.9342, 106.3424
Zoom Level: 9
Phạm vi: Toàn tỉnh Trà Vinh
```

### Tỉnh Bến Tre

```
Tâm: 10.2375, 106.3678
Zoom Level: 9
Phạm vi: Toàn tỉnh Bến Tre
```

### Chọn Huyện

```
Zoom Level: 11 (zoom vào chi tiết hơn)
Center: Tại tọa độ của huyện được chọn
```

---

## 📊 Danh Sách Tất Cả Huyện & Tọa Độ Pre-defined

### Vĩnh Long (8 huyện)

| Mã | Tên | Vĩ Độ | Kinh Độ |
|----|-----|-------|---------|
| VL01 | Thành phố Vĩnh Long | 10.2539 | 105.9597 |
| VL02 | Bình Minh | 10.0833 | 105.6667 |
| VL03 | Bình Tân | 10.3000 | 105.9000 |
| VL04 | Long Hồ | 10.3167 | 105.8500 |
| VL05 | Mang Thít | 10.1500 | 105.8500 |
| VL06 | Tam Bình | 10.3667 | 105.9167 |
| VL07 | Trà Ôn | 10.0500 | 105.9167 |
| VL08 | Vũng Liêm | 10.3500 | 106.0500 |

### Trà Vinh (4 huyện)

| Mã | Tên | Vĩ Độ | Kinh Độ |
|----|-----|-------|---------|
| TV01 | TP. Trà Vinh | 9.9342 | 106.3424 |
| TV02 | Càng Long | 9.8000 | 106.4000 |
| TV03 | Tiểu Cần | 9.9000 | 106.5000 |
| TV04 | Châu Thành | 9.9500 | 106.3000 |

### Bến Tre (4 huyện)

| Mã | Tên | Vĩ Độ | Kinh Độ |
|----|-----|-------|---------|
| BT01 | TP. Bến Tre | 10.2375 | 106.3678 |
| BT02 | Giồng Trôm | 10.3000 | 106.4000 |
| BT03 | Mỏ Cày Nam | 10.2000 | 106.2000 |
| BT04 | Châu Thành | 10.1000 | 106.3000 |

---

## ⚙️ Chi Tiết Kỹ Thuật

### File Component

```
frontend/src/components/MapLocationPicker.jsx
```

### Props Nhận Vào

```javascript
{
  value: { latitude: 10.2539, longitude: 105.9597 }, // Current coords
  onChange: (coords) => { ... } // Callback khi confirm
}
```

### State Quản Lý

```javascript
selectedCoordinates: {
  latitude: number,
  longitude: number
}
selectedProvince: string (VL | TV | BT)
selectedDistrict: string (VL01 | TV02 | BT03, etc)
mapMode: 'click' | 'district'
```

### Library Sử Dụng

- **Leaflet.js** - Interactive map
- **OpenStreetMap** - Map tiles (free)
- **React** - Component framework

### Tọa Độ Accuracy

```
4 decimal places = ~11 meters precision
└─ Đủ chính xác cho monitoring stations
```

---

## 💡 Tips & Tricks

### ✅ Cách Nhanh Nhất

```
1. Chọn Tỉnh (dropdown)
   ↓ (auto zoom bản đồ)
2. Chọn Huyện (dropdown)
   ↓ (auto place marker)
3. Click "✓ Xác Nhận Vị Trí"
   ↓ (auto fill coordinates)
4. Điền các field khác
5. Nhấp "Lưu"

⏱️ Thời gian: ~30 giây
```

### ✅ Cách Chính Xác

```
1. Click "🖱️ Click Trên Bản Đồ"
2. Zoom bản đồ bằng scroll wheel
3. Nhấp chính xác tại vị trí muốn
4. Kéo marker nếu cần điều chỉnh
5. Click "✓ Xác Nhận Vị Trí"
```

### ✅ Cách Hiệu Chỉnh

```
1. Chọn Tỉnh + Huyện (gần đúng)
2. Click "🖱️ Click Trên Bản Đồ"
3. Fine-tune bằng cách kéo marker
4. Click "✓ Xác Nhận Vị Trí"
```

---

## 🐛 Troubleshooting

### Bản đồ không load

**Giải pháp:**
- Kiểm tra kết nối internet (cần tải OSM tiles)
- Refresh page (F5)
- Clear browser cache

### Marker không hiển thị

**Giải pháp:**
- Click lại việc chọn Tỉnh + Huyện
- Hoặc click trực tiếp trên bản đồ
- Đảm bảo bạn ở trong phạm vi 3 tỉnh

### Tọa độ không update

**Giải pháp:**
- Click nút "✓ Xác Nhận Vị Trí" để lưu tọa độ
- Kiểm tra browser console (F12) cho error

### Không thể chọn Huyện

**Giải pháp:**
- Đầu tiên phải chọn Tỉnh
- Chờ dropdown Huyện active (khoảng 1 giây)

---

## 📋 Bảng So Sánh

| Tính Năng | Click Map | Dropdown Huyện |
|----------|-----------|----------------|
| Tốc độ | Nhanh | Rất nhanh |
| Độ chính xác | Tùy người dùng | Chính xác pre-defined |
| Dễ dàng | Cần zoom/pan | Rất dễ |
| Linh hoạt | Có | Có (pre-defined) |
| Kéo điều chỉnh | ✅ | ✅ |

---

**Version**: 1.0
**Last Updated**: April 3, 2026
**Status**: 🟢 Production Ready
