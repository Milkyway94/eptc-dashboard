# Quick Start Guide - EPTC Heatmap Dashboard

Hướng dẫn nhanh để chạy ứng dụng trong 5 phút!

## 🚀 Cách 1: Sử dụng Scripts (Recommended)

### Bước 1: Khởi động Backend

Mở terminal và chạy:

```bash
./start-backend.sh
```

Server sẽ chạy tại: **http://localhost:5000**

**Thông tin đăng nhập mặc định:**
- Username: `admin`
- Password: `admin123`

### Bước 2: Khởi động Frontend

Mở terminal MỚI (giữ backend đang chạy) và chạy:

```bash
./start-frontend.sh
```

Frontend sẽ tự động mở browser tại: **http://localhost:5173**

### Bước 3: Import Dữ liệu

1. Truy cập: http://localhost:5173/admin.html
2. Đăng nhập với `admin` / `admin123`
3. Upload file `eptc_canhbaocodinh.xlsx`
4. Click "Import ngay"
5. Quay lại Dashboard để xem kết quả

---

## 🛠️ Cách 2: Chạy Thủ công

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend

Mở terminal mới:

```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Sử dụng

### Dashboard (http://localhost:5173)

- **Xem Heatmap**: Màu càng đậm = càng nhiều công việc
- **Click vào ngày**: Xem chi tiết trong modal
- **Sidebar bên phải**: Công việc sắp tới (đỏ = gấp, trong 3 ngày)

### Admin Panel (http://localhost:5173/admin.html)

1. **Login** với admin/admin123
2. **Upload** file Excel (.xlsx, .xls)
3. **Preview** để kiểm tra dữ liệu
4. **Import** để thêm vào database
5. **Statistics** xem tổng quan

---

## 🔧 Troubleshooting

### Backend không khởi động

```bash
# Kiểm tra Python version (cần >= 3.8)
python3 --version

# Cài lại dependencies
cd backend
pip install -r requirements.txt --force-reinstall
```

### Frontend không build

```bash
# Kiểm tra Node version (cần >= 18)
node --version

# Xóa và cài lại
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### CORS Error

Đảm bảo backend đang chạy tại `localhost:5000` và frontend tại `localhost:5173`.

### Import Excel bị lỗi

- File phải là `.xlsx` hoặc `.xls`
- Kiểm tra cấu trúc: có đúng 4 cột (STT, Phòng ban, Nội dung, Ngày)
- Xem log trong terminal backend để biết lỗi chi tiết

---

## 📝 Ghi chú

- ⚠️ **Đổi mật khẩu admin** ngay sau lần đăng nhập đầu!
- 📂 Database được lưu tại: `backend/database.db`
- 🔄 Import nhiều lần sẽ tự động skip duplicates
- 📱 Responsive: Hoạt động tốt trên mobile/tablet/desktop

---

## 🎯 Next Steps

1. Đọc [README.md](README.md) để hiểu đầy đủ tính năng
2. Xem [TECHNICAL_DESIGN.md](docs/TECHNICAL_DESIGN.md) cho chi tiết kỹ thuật
3. Tùy chỉnh màu sắc trong `frontend/src/utils/colorUtils.js`
4. Deploy lên production (xem README.md)

---

**Happy Coding! 🎉**
