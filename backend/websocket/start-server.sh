#!/bin/bash
# Start WebSocket Server (Mac-Compatible - No Docker!)

echo "🚀 Starting Amrikyy WebSocket Server..."
echo ""

# Check Node.js version
NODE_VERSION=$(node --version)
echo "✅ Node.js: $NODE_VERSION"

# Check if dependencies installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Set environment variables
export WS_PORT=8080
export JWT_SECRET=${JWT_SECRET:-"dev-secret-change-in-production"}
export NODE_ENV=${NODE_ENV:-"development"}

echo ""
echo "🌐 WebSocket Server Configuration:"
echo "   Port: $WS_PORT"
echo "   Environment: $NODE_ENV"
echo "   Endpoints:"
echo "     - ws://localhost:$WS_PORT/ws?token=YOUR_JWT"
echo "     - http://localhost:$WS_PORT/healthz"
echo "     - http://localhost:$WS_PORT/metrics"
echo ""

# Start server
echo "🎬 Starting server..."
npm run dev

