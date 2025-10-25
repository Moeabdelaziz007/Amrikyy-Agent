#!/bin/bash

# Fix all component imports to use AppContexts instead of App

echo "🔧 Fixing React Error #185 - Updating component imports..."

# Array of files to fix
files=(
  "components/MiniAgentsHub.tsx"
  "components/AgentCard.tsx"
  "components/AgentInterface.tsx"
  "components/TaskHistory.tsx"
  "components/ThemeSelector.tsx"
  "components/agents/NavigatorAgentUI.tsx"
  "components/agents/VisionAgentUI.tsx"
  "components/agents/ResearchAgentUI.tsx"
  "components/agents/TranslatorAgentUI.tsx"
  "components/agents/SchedulerAgentUI.tsx"
  "components/agents/StorageAgentUI.tsx"
  "components/agents/MediaAgentUI.tsx"
  "components/agents/CommunicatorAgentUI.tsx"
  "components/agents/CodingAgentUI.tsx"
  "components/agents/MarketingAgentUI.tsx"
)

fixed=0
skipped=0

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  Fixing: $file"
    # Replace '../App' with '@/contexts/AppContexts'
    sed -i '' "s|from '../App'|from '@/contexts/AppContexts'|g" "$file"
    # Replace '../../App' with '@/contexts/AppContexts'
    sed -i '' "s|from '../../App'|from '@/contexts/AppContexts'|g" "$file"
    ((fixed++))
  else
    echo "  ❌ Not found: $file"
    ((skipped++))
  fi
done

echo ""
echo "✅ Fixed: $fixed files"
echo "❌ Skipped: $skipped files"
echo ""

if [ $fixed -gt 0 ]; then
  echo "🎉 Import fix complete!"
  echo "Next steps:"
  echo "  1. git add ."
  echo "  2. git commit -m \"fix: update all component imports to use AppContexts\""
  echo "  3. git push origin main"
else
  echo "⚠️ No files were fixed. Check the file paths."
fi
