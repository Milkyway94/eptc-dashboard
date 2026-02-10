# 🚀 Deployment Checklist

Checklist nhanh để deploy EPTC Dashboard lên production.

---

## ✅ Pre-Deployment Checklist

### Chuẩn bị Code

- [ ] Code đã commit và push lên GitHub
- [ ] Đã test local với `./test-production.sh`
- [ ] Đã update `.gitignore` (không commit sensitive files)
- [ ] Đã review và remove console.log không cần thiết

### Configuration Files

- [ ] `backend/.env.example` - Template có đầy đủ
- [ ] `frontend/.env.production` - Sẽ update sau khi có Railway URL
- [ ] `frontend/vite.config.js` - `base` path đúng với repo name
- [ ] `.github/workflows/deploy-github-pages.yml` - Đã tồn tại

---

## 🔧 Backend Deployment (Railway)

### Setup Railway

- [ ] Tạo tài khoản tại [railway.app](https://railway.app)
- [ ] Kết nối với GitHub account
- [ ] Tạo new project từ GitHub repo

### Configuration

- [ ] Set Root Directory = `backend`
- [ ] Add Environment Variables:
  - [ ] `FLASK_ENV=production`
  - [ ] `SECRET_KEY=<random-32-chars>` ⚠️ PHẢI ĐỔI
  - [ ] `CORS_ORIGINS=https://username.github.io,https://username.github.io/repo-name`
- [ ] Wait for deploy (~2-3 minutes)
- [ ] Copy Railway URL: `https://xxx.up.railway.app`

### Verify Backend

- [ ] Test: `curl https://xxx.up.railway.app/health`
- [ ] Response: `{"status": "healthy", ...}`
- [ ] Test API: `https://xxx.up.railway.app/api/stats`

---

## 🌐 Frontend Deployment (GitHub Pages)

### Update Configuration

- [ ] Update `frontend/.env.production`:
  ```env
  VITE_API_URL=https://your-railway-url.up.railway.app
  ```

- [ ] Update `frontend/vite.config.js`:
  ```javascript
  base: process.env.NODE_ENV === 'production'
    ? '/your-repo-name/'  // ← Đổi thành repo name của bạn
    : '/',
  ```

### Enable GitHub Pages

- [ ] Repo Settings > Pages
- [ ] Source: "Deploy from a branch"
- [ ] Branch: `gh-pages` (sẽ tự tạo)
- [ ] Save

### Deploy

- [ ] Commit changes:
  ```bash
  git add frontend/.env.production frontend/vite.config.js
  git commit -m "Configure for production deployment"
  git push origin main
  ```

- [ ] GitHub Actions tự động chạy (~2-3 min)
- [ ] Check: Repository > Actions tab
- [ ] Wait for ✅ green checkmark

### Verify Frontend

- [ ] Visit: `https://username.github.io/repo-name/`
- [ ] Dashboard loads correctly
- [ ] Heatmap hiển thị (nếu đã có data)
- [ ] Visit: `https://username.github.io/repo-name/admin.html`
- [ ] Login page hiển thị

---

## 🔐 Security Post-Deployment

### Backend Security

- [ ] Login admin panel: `https://github-pages-url/admin.html`
- [ ] Change admin password ngay lập tức
- [ ] Verify CORS chỉ allow GitHub Pages URL
- [ ] Remove `*` từ CORS_ORIGINS nếu có

### Frontend Security

- [ ] Check không commit file `.env` (chỉ `.env.production`)
- [ ] Verify API calls đều dùng HTTPS
- [ ] Test với Incognito/Private window

---

## 📊 Import Initial Data

### Via Admin Panel (Recommended)

- [ ] Login: `https://username.github.io/repo/admin.html`
- [ ] Upload: `eptc_canhbaocodinh.xlsx`
- [ ] Preview data
- [ ] Import
- [ ] Verify on Dashboard

### Via API (Alternative)

```bash
# Get Railway shell
railway login
railway link
railway run python

# In Python shell:
from app import app
from services.excel_processor import ExcelProcessor
from models import db

with app.app_context():
    processor = ExcelProcessor()
    tasks = processor.parse_excel('eptc_canhbaocodinh.xlsx')
    processor.merge_tasks(tasks)
```

---

## ✅ Final Testing

### Functional Testing

- [ ] Dashboard loads without errors
- [ ] Heatmap hiển thị đúng màu sắc
- [ ] Click vào ngày → Modal hiển thị chi tiết
- [ ] Sidebar "Sắp diễn ra" hoạt động
- [ ] Công việc gấp có viền đỏ + animation
- [ ] Legend toggle works

### Admin Testing

- [ ] Login thành công
- [ ] Stats hiển thị đúng
- [ ] Upload Excel file
- [ ] Preview hiển thị đúng
- [ ] Import thành công
- [ ] Logout works

### Cross-browser Testing

- [ ] Chrome/Edge ✓
- [ ] Firefox ✓
- [ ] Safari ✓
- [ ] Mobile Chrome ✓
- [ ] Mobile Safari ✓

### Responsive Testing

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## 📈 Monitoring Setup

### Railway

- [ ] Check Deployments tab
- [ ] Monitor usage (Free: 500h/month)
- [ ] Set up email notifications

### GitHub Actions

- [ ] Check Actions tab regularly
- [ ] Fix failed deployments ASAP

### Manual Checks

- [ ] Weekly: Test health endpoint
- [ ] Monthly: Review logs
- [ ] Quarterly: Update dependencies

---

## 🔄 Update Workflow

### Code Changes

```bash
# Frontend changes
git add frontend/
git commit -m "Update: ..."
git push
# → GitHub Actions auto-deploy

# Backend changes
git add backend/
git commit -m "Update: ..."
git push
# → Railway auto-deploy

# Both
git add .
git commit -m "Update: ..."
git push
# → Both auto-deploy
```

### Manual Redeploy

**Railway:** Dashboard > Deploy > Redeploy

**GitHub Pages:** Actions > Select workflow > Re-run

---

## 🆘 Rollback Plan

### Railway Rollback

1. Dashboard > Deployments
2. Find last working deployment
3. Click "⋮" > Redeploy

### GitHub Pages Rollback

1. Find last working commit
2. `git revert <commit-hash>`
3. `git push`

---

## ✨ Optional Enhancements

### PostgreSQL Migration

- [ ] Add PostgreSQL service on Railway
- [ ] Update backend config
- [ ] Add `psycopg2-binary` to requirements.txt
- [ ] Redeploy
- [ ] Migrate data

### Custom Domain

**Frontend:**
- [ ] Buy domain
- [ ] Add CNAME record
- [ ] Update GitHub Pages settings
- [ ] Wait for DNS propagation

**Backend:**
- [ ] Add custom domain in Railway
- [ ] Update CORS_ORIGINS
- [ ] Update frontend .env.production

### CDN (Optional)

- [ ] Cloudflare for caching
- [ ] Faster global access

---

## 📝 Documentation

- [ ] Update README.md với production URLs
- [ ] Share URLs với team
- [ ] Document any custom configurations
- [ ] Keep DEPLOYMENT.md updated

---

## 🎉 Success!

Khi tất cả checklist ✅:

```
🎊 EPTC Dashboard đã được deploy thành công!

📍 URLs:
  • Dashboard: https://username.github.io/repo-name/
  • Admin:     https://username.github.io/repo-name/admin.html
  • Backend:   https://xxx.up.railway.app

🔐 Security:
  • Admin password đã đổi ✓
  • CORS configured ✓
  • HTTPS enabled ✓

📊 Status:
  • Frontend: Always available (GitHub Pages)
  • Backend:  Active (Railway free tier: 500h/month)

🚀 Ready for production use!
```

---

**Need help?** See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guide.
