#!/bin/bash

# Fix Continue SQLite Index Error

echo "🔧 Fixing Continue index database..."

# Remove corrupted index if it exists
rm -rf ~/.continue/index 2>/dev/null
rm -rf ~/.cursor/index 2>/dev/null

# Create fresh directories
mkdir -p ~/.continue/index
mkdir -p ~/.cursor/index

echo "✅ Index directories reset!"
echo ""
echo "📝 Next steps:"
echo "1. Restart VS Code/Cursor"
echo "2. Open Continue sidebar"
echo "3. Continue will rebuild the index automatically"
echo ""
echo "The 'no such table: chunks' error should be gone!"
