#!/usr/bin/env bash
set -euo pipefail

# Amrikyy Agent - Codebase Indexing Script
# Builds JSON index and ctags for fast code navigation

# Output directory
OUT_DIR=".gitpod/.index"
mkdir -p "$OUT_DIR"

echo "🔍 [Amrikyy] Building codebase index..."

# Supported file extensions
EXTS="js,ts,json,py,go,java,jsx,tsx,md,html,css,yml,yaml,sh"

# Find files (ignore node_modules, .git, dist, build, uploads)
echo "📁 [Amrikyy] Scanning files..."
FILES_LIST=$(rg --hidden --files \
  --glob '!node_modules' \
  --glob '!.git' \
  --glob '!dist' \
  --glob '!build' \
  --glob '!uploads' \
  --glob '!.next' \
  --glob '!.venv' \
  --iglob "*.{${EXTS}}" || true)

# Count files
FILE_COUNT=$(echo "$FILES_LIST" | grep -c . || echo "0")
echo "📊 [Amrikyy] Found $FILE_COUNT files to index"

# Create JSON array of {path, content}
INDEX_JSON="$OUT_DIR/index.json"
echo "[" > "$INDEX_JSON"
first=true
count=0

while IFS= read -r f; do
  if [ -z "$f" ]; then
    continue
  fi
  
  # Show progress every 100 files
  count=$((count + 1))
  if [ $((count % 100)) -eq 0 ]; then
    echo "⏳ [Amrikyy] Processed $count/$FILE_COUNT files..."
  fi
  
  # Escape content for JSON (use python for safety)
  CONTENT=$(python3 - <<PY
import json, sys
try:
    with open('$f', 'r', encoding='utf-8', errors='ignore') as file:
        content = file.read()
    print(json.dumps(content))
except Exception as e:
    print(json.dumps(f"Error reading file: {str(e)}"))
PY
)
  
  PATH_JSON=$(python3 -c "import json; print(json.dumps('$f'))")
  
  if [ "$first" = true ]; then
    echo "  {\"path\": $PATH_JSON, \"content\": $CONTENT}" >> "$INDEX_JSON"
    first=false
  else
    echo "  ,{\"path\": $PATH_JSON, \"content\": $CONTENT}" >> "$INDEX_JSON"
  fi
done <<< "$FILES_LIST"

echo "]" >> "$INDEX_JSON"

echo "✅ [Amrikyy] JSON index created: $INDEX_JSON"

# Generate ctags for editor navigation
echo "🏷️  [Amrikyy] Generating ctags..."
CTAGS_FILE="$OUT_DIR/tags"
ctags -R \
  --languages=JavaScript,TypeScript,Python,Go,Java \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=build \
  --exclude=uploads \
  --fields=+l \
  -f "$CTAGS_FILE" \
  backend/ frontend/ || true

echo "✅ [Amrikyy] Ctags generated: $CTAGS_FILE"

# Create simple file list for ripgrep
echo "📝 [Amrikyy] Creating file list..."
rg --hidden --files \
  --glob '!node_modules' \
  --glob '!.git' \
  --glob '!dist' \
  --glob '!build' \
  --glob '!uploads' \
  > "$OUT_DIR/file-list.txt" || true

echo "✅ [Amrikyy] File list created: $OUT_DIR/file-list.txt"

# Show statistics
if command -v jq &> /dev/null; then
  INDEXED_COUNT=$(jq length "$INDEX_JSON" 2>/dev/null || echo "N/A")
  echo "📊 [Amrikyy] Indexed files: $INDEXED_COUNT"
fi

# Create metadata file
cat > "$OUT_DIR/metadata.json" <<EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "fileCount": $FILE_COUNT,
  "indexPath": "$INDEX_JSON",
  "tagsPath": "$CTAGS_FILE",
  "fileListPath": "$OUT_DIR/file-list.txt",
  "project": "Amrikyy-Agent",
  "version": "2.0.0"
}
EOF

echo "✅ [Amrikyy] Metadata saved: $OUT_DIR/metadata.json"

# Summary
echo ""
echo "🎉 [Amrikyy] Indexing complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 Files indexed: $FILE_COUNT"
echo "📄 JSON index: $INDEX_JSON"
echo "🏷️  Ctags file: $CTAGS_FILE"
echo "📝 File list: $OUT_DIR/file-list.txt"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
