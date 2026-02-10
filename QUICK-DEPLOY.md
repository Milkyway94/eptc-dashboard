# ⚡ Quick Deploy Guide

Deploy trong 10 phút! Hướng dẫn tối giản.

---

## 🎯 Mục tiêu

- **Backend**: Railway (Free 500h/month)
- **Frontend**: GitHub Pages (Free unlimited)

---

## 📝 Điều kiện tiên quyết

- ✅ GitHub account
- ✅ Railway account (đăng ký với GitHub)
- ✅ Code đã push lên GitHub

---

## 🚀 Bước 1: Deploy Backend (5 phút)

### 1.1 Tạo Project trên Railway

```
1. https://railway.app → Login với GitHub
2. New Project → Deploy from GitHub repo
3. Chọn repo: eptc-dashboard
4. Railway tự động deploy
```

### 1.2 Config Root Directory

```
Settings → Root Directory → nhập: backend → Save
```

### 1.3 Add Environment Variables

```
Variables tab → Add:

FLASK_ENV=production
SECRET_KEY=<random-32-chars-thay-đổi-này>
CORS_ORIGINS=https://yourusername.github.io,https://yourusername.github.io/repo-name
```

**Cách tạo SECRET_KEY:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 1.4 Redeploy

```
Click "Deploy" → Đợi 2-3 phút
Copy Railway URL: https://xxx.up.railway.app
```

### 1.5 Test

```bash
curl https://xxx.up.railway.app/health
# Should return: {"status": "healthy", ...}
```

✅ **Backend Done!**

---

## 🌐 Bước 2: Deploy Frontend (5 phút)

### 2.1 Update Config

**File: `frontend/.env.production`**
```env
VITE_API_URL=https://xxx.up.railway.app
```
*Thay `xxx` bằng Railway URL thực tế*

**File: `frontend/vite.config.js`**
```javascript
base: process.env.NODE_ENV === 'production'
  ? '/repo-name/'  // Thay bằng tên repo GitHub của bạn
  : '/',
```

### 2.2 Enable GitHub Pages

```
GitHub repo → Settings → Pages
Source: "Deploy from a branch"
Branch: gh-pages
Save
```

### 2.3 Push Changes

```bash
git add frontend/.env.production frontend/vite.config.js
git commit -m "Configure for production"
git push origin main
```

### 2.4 Đợi Deploy

```
GitHub repo → Actions tab
Đợi workflow "Deploy Frontend to GitHub Pages" ✅
(~2-3 phút)
```

### 2.5 Access

```
URL: https://yourusername.github.io/repo-name/
Admin: https://yourusername.github.io/repo-name/admin.html
```

✅ **Frontend Done!**

---

## 🔐 Bước 3: Security (2 phút)

### 3.1 Đổi Admin Password

```
1. Vào: https://yourusername.github.io/repo-name/admin.html
2. Login: admin / admin123
3. (TODO: Add change password UI)
4. Hoặc update trong Railway environment: DEFAULT_ADMIN_PASSWORD
```

### 3.2 Verify CORS

```
Railway → Variables → CORS_ORIGINS
Đảm bảo KHÔNG có dấu *
Chỉ có GitHub Pages URLs
```

✅ **Security Done!**

---

## 📊 Bước 4: Import Data (1 phút)

```
1. Vào Admin Panel
2. Upload: eptc_canhbaocodinh.xlsx
3. Preview → Import
4. Quay lại Dashboard xem kết quả
```

✅ **Complete!**

---

## 🎉 Done!

```
✅ Backend deployed: https://xxx.up.railway.app
✅ Frontend deployed: https://username.github.io/repo-name
✅ Security configured
✅ Data imported

🎊 Ready for production!
```

---

## 🔧 Troubleshooting

### Backend không start

```bash
# Check logs trên Railway dashboard
# Hoặc dùng CLI:
railway logs
```

### Frontend blank page

```
F12 → Console → Check errors
Common issue: base path in vite.config.js sai
```

### CORS error

```
Railway → Variables → Update CORS_ORIGINS
Format: https://user.github.io,https://user.github.io/repo
(Không có trailing slash, phải có https://)
```

### GitHub Actions fail

```
Actions tab → Click failed workflow → View logs
Common issues:
- package-lock.json conflicts → Delete và npm install lại
- Build errors → Test local với npm run build
```

---

## 📚 Chi tiết hơn?

- **Full Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Checklist**: [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)
- **Test Production**: `./test-production.sh`

---

**That's it! Deploy xong trong 10 phút! 🚀**
