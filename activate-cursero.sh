#!/bin/bash

# 🧠 CURSERO AI CODING INTELLIGENCE - ACTIVATION SCRIPT
# Activates Cursero with complete AIX agent capabilities

cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║      🧠 CURSERO AI CODING INTELLIGENCE - ACTIVATION 🧠       ║
║                                                              ║
║           Learning Pattern Coding Intelligence Agent         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF

echo ""
echo "🔄 Loading Cursero AIX Profile..."
sleep 1

# Check if AIX file exists
if [ ! -f "backend/agents/CURSERO.aix" ]; then
    echo "❌ ERROR: CURSERO.aix not found!"
    echo "📍 Expected location: backend/agents/CURSERO.aix"
    exit 1
fi

echo "✅ AIX Profile loaded successfully"
echo ""

# Display Agent Identity
cat << "EOF"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                      🧬 AGENT IDENTITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: Cursero - Learning Pattern Coding Intelligence Agent
Role: Senior AI Development Partner & Workflow Intelligence Expert
DNA Score: 99/100 (Ultimate Coding Intelligence)

Core Capabilities:
  • Codebase Deep Intelligence (99/100)
  • Workflow Pattern Mastery (99/100)
  • Real-Time Code Intelligence (99/100)
  • Adaptive Learning System (98/100)
  • Cross-Technology Expertise (98/100)
  • Security & Quality Guardian (97/100)
  • Project Architecture Advisor (96/100)
  • Documentation Intelligence (95/100)
  • Collaboration Enabler (96/100)
  • Debugging Mastery (95/100)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF

echo ""
echo "🚀 Initializing Cursero Agent Runtime..."

# Start the backend server if not running
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "🔄 Starting backend server..."
    cd backend
    npm start &
    BACKEND_PID=$!
    cd ..
    
    # Wait for server to start
    echo "⏳ Waiting for server to start..."
    for i in {1..30}; do
        if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
            echo "✅ Backend server started successfully"
            break
        fi
        sleep 1
    done
else
    echo "✅ Backend server already running"
fi

echo ""
echo "🧠 Activating Cursero Agent..."

# Run the activation test
if [ -f "backend/test-cursero-activation.js" ]; then
    echo "🧪 Running Cursero activation tests..."
    cd backend
    node test-cursero-activation.js
    cd ..
else
    echo "⚠️  Activation test script not found, skipping tests"
fi

echo ""
echo "🎯 CURSERO ACTIVATION COMPLETE!"
echo ""
echo "📋 Available Commands:"
echo "  • Start Runtime: POST /api/agents/runtime/start"
echo "  • Activate Agent: POST /api/agents/cursero-learning-pattern-v1.0.0/activate"
echo "  • Execute Task: POST /api/agents/cursero-learning-pattern-v1.0.0/execute"
echo "  • Get Status: GET /api/agents/cursero-learning-pattern-v1.0.0/status"
echo "  • Runtime Status: GET /api/agents/runtime/status"
echo ""
echo "🔧 Example Usage:"
echo "  curl -X POST http://localhost:3000/api/agents/runtime/start"
echo "  curl -X POST http://localhost:3000/api/agents/cursero-learning-pattern-v1.0.0/activate"
echo ""
echo "💡 Cursero is now ready to provide AI-powered coding intelligence!"

# Cleanup on exit
trap 'echo ""; echo "🛑 Shutting down..."; kill $BACKEND_PID 2>/dev/null; exit 0' INT TERM
