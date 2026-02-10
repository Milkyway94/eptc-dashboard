# Deployment Guide - EPTC Heatmap Dashboard

Hướng dẫn deploy Frontend lên **GitHub Pages** và Backend lên **Railway**.

---

## 📋 Tổng quan

- **Frontend**: GitHub Pages (Free, Static hosting)
- **Backend**: Railway (Free tier 500h/month)
- **Database**: SQLite (managed by Railway)

---

## 🚀 Part 1: Deploy Backend lên Railway

### Bước 1: Chuẩn bị Repository

```bash
# Initialize git if not already
git init
git add .
git commit -m "Initial commit with deployment configs"

# Push to GitHub
git remote add origin https://github.com/Milkyway94/eptc-dashboard.git
git branch -M main
git push -u origin main
```

### Bước 2: Tạo Project trên Railway

1. Truy cập [Railway.app](https://railway.app)
2. Đăng nhập với GitHub
3. Click **"New Project"**
4. Chọn **"Deploy from GitHub repo"**
5. Chọn repository `eptc-dashboard`
6. Railway sẽ tự động detect và deploy

### Bước 3: Cấu hình Environment Variables

Trong Railway dashboard, vào **Variables** tab và thêm:

```env
# Required
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-change-this-now

# CORS - Add your GitHub Pages URL
CORS_ORIGINS=https://yourusername.github.io,https://yourusername.github.io/eptc-dashboard

# Optional - Database (Railway auto-provides if needed)
# DEFAULT_ADMIN_USERNAME=admin
# DEFAULT_ADMIN_PASSWORD=YourStrongPassword123!
```

**⚠️ QUAN TRỌNG:**
- Đổi `SECRET_KEY` thành chuỗi random dài ít nhất 32 ký tự
- Cập nhật `CORS_ORIGINS` với URL GitHub Pages của bạn
- Đổi admin password để bảo mật

### Bước 4: Cấu hình Root Directory

Railway mặc định deploy từ root. Cần config để deploy từ `backend/`:

1. Vào **Settings** > **Service**
2. Tìm **Root Directory**
3. Nhập: `backend`
4. Click **Save**

### Bước 5: Redeploy

1. Click **Deploy** để apply changes
2. Đợi ~2-3 phút để build
3. Railway sẽ cung cấp URL: `https://your-app-name.up.railway.app`

### Bước 6: Test Backend

```bash
# Test health endpoint
curl https://your-app-name.up.railway.app/health

# Should return:
# {"status": "healthy", "message": "EPTC Heatmap API is running"}
```

### Bước 7: Import Dữ liệu lần đầu

Có 2 cách:

**Option 1: Qua API (Recommended)**
1. Truy cập: `https://your-app-name.up.railway.app`
2. Dùng Admin endpoint để import Excel

**Option 2: Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Connect to project
railway link

# Run commands on Railway
railway run python -c "from app import app; from models import init_db; init_db(app)"
```

---

## 🌐 Part 2: Deploy Frontend lên GitHub Pages

### Bước 1: Cập nhật API URL

Sửa file `frontend/.env.production`:

```env
VITE_API_URL=https://your-railway-app.up.railway.app
```

**Thay** `your-railway-app` bằng Railway URL thực tế của bạn.

### Bước 2: Cập nhật Vite Config

Sửa `frontend/vite.config.js`, dòng `base`:

```javascript
base: process.env.NODE_ENV === 'production'
  ? '/your-repo-name/'  // Thay bằng tên repo của bạn
  : '/',
```

Ví dụ: repo tên `eptc-dashboard` → base: `'/eptc-dashboard/'`

### Bước 3: Enable GitHub Pages

1. Vào **Repository Settings** trên GitHub
2. Scroll xuống **Pages** section
3. **Source**: Deploy from a branch
4. **Branch**: `gh-pages` (sẽ được tạo tự động)
5. Click **Save**

### Bước 4: Push Changes

```bash
git add .
git commit -m "Configure for deployment"
git push origin main
```

### Bước 5: GitHub Actions sẽ tự động deploy

- Vào tab **Actions** để xem progress
- Sau ~2-3 phút, site sẽ live tại:
  - `https://yourusername.github.io/repo-name/`

### Bước 6: Test Frontend

1. Truy cập GitHub Pages URL
2. Test Dashboard hiển thị đúng
3. Test Admin login
4. Test import Excel (nếu có data)

---

## 🔧 Troubleshooting

### Backend Issues

**❌ "Application failed to respond"**
- Check logs: `railway logs` (CLI) hoặc Railway dashboard
- Verify `Procfile` và `railway.json` đúng
- Check environment variables

**❌ "ModuleNotFoundError"**
- Verify `requirements.txt` có đầy đủ dependencies
- Redeploy: Railway dashboard > **Deploy** > **Redeploy**

**❌ "Database not found"**
- SQLite file tự tạo lần đầu chạy
- Dữ liệu sẽ mất khi redeploy (Railway limitation)
- **Solution**: Migrate sang PostgreSQL (xem bên dưới)

**❌ CORS Error**
- Update `CORS_ORIGINS` trong Railway variables
- Format: `https://user.github.io,https://user.github.io/repo`
- Không có trailing slash
- Phải có protocol (`https://`)

### Frontend Issues

**❌ Blank page sau deploy**
- Check browser console (F12)
- Verify `base` trong `vite.config.js` đúng
- Test build locally: `npm run build && npm run preview`

**❌ "Failed to fetch" API errors**
- Check `.env.production` có Railway URL đúng không
- Test API endpoint trực tiếp: `curl https://railway-url/api/tasks`
- Check CORS settings trên backend

**❌ 404 on admin.html**
- GitHub Pages URL: `https://user.github.io/repo/admin.html`
- Ensure `admin.html` có trong `dist/` sau build

**❌ Assets not loading (CSS/JS)**
- Verify `base` path trong `vite.config.js`
- Rebuild: `npm run build`
- Check network tab (F12) cho paths

---

## 🔄 Cập nhật và Maintenance

### Update Frontend

```bash
# Make changes in frontend/
git add frontend/
git commit -m "Update frontend"
git push

# GitHub Actions tự động deploy
```

### Update Backend

```bash
# Make changes in backend/
git add backend/
git commit -m "Update backend"
git push

# Railway tự động detect và redeploy
```

### Manual Redeploy

**Railway:**
- Dashboard > Click **Deploy** > **Redeploy**

**GitHub Pages:**
- Repository > **Actions** > Click workflow > **Re-run jobs**

---

## 📊 Migrate từ SQLite sang PostgreSQL (Optional)

SQLite trên Railway không persist data sau redeploy. Nên migrate sang PostgreSQL:

### Bước 1: Add PostgreSQL Service

1. Railway dashboard > **New** > **Database** > **PostgreSQL**
2. Railway tự động add `DATABASE_URL` vào environment

### Bước 2: Update Backend Config

Sửa `backend/config.py`:

```python
class ProductionConfig(Config):
    # ...existing code...

    # Use PostgreSQL if available, fallback to SQLite
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'database.db')

    # PostgreSQL fix for SQLAlchemy
    if SQLALCHEMY_DATABASE_URI.startswith('postgres://'):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace(
            'postgres://', 'postgresql://', 1
        )
```

### Bước 3: Add psycopg2 to requirements.txt

```txt
# Add to backend/requirements.txt
psycopg2-binary==2.9.9
```

### Bước 4: Deploy

```bash
git add backend/
git commit -m "Add PostgreSQL support"
git push
```

Railway sẽ tự động detect `DATABASE_URL` và connect.

### Bước 5: Import Initial Data

Sử dụng Admin panel để import Excel file lần đầu.

---

## 🔐 Security Checklist

- [ ] Đổi `SECRET_KEY` trong Railway
- [ ] Đổi admin password sau lần login đầu
- [ ] Update `CORS_ORIGINS` với URLs cụ thể (không dùng `*`)
- [ ] Enable HTTPS (mặc định trên Railway và GitHub Pages)
- [ ] Review environment variables không có sensitive data
- [ ] Add `.env` vào `.gitignore` (already done)
- [ ] Rate limiting cho API endpoints (optional)

---

## 📈 Monitoring

### Railway Dashboard

- **Deployments**: Xem history và logs
- **Metrics**: CPU, Memory usage
- **Logs**: Real-time application logs

### GitHub Actions

- **Actions** tab: Xem deployment history
- Email notifications khi deployment fail

### Manual Health Check

```bash
# Backend health
curl https://your-railway-app.up.railway.app/health

# Frontend check
curl -I https://yourusername.github.io/repo-name/
```

---

## 💰 Cost & Limits

### Railway Free Tier
- **500 execution hours/month**
- **$5 free credit/month**
- **100GB bandwidth**
- Sleeps after 15 min inactivity
- **Limit**: ~17 days uptime if always-on

### GitHub Pages
- **100% Free**
- 1GB storage
- 100GB bandwidth/month
- **No sleep** - always available

### Nâng cấp (Nếu cần)

**Railway:**
- Hobby Plan: $5/month
- Unlimited hours
- No sleep

**Alternative for Backend:**
- Render (Free tier: 750h/month)
- Fly.io (Free tier: 3GB storage)
- Heroku (Free tier deprecated)

---

## 🎯 Next Steps

1. ✅ Deploy backend lên Railway
2. ✅ Deploy frontend lên GitHub Pages
3. ✅ Test toàn bộ hệ thống
4. 🔄 Import dữ liệu Excel
5. 🔐 Đổi admin credentials
6. 📊 (Optional) Migrate sang PostgreSQL
7. 🚀 Share với team!

---

## 🆘 Cần giúp đỡ?

- **Railway Docs**: https://docs.railway.app
- **GitHub Pages Docs**: https://docs.github.com/pages
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy
- **Issues**: Create issue on GitHub repo

---

**Chúc bạn deploy thành công! 🎉**
