#!/bin/bash

# Start Frontend Dev Server Script

echo "🚀 Starting EPTC Heatmap Frontend..."

cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start dev server
echo "✅ Starting Vite dev server on http://localhost:5173"
echo ""
echo "Open your browser and navigate to:"
echo "  Dashboard: http://localhost:5173"
echo "  Admin:     http://localhost:5173/admin.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
