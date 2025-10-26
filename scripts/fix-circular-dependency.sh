#!/bin/bash
# Fix Circular Dependency - React Error #185
# This script updates all context imports to use the centralized AppContexts file

echo "🔧 Fixing React Error #185 - Circular Dependency Issue"
echo "======================================================"
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend/src" || exit 1

echo "📁 Working directory: $(pwd)"
echo ""

# Count total files to process
TOTAL_FILES=$(find . -name "*.tsx" -o -name "*.ts" | grep -v "App.tsx" | grep -v "AppContexts.tsx" | wc -l | tr -d ' ')
echo "📊 Found $TOTAL_FILES TypeScript files to check"
echo ""

FIXED_COUNT=0

# Function to fix imports in a file
fix_imports() {
    local file="$1"
    local relative_path=$(echo "$file" | sed 's|^\./||')
    
    # Check if file imports from App
    if grep -q "from.*App['\"]" "$file" 2>/dev/null; then
        echo "✏️  Fixing: $relative_path"
        
        # Calculate relative path to AppContexts based on file location
        local dir_depth=$(echo "$relative_path" | grep -o "/" | wc -l)
        local context_path=""
        
        if [[ "$relative_path" == components/* ]]; then
            context_path="@/contexts/AppContexts"
        elif [[ "$relative_path" == components/agents/* ]]; then
            context_path="@/contexts/AppContexts"
        else
            context_path="@/contexts/AppContexts"
        fi
        
        # Create backup
        cp "$file" "$file.bak"
        
        # Fix the imports
        sed -i.tmp "s|from ['\"]\.\.\/App['\"]|from '$context_path'|g" "$file"
        sed -i.tmp "s|from ['\"]\.\.\/\.\.\/App['\"]|from '$context_path'|g" "$file"
        sed -i.tmp "s|from ['\"]@/App['\"]|from '$context_path'|g" "$file"
        
        # Remove temp file
        rm -f "$file.tmp"
        
        FIXED_COUNT=$((FIXED_COUNT + 1))
    fi
}

# Process all TypeScript files
echo "🔍 Scanning and fixing files..."
echo ""

find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -name "App.tsx" ! -name "AppContexts.tsx" | while read -r file; do
    fix_imports "$file"
done

echo ""
echo "======================================================"
echo "✅ Fixed $FIXED_COUNT files"
echo ""

if [ $FIXED_COUNT -gt 0 ]; then
    echo "📝 Changes made:"
    echo "   - Updated imports from '../App' to '@/contexts/AppContexts'"
    echo "   - Updated imports from '../../App' to '@/contexts/AppContexts'"
    echo ""
    echo "⚠️  Backup files created with .bak extension"
    echo ""
    echo "🧪 Next steps:"
    echo "   1. Review changes: git diff frontend/src"
    echo "   2. Test locally: cd frontend && npm run build"
    echo "   3. If successful: rm frontend/src/**/*.bak"
    echo "   4. Commit: git add . && git commit -m 'fix: resolve circular dependency (React error #185)'"
    echo "   5. Deploy: git push origin main"
else
    echo "ℹ️  No files needed fixing"
fi

echo ""
echo "🎯 Done!"
