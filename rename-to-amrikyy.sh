#!/bin/bash

# Amrikyy Rebranding Script
# Renames all "Maya" references to "Amrikyy" throughout the project

set -e

echo "🔄 Starting Maya → Amrikyy Rebranding..."
echo ""

# Backup count
TOTAL_FILES=0

# Function to replace in files
replace_in_files() {
    local pattern=$1
    local replacement=$2
    local file_pattern=$3
    local exclude_dirs="node_modules|.git|frontend-backup|dist|build|coverage"
    
    echo "  Replacing '$pattern' → '$replacement' in $file_pattern files..."
    
    find . -type f -name "$file_pattern" \
        ! -path "*/node_modules/*" \
        ! -path "*/.git/*" \
        ! -path "*/frontend-backup*/*" \
        ! -path "*/dist/*" \
        ! -path "*/build/*" \
        ! -path "*/coverage/*" \
        -exec sed -i "s/$pattern/$replacement/g" {} + 2>/dev/null || true
}

# Phase 1: Backend JavaScript files
echo "📦 Phase 1: Backend Files"
replace_in_files "Maya Travel Agent" "Amrikyy Travel Agent" "*.js"
replace_in_files "Maya Trips" "Amrikyy Trips" "*.js"
replace_in_files "MayaTrips" "AmrikyyTrips" "*.js"
replace_in_files "mayaTrips" "amrikyyTrips" "*.js"
replace_in_files "maya-trips" "amrikyy-trips" "*.js"
replace_in_files "maya_trips" "amrikyy_trips" "*.js"
replace_in_files "mayaPersona" "amrikyyPersona" "*.js"
replace_in_files "MayaPersona" "AmrikyyPersona" "*.js"
replace_in_files "maya-travel-agent" "amrikyy-travel-agent" "*.js"
replace_in_files "maya_travel_agent" "amrikyy_travel_agent" "*.js"
echo "  ✅ Backend files updated"
echo ""

# Phase 2: Frontend TypeScript/React files
echo "⚛️  Phase 2: Frontend Files"
replace_in_files "Maya Travel Agent" "Amrikyy Travel Agent" "*.tsx"
replace_in_files "Maya Travel Agent" "Amrikyy Travel Agent" "*.ts"
replace_in_files "Maya Trips" "Amrikyy Trips" "*.tsx"
replace_in_files "Maya Trips" "Amrikyy Trips" "*.ts"
replace_in_files "MayaTrips" "AmrikyyTrips" "*.tsx"
replace_in_files "MayaTrips" "AmrikyyTrips" "*.ts"
replace_in_files "mayaTrips" "amrikyyTrips" "*.tsx"
replace_in_files "mayaTrips" "amrikyyTrips" "*.ts"
replace_in_files "maya-travel-agent" "amrikyy-travel-agent" "*.tsx"
replace_in_files "maya-travel-agent" "amrikyy-travel-agent" "*.ts"
echo "  ✅ Frontend files updated"
echo ""

# Phase 3: Documentation files
echo "📚 Phase 3: Documentation Files"
replace_in_files "Maya Travel Agent" "Amrikyy Travel Agent" "*.md"
replace_in_files "Maya Trips" "Amrikyy Trips" "*.md"
replace_in_files "maya-travel-agent" "amrikyy-travel-agent" "*.md"
replace_in_files "MayaTravelAgent" "AmrikyyTravelAgent" "*.md"
echo "  ✅ Documentation updated"
echo ""

# Phase 4: Configuration files
echo "⚙️  Phase 4: Configuration Files"
replace_in_files "maya-travel-agent" "amrikyy-travel-agent" "package.json"
replace_in_files "Maya Travel Agent" "Amrikyy Travel Agent" "package.json"
replace_in_files "maya-travel-agent" "amrikyy-travel-agent" "*.json"
echo "  ✅ Configuration files updated"
echo ""

# Phase 5: HTML files
echo "🌐 Phase 5: HTML Files"
replace_in_files "Maya Travel Agent" "Amrikyy Travel Agent" "*.html"
replace_in_files "Maya Trips" "Amrikyy Trips" "*.html"
echo "  ✅ HTML files updated"
echo ""

# Phase 6: Rename specific files
echo "📝 Phase 6: Renaming Files"
if [ -f "backend/src/ai/mayaPersona.js" ]; then
    mv backend/src/ai/mayaPersona.js backend/src/ai/amrikyyPersona.js
    echo "  ✅ Renamed mayaPersona.js → amrikyyPersona.js"
fi

if [ -d "ios/MayaTravelApp" ]; then
    mv ios/MayaTravelApp ios/AmrikyyTravelApp
    echo "  ✅ Renamed MayaTravelApp → AmrikyyTravelApp"
fi

if [ -d "MayaTravelAgent" ]; then
    mv MayaTravelAgent AmrikyyTravelAgent
    echo "  ✅ Renamed MayaTravelAgent → AmrikyyTravelAgent"
fi
echo ""

# Phase 7: Update imports after file renames
echo "🔗 Phase 7: Updating Imports"
find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.tsx" \) \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/frontend-backup*/*" \
    -exec sed -i "s/mayaPersona/amrikyyPersona/g" {} + 2>/dev/null || true
echo "  ✅ Import statements updated"
echo ""

echo "✅ Rebranding Complete!"
echo ""
echo "📊 Summary:"
echo "  - Backend files: Updated"
echo "  - Frontend files: Updated"
echo "  - Documentation: Updated"
echo "  - Configuration: Updated"
echo "  - File renames: Complete"
echo ""
echo "⚠️  Next Steps:"
echo "  1. Review changes: git diff"
echo "  2. Test the application"
echo "  3. Update environment variables if needed"
echo "  4. Commit changes: git add . && git commit -m 'feat: Rebrand Maya to Amrikyy'"
echo ""
