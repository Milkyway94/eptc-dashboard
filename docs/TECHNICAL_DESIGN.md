# Technical Design: Heatmap Dashboard cho Quản lý Công việc EPTC

## Context

Xây dựng một web application để quản lý và trực quan hóa công việc/cảnh báo của các phòng ban trong công ty EPTC qua hệ thống Heatmap Calendar.

**Vấn đề cần giải quyết:**
- Khó theo dõi và nắm bắt tổng quan công việc của nhiều phòng ban theo thời gian
- Không có công cụ trực quan để nhận biết các ngày có nhiều deadline
- Thiếu cảnh báo cho các công việc sắp tới
- Cần import dữ liệu từ Excel một cách dễ dàng

**Giải pháp:**
- Dashboard Heatmap với 12 tháng, màu sắc thể hiện mật độ công việc
- Sidebar hiển thị công việc sắp tới với highlight cho việc gấp (3 ngày tới)
- Admin panel để import dữ liệu từ Excel
- Responsive design cho mọi thiết bị

## Technology Stack

- **Backend:** Flask (Python 3.x)
- **Database:** SQLite
- **Frontend:** Vite + Vanilla JavaScript + SCSS
- **Authentication:** Basic Auth (admin có password, user view-only)
- **Excel Processing:** openpyxl hoặc pandas

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Vite)                       │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │   Dashboard Page     │  │      Admin Import Page       │ │
│  │  - Heatmap Calendar  │  │  - File Upload (Excel)       │ │
│  │  - Sidebar Tasks     │  │  - Import Preview            │ │
│  │  - Modal Details     │  │  - Merge/Replace Options     │ │
│  └──────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Flask)                         │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────────────┐  │
│  │  API Routes  │  │  Auth       │  │  Excel Processor  │  │
│  │  /api/tasks  │  │  Middleware │  │  Import/Merge     │  │
│  │  /api/import │  │  Basic Auth │  │  Data Validation  │  │
│  └──────────────┘  └─────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  SQLite Database │
                    │  - tasks table   │
                    │  - users table   │
                    └──────────────────┘
```

## Database Schema

### Table: `tasks`
```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stt INTEGER,                          -- Số thứ tự từ Excel
    department VARCHAR(200),              -- Phòng chủ trì
    content TEXT NOT NULL,                -- Nội dung cảnh báo
    warning_date DATE,                    -- Ngày cảnh báo (có thể NULL)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_warning_date ON tasks(warning_date);
CREATE INDEX idx_department ON tasks(department);
```

### Table: `users`
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- Bcrypt hash
    role VARCHAR(20) DEFAULT 'viewer',    -- 'admin' or 'viewer'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Project Structure

```
/home/quyeths/source-code/EPTC/fixed-warning/
├── backend/
│   ├── app.py                    # Flask application entry point
│   ├── config.py                 # Configuration (DB path, secret key, etc.)
│   ├── models.py                 # SQLAlchemy models
│   ├── auth.py                   # Authentication middleware
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── api.py               # API endpoints for tasks
│   │   └── admin.py             # Admin endpoints for import
│   ├── services/
│   │   ├── __init__.py
│   │   ├── excel_processor.py  # Excel import/export logic
│   │   └── task_service.py     # Business logic for tasks
│   ├── utils/
│   │   ├── __init__.py
│   │   └── helpers.py           # Helper functions
│   ├── requirements.txt
│   └── database.db              # SQLite database file
│
├── frontend/
│   ├── index.html               # Main dashboard page
│   ├── admin.html               # Admin import page
│   ├── src/
│   │   ├── main.js              # Entry point for Vite
│   │   ├── admin.js             # Admin page logic
│   │   ├── styles/
│   │   │   ├── main.scss        # Main stylesheet
│   │   │   ├── heatmap.scss     # Heatmap-specific styles
│   │   │   ├── sidebar.scss     # Sidebar styles
│   │   │   ├── modal.scss       # Modal styles
│   │   │   └── admin.scss       # Admin page styles
│   │   ├── components/
│   │   │   ├── Heatmap.js       # Heatmap component
│   │   │   ├── Sidebar.js       # Sidebar component
│   │   │   ├── Modal.js         # Modal component
│   │   │   └── FileUpload.js    # File upload component
│   │   └── utils/
│   │       ├── api.js           # API client
│   │       ├── dateUtils.js     # Date formatting utilities
│   │       └── colorUtils.js    # Color scale calculations
│   ├── public/
│   │   └── favicon.ico
│   ├── package.json
│   ├── vite.config.js
│   └── .env                     # Environment variables
│
├── docs/
│   └── TECHNICAL_DESIGN.md      # This document (detailed version)
│
├── eptc_canhbaocodinh.xlsx      # Sample Excel file
├── ui.jpg                        # UI mockup
└── README.md                     # Setup and usage instructions
```

## Key Features Implementation

### 1. Heatmap Calendar

**Color Scale (5 levels):**
```javascript
const COLOR_SCALE = {
  0: '#f0f0f0',      // Không có việc - Xám nhạt
  1: '#b3e5fc',      // 1-2 việc - Xanh nhạt
  2: '#fff176',      // 3-4 việc - Vàng
  3: '#ffb74d',      // 5-7 việc - Cam
  4: '#e57373',      // 8+ việc - Đỏ
};
```

**Layout:**
- Grid 12 tháng với `display: grid`
- Auto-fit với responsive breakpoints
- Mỗi ngày hiển thị số lượng công việc ở góc phải
- Click vào ngày mở Modal chi tiết

**Algorithm:**
```javascript
function calculateHeatLevel(taskCount) {
  if (taskCount === 0) return 0;
  if (taskCount <= 2) return 1;
  if (taskCount <= 4) return 2;
  if (taskCount <= 7) return 3;
  return 4;
}
```

### 2. Sidebar "Sắp diễn ra"

**Features:**
- Sticky position (`position: sticky; top: 0`)
- Auto-sync height với Heatmap
- Filter: chỉ hiện công việc từ hôm nay trở đi
- Sort: theo thứ tự thời gian tăng dần
- Highlight: công việc trong 3 ngày tới có viền đỏ + animation rung nhẹ

**Logic:**
```javascript
function filterUpcomingTasks(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks
    .filter(task => new Date(task.warning_date) >= today)
    .sort((a, b) => new Date(a.warning_date) - new Date(b.warning_date));
}

function isUrgent(task) {
  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  return new Date(task.warning_date) <= threeDaysLater;
}
```

### 3. Modal Chi tiết

**Hiển thị khi click vào ngày:**
- Tiêu đề: "Công việc ngày DD/MM/YYYY"
- Danh sách tất cả công việc trong ngày đó
- Phân loại theo phòng ban (group by department)
- Close bằng nút X hoặc click outside

### 4. Admin Import Page

**Flow:**
1. Upload file Excel (.xlsx)
2. Backend parse và validate dữ liệu
3. Hiển thị preview (số lượng records, departments, date range)
4. User xác nhận import
5. Backend merge với dữ liệu cũ (skip duplicate based on: department + content + date)
6. Redirect về dashboard

**Merge Logic:**
```python
def merge_tasks(new_tasks, existing_tasks):
    # Create unique key: department|content|date
    existing_keys = set()
    for task in existing_tasks:
        key = f"{task.department}|{task.content}|{task.warning_date}"
        existing_keys.add(key)

    tasks_to_add = []
    for new_task in new_tasks:
        key = f"{new_task['department']}|{new_task['content']}|{new_task['warning_date']}"
        if key not in existing_keys:
            tasks_to_add.append(new_task)

    return tasks_to_add
```

### 5. Authentication

**Basic Auth Implementation:**
- Login page: `/admin/login`
- Session-based authentication
- Middleware check cho admin routes
- Default admin user: `admin` / `admin123` (changeable)

**Routes Protection:**
- `/` - Public (dashboard view)
- `/admin/*` - Protected (requires admin login)
- `/api/tasks` - Public (GET only)
- `/api/import` - Protected (POST, requires admin)

## API Endpoints

### Public Endpoints

```
GET /api/tasks
Response: {
  "tasks": [
    {
      "id": 1,
      "department": "P3",
      "content": "Nội dung công việc...",
      "warning_date": "2026-06-29",
      "created_at": "2026-02-10T10:00:00"
    },
    ...
  ],
  "total": 311
}

GET /api/tasks/by-date?year=2026
Response: {
  "2026-01-01": [
    { "id": 1, "department": "P3", "content": "..." }
  ],
  "2026-01-15": [...],
  ...
}

GET /api/tasks/upcoming?limit=20
Response: {
  "tasks": [...],  // Sorted by warning_date ASC, filtered >= today
  "total": 45
}
```

### Admin Endpoints (Protected)

```
POST /api/admin/import
Headers: { "Authorization": "Bearer <token>" }
Body: multipart/form-data
  - file: Excel file
Response: {
  "success": true,
  "stats": {
    "total_imported": 150,
    "new_records": 45,
    "duplicates_skipped": 105,
    "errors": []
  }
}

POST /api/admin/login
Body: { "username": "admin", "password": "admin123" }
Response: {
  "success": true,
  "token": "...",
  "user": { "username": "admin", "role": "admin" }
}

POST /api/admin/logout
Response: { "success": true }
```

## Responsive Design

### Breakpoints

```scss
// Mobile: < 768px
@media (max-width: 767px) {
  .dashboard-container {
    flex-direction: column;  // Stack sidebar below heatmap
  }

  .heatmap-grid {
    grid-template-columns: 1fr;  // 1 month per row
  }

  .sidebar {
    position: static;  // Not sticky on mobile
    max-height: none;
  }
}

// Tablet: 768px - 1024px
@media (min-width: 768px) and (max-width: 1024px) {
  .heatmap-grid {
    grid-template-columns: repeat(2, 1fr);  // 2 months per row
  }
}

// Desktop: > 1024px
@media (min-width: 1025px) {
  .heatmap-grid {
    grid-template-columns: repeat(3, 1fr);  // 3 months per row
  }
}
```

## Color Coding & Visual Design

### Typography
- Font family: `'Inter', 'Segoe UI', system-ui, sans-serif`
- Base font size: `16px` (responsive with `rem` units)
- Line height: `1.5`

### Shadows
```scss
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

### Spacing
- Use `rem` units for consistency
- Base spacing scale: `0.25rem`, `0.5rem`, `1rem`, `1.5rem`, `2rem`, `3rem`

### Animations
```scss
// Urgent task shake animation
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

.urgent {
  animation: shake 0.5s ease-in-out infinite;
  border: 2px solid #e53935;
}
```

## Critical Files to Create

1. **Backend:**
   - `backend/app.py` - Main Flask application
   - `backend/models.py` - Database models
   - `backend/routes/api.py` - API endpoints
   - `backend/routes/admin.py` - Admin endpoints
   - `backend/services/excel_processor.py` - Excel import logic
   - `backend/auth.py` - Authentication middleware

2. **Frontend:**
   - `frontend/index.html` - Main dashboard
   - `frontend/admin.html` - Admin page
   - `frontend/src/main.js` - Main app logic
   - `frontend/src/components/Heatmap.js` - Heatmap component
   - `frontend/src/components/Sidebar.js` - Sidebar component
   - `frontend/src/components/Modal.js` - Modal component
   - `frontend/src/styles/main.scss` - Main stylesheet

3. **Configuration:**
   - `backend/requirements.txt` - Python dependencies
   - `frontend/package.json` - Node dependencies
   - `frontend/vite.config.js` - Vite configuration
   - `README.md` - Setup instructions

## Dependencies

### Backend (requirements.txt)
```
Flask==3.0.0
Flask-CORS==4.0.0
Flask-SQLAlchemy==3.1.1
openpyxl==3.1.2
bcrypt==4.1.2
python-dotenv==1.0.0
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "vite": "^5.0.0"
  },
  "devDependencies": {
    "sass": "^1.69.0"
  }
}
```

## Implementation Steps

1. **Setup Project Structure**
   - Create directory structure
   - Initialize git repository
   - Setup Python virtual environment
   - Initialize Vite project

2. **Backend Development**
   - Setup Flask application
   - Create database models
   - Implement authentication
   - Create API endpoints
   - Implement Excel processor

3. **Frontend Development**
   - Setup Vite with SCSS
   - Create HTML templates
   - Implement Heatmap component
   - Implement Sidebar component
   - Implement Modal component
   - Style with responsive SCSS

4. **Integration**
   - Connect frontend to backend API
   - Test import functionality
   - Test authentication flow
   - Test responsive design

5. **Testing & Refinement**
   - Test with actual Excel data
   - Cross-browser testing
   - Mobile device testing
   - Performance optimization

6. **Documentation**
   - Write README with setup instructions
   - Document API endpoints
   - Create user guide for import

## Verification Plan

1. **Backend Testing:**
   ```bash
   # Start Flask server
   cd backend
   python app.py

   # Test API endpoints
   curl http://localhost:5000/api/tasks
   ```

2. **Frontend Testing:**
   ```bash
   # Start Vite dev server
   cd frontend
   npm run dev

   # Open browser at http://localhost:5173
   ```

3. **Import Testing:**
   - Login to admin page
   - Upload `eptc_canhbaocodinh.xlsx`
   - Verify data appears in dashboard
   - Check heatmap colors are correct
   - Verify sidebar shows upcoming tasks
   - Test modal on various dates

4. **Responsive Testing:**
   - Test on desktop (1920x1080)
   - Test on tablet (768x1024)
   - Test on mobile (375x667)
   - Test landscape orientation

5. **Cross-browser Testing:**
   - Chrome
   - Firefox
   - Safari
   - Edge

## Performance Considerations

- Lazy load months not in viewport (optional optimization)
- Cache API responses for 5 minutes
- Debounce search/filter inputs
- Use CSS Grid for layout (hardware accelerated)
- Minimize JavaScript bundle size
- Optimize images (compress ui.jpg reference)

## Security Considerations

- Hash passwords with bcrypt
- Validate file uploads (check extension, size, content)
- Sanitize user inputs
- Use HTTPS in production
- Implement CORS properly
- Rate limit API endpoints
- Session timeout after 1 hour of inactivity

## Future Enhancements (Out of Scope)

- Export to Excel functionality
- Email notifications for upcoming tasks
- Multi-user collaboration
- Task comments/notes
- Task status tracking (pending/in-progress/done)
- Department-specific views/filters
- Mobile app (React Native)

---

**Estimated Implementation Time:** 2-3 days for full implementation
**Complexity:** Medium
**Priority:** High
