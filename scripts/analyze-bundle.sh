#!/bin/bash

# Bundle Analysis Script
# Analyzes frontend bundle size and suggests optimizations

echo "📊 Analyzing Frontend Bundle..."
echo ""

cd frontend

# Build with analysis
echo "🏗️  Building production bundle..."
npm run build 2>&1 | tee build-output.txt

echo ""
echo "================================================"
echo "📦 Bundle Size Analysis"
echo "================================================"
echo ""

# Extract sizes from build output
if [ -f "dist/stats.html" ]; then
  echo "✅ Detailed analysis available at: frontend/dist/stats.html"
  echo "   Open in browser to see visual breakdown"
  echo ""
fi

# Calculate total dist size
if [ -d "dist" ]; then
  TOTAL_SIZE=$(du -sh dist | cut -f1)
  JS_SIZE=$(du -sh dist/assets/*.js 2>/dev/null | awk '{sum+=$1}END{print sum "K"}')
  CSS_SIZE=$(du -sh dist/assets/*.css 2>/dev/null | awk '{sum+=$1}END{print sum "K"}')
  
  echo "📏 Size Breakdown:"
  echo "  - Total: $TOTAL_SIZE"
  echo "  - JavaScript: $JS_SIZE"
  echo "  - CSS: $CSS_SIZE"
  echo ""
fi

# Check for large chunks
echo "🔍 Largest JavaScript Chunks:"
find dist/assets -name "*.js" -type f -exec du -h {} + | sort -rh | head -10

echo ""
echo "💡 Optimization Tips:"
echo ""

# Check bundle size thresholds
if [ -f "dist/assets/index*.js" ]; then
  INDEX_SIZE=$(du -k dist/assets/index*.js | cut -f1)
  if [ $INDEX_SIZE -gt 500 ]; then
    echo "  ⚠️  Main bundle is large (${INDEX_SIZE}K)"
    echo "     Consider: lazy loading routes, code splitting"
  fi
fi

echo "  1. Enable gzip/brotli compression on server"
echo "  2. Use CDN for static assets"
echo "  3. Implement lazy loading for heavy components"
echo "  4. Use dynamic imports for routes"
echo "  5. Remove unused dependencies with 'npm prune'"
echo ""

# Suggest dependency optimizations
echo "📚 Large Dependencies (consider alternatives):"
echo "  - @radix-ui (heavy) → Consider headlessUI or custom components"
echo "  - framer-motion (heavy) → Use only what you need"
echo "  - date-fns → Use date-fns-tz for timezone support only"
echo ""

cd ..

