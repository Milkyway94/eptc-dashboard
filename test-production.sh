#!/bin/bash

# Test Production Build Locally

echo "🧪 Testing Production Build Locally..."
echo ""

# Test Frontend Build
echo "📦 Building Frontend (production mode)..."
cd frontend
NODE_ENV=production npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
    echo ""
    echo "📂 Build output in: frontend/dist/"
    echo ""
    echo "Preview with: cd frontend && npm run preview"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

cd ..

# Test Backend with Production Config
echo ""
echo "🔧 Testing Backend (production config)..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

# Check if gunicorn is installed
pip show gunicorn > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Installing gunicorn..."
    pip install gunicorn -q
fi

echo "Testing backend import and config..."
FLASK_ENV=production python -c "
from app import app
print('✅ Backend loads successfully!')
print(f'Debug mode: {app.debug}')
print(f'Testing mode: {app.testing}')
"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All production tests passed!"
    echo ""
    echo "🚀 Ready to deploy!"
    echo ""
    echo "Next steps:"
    echo "  1. Update frontend/.env.production with Railway URL"
    echo "  2. Update frontend/vite.config.js base path"
    echo "  3. Push to GitHub: git push origin main"
    echo "  4. Deploy backend to Railway"
    echo "  5. GitHub Actions will auto-deploy frontend"
    echo ""
    echo "See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Backend production test failed!"
    exit 1
fi

cd ..
