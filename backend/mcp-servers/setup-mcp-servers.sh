#!/bin/bash

###############################################################################
# 🔌 MCP SERVERS SETUP SCRIPT
# Installs and configures all MCP servers for Maya Travel Agent
###############################################################################

echo "
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              🔌 MCP SERVERS SETUP                            ║
║        Model Context Protocol Integration                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed!"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Navigate to MCP servers directory
cd "$(dirname "$0")"

echo "📦 Setting up MCP Servers..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Setup Private Journal MCP
echo "1️⃣  Setting up Private Journal MCP..."
if [ -d "private-journal" ]; then
    cd private-journal
    
    if [ ! -d "node_modules" ]; then
        echo "   📦 Installing dependencies..."
        npm install --silent
    else
        echo "   ✅ Dependencies already installed"
    fi
    
    if [ ! -d "dist" ]; then
        echo "   🔨 Building TypeScript..."
        npm run build --silent
    else
        echo "   ✅ Build already complete"
    fi
    
    echo "   ✅ Private Journal MCP ready!"
    cd ..
else
    echo "   ⚠️  Private Journal directory not found"
fi

echo ""

# Setup Pattern Learning Journal
echo "2️⃣  Setting up Pattern Learning Journal..."
if [ -d "pattern-learning-journal" ]; then
    cd pattern-learning-journal
    
    if [ -f "package.json" ] && [ ! -d "node_modules" ]; then
        echo "   📦 Installing dependencies..."
        npm install --silent
    fi
    
    echo "   ✅ Pattern Learning Journal ready!"
    cd ..
else
    echo "   ℹ️  Pattern Learning Journal not configured yet"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test servers
echo "🧪 Testing MCP Servers..."
echo ""

if [ -f "private-journal/dist/index.js" ]; then
    echo "✅ Private Journal MCP: Ready"
    echo "   📍 Location: $(pwd)/private-journal/dist/index.js"
else
    echo "❌ Private Journal MCP: Build failed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "✅ MCP Servers setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Configure in your IDE (see MCP_INTEGRATION_GUIDE.md)"
echo "   2. Restart Claude/Cursor to load servers"
echo "   3. Use the journal tools in your AI conversations"
echo ""
echo "📚 Documentation:"
echo "   • MCP_INTEGRATION_GUIDE.md - Full integration guide"
echo "   • private-journal/README.md - Private journal docs"
echo ""
echo "🎯 Available tools:"
echo "   • process_thoughts - Journal insights and feelings"
echo "   • search_journal - Semantic search across entries"
echo "   • read_journal_entry - Read specific entries"
echo "   • list_recent_entries - Browse recent journal entries"
echo ""
