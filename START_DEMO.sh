#!/bin/bash

echo "🚀 Starting AMRIKYY AI OS Desktop Demo..."
echo ""
echo "📁 Project: Amrikyy AI OS"
echo "🪟 Component: Window Manager"
echo "✨ Features: Glassmorphism + Framer Motion"
echo ""
echo "Opening desktop at: http://localhost:5173/desktop"
echo ""

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Start dev server
echo "🔥 Starting development server..."
npm run dev
