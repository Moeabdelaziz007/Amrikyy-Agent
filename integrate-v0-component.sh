#!/bin/bash

###############################################################################
# V0 Component Integration CLI
# CURSERO AI - Integration Engineer
# DNA Score: 99.2/100
###############################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Component categories
CATEGORIES=(
  "auth"
  "chat"
  "dashboard"
  "layout"
  "ui"
  "data"
  "telegram"
  "other"
)

###############################################################################
# Helper Functions
###############################################################################

print_header() {
  echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║${NC}    ${GREEN}V0 Component Integration CLI${NC}                          ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}    CURSERO AI - Integration Engineer                     ${BLUE}║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_step() {
  echo -e "${GREEN}▶${NC} $1"
}

print_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
  echo -e "${RED}✖${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

###############################################################################
# Main Functions
###############################################################################

# Show usage
show_usage() {
  echo "Usage: ./integrate-v0-component.sh [COMMAND] [OPTIONS]"
  echo ""
  echo "Commands:"
  echo "  new <name> <category>    Create new component from template"
  echo "  list                     List all integrated components"
  echo "  sync                     Sync components from V0 repository"
  echo "  analyze <file>           Analyze V0 component file"
  echo "  install-deps <file>      Install dependencies from V0 component"
  echo "  help                     Show this help message"
  echo ""
  echo "Categories:"
  echo "  auth, chat, dashboard, layout, ui, data, telegram, other"
  echo ""
  echo "Examples:"
  echo "  ./integrate-v0-component.sh new LoginForm auth"
  echo "  ./integrate-v0-component.sh analyze /tmp/v0-ui/LoginForm.tsx"
  echo "  ./integrate-v0-component.sh sync"
}

# Create new component from template
create_component() {
  local component_name=$1
  local category=$2
  
  if [ -z "$component_name" ] || [ -z "$category" ]; then
    print_error "Component name and category are required"
    show_usage
    exit 1
  fi
  
  # Validate category
  if [[ ! " ${CATEGORIES[@]} " =~ " ${category} " ]]; then
    print_error "Invalid category: $category"
    echo "Valid categories: ${CATEGORIES[*]}"
    exit 1
  fi
  
  print_step "Creating component: $component_name in category: $category"
  
  # Create directory if not exists
  local target_dir="frontend/src/components/$category"
  mkdir -p "$target_dir"
  
  # Component file path
  local component_file="$target_dir/${component_name}.tsx"
  
  # Check if file already exists
  if [ -f "$component_file" ]; then
    print_warning "Component already exists: $component_file"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      print_info "Cancelled"
      exit 0
    fi
  fi
  
  # Copy template
  print_step "Copying template..."
  cp frontend/src/templates/Component.template.tsx "$component_file"
  
  # Replace placeholders
  print_step "Customizing template..."
  sed -i.bak "s/ComponentName/${component_name}/g" "$component_file"
  sed -i.bak "s/\[Date\]/$(date +%Y-%m-%d)/g" "$component_file"
  sed -i.bak "s/\[ComponentName\]/${component_name}/g" "$component_file"
  sed -i.bak "s/\[Brief description.*\]/Component for ${category}/g" "$component_file"
  rm "${component_file}.bak"
  
  # Create barrel export
  local index_file="$target_dir/index.ts"
  if [ -f "$index_file" ]; then
    # Add to existing index
    echo "export { ${component_name} } from './${component_name}';" >> "$index_file"
  else
    # Create new index
    echo "export { ${component_name} } from './${component_name}';" > "$index_file"
  fi
  
  # Create types file
  local types_file="frontend/src/types/${category}.types.ts"
  if [ ! -f "$types_file" ]; then
    print_step "Creating types file..."
    mkdir -p "frontend/src/types"
    cat > "$types_file" << EOF
/**
 * Type definitions for ${category} components
 * @author CURSERO AI
 * @created $(date +%Y-%m-%d)
 */

// Add your types here
export interface ${component_name}Props {
  // Define props
}
EOF
  fi
  
  print_success "Component created successfully!"
  print_info "Location: $component_file"
  print_info "Types: $types_file"
  print_info "Export: $index_file"
  
  echo ""
  print_info "Next steps:"
  echo "  1. Edit $component_file"
  echo "  2. Add backend integration in frontend/src/api/${category}.service.ts"
  echo "  3. Create custom hook in frontend/src/hooks/use-${component_name,,}.ts"
  echo "  4. Write tests in $target_dir/__tests__/${component_name}.test.tsx"
  echo "  5. Update V0_COMPONENTS_INVENTORY.md"
}

# List all integrated components
list_components() {
  print_step "Listing all integrated components..."
  echo ""
  
  for category in "${CATEGORIES[@]}"; do
    local dir="frontend/src/components/$category"
    if [ -d "$dir" ]; then
      local count=$(find "$dir" -name "*.tsx" -type f | wc -l)
      if [ "$count" -gt 0 ]; then
        echo -e "${GREEN}📁 $category${NC} ($count components)"
        find "$dir" -name "*.tsx" -type f | while read file; do
          local basename=$(basename "$file" .tsx)
          echo "   ├─ $basename"
        done
      fi
    fi
  done
  
  echo ""
  local total=$(find frontend/src/components -name "*.tsx" -type f | wc -l)
  print_success "Total components: $total"
}

# Sync from V0 repository
sync_v0_repo() {
  print_step "Syncing from V0 repository..."
  
  local v0_repo="https://github.com/Moeabdelaziz007/v0-ui-AmrikyAIOS.git"
  local v0_dir="/tmp/v0-ui-AmrikyAIOS"
  
  # Clone or pull
  if [ -d "$v0_dir" ]; then
    print_info "Repository exists, pulling latest..."
    cd "$v0_dir" && git pull
  else
    print_info "Cloning repository..."
    git clone "$v0_repo" "$v0_dir"
  fi
  
  # List components
  print_step "Analyzing components..."
  cd "$v0_dir"
  
  local components=$(find . -name "*.tsx" -type f | grep -v node_modules)
  local count=$(echo "$components" | wc -l)
  
  print_success "Found $count components in V0 repository"
  echo ""
  echo "$components"
  echo ""
  
  print_info "Components listed. Update V0_CURRENT_COMPONENTS_REFERENCE.md manually."
  print_info "Use 'analyze' command to inspect each component."
}

# Analyze V0 component
analyze_component() {
  local file=$1
  
  if [ -z "$file" ]; then
    print_error "File path required"
    show_usage
    exit 1
  fi
  
  if [ ! -f "$file" ]; then
    print_error "File not found: $file"
    exit 1
  fi
  
  print_step "Analyzing component: $(basename $file)"
  echo ""
  
  # Extract imports
  print_info "Dependencies:"
  grep "^import" "$file" | sed 's/import.*from ["\x27]\(.*\)["\x27].*/  \1/' | sort | uniq
  echo ""
  
  # Extract component name
  print_info "Component name:"
  grep -E "export (default )?(function|const)" "$file" | head -1
  echo ""
  
  # Extract props
  print_info "Props interface:"
  sed -n '/interface.*Props/,/^}/p' "$file" | head -20
  echo ""
  
  # Check for hooks
  print_info "React hooks used:"
  grep -oE "use[A-Z][a-zA-Z]*" "$file" | sort | uniq
  echo ""
  
  # Check for API calls
  print_info "API calls detected:"
  grep -E "(fetch|axios|api)" "$file" || echo "  None detected"
  echo ""
  
  # Line count
  local lines=$(wc -l < "$file")
  print_info "Lines of code: $lines"
}

# Install dependencies from component
install_dependencies() {
  local file=$1
  
  if [ -z "$file" ]; then
    print_error "File path required"
    exit 1
  fi
  
  if [ ! -f "$file" ]; then
    print_error "File not found: $file"
    exit 1
  fi
  
  print_step "Extracting dependencies from: $(basename $file)"
  
  # Extract external dependencies (not relative imports)
  local deps=$(grep "^import" "$file" | \
    sed -n 's/.*from ["\x27]\([^.\/].*\)["\x27].*/\1/p' | \
    sed 's/\/.*//g' | \
    sort | uniq)
  
  if [ -z "$deps" ]; then
    print_info "No external dependencies found"
    exit 0
  fi
  
  echo ""
  print_info "Found dependencies:"
  echo "$deps" | while read dep; do
    echo "  - $dep"
  done
  echo ""
  
  read -p "Install these dependencies? (y/N): " -n 1 -r
  echo
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd frontend
    print_step "Installing dependencies..."
    echo "$deps" | xargs npm install
    print_success "Dependencies installed!"
  else
    print_info "Cancelled"
  fi
}

###############################################################################
# Main Script
###############################################################################

print_header

# Parse command
COMMAND=${1:-help}

case $COMMAND in
  new)
    create_component "$2" "$3"
    ;;
  list)
    list_components
    ;;
  sync)
    sync_v0_repo
    ;;
  analyze)
    analyze_component "$2"
    ;;
  install-deps)
    install_dependencies "$2"
    ;;
  help|--help|-h)
    show_usage
    ;;
  *)
    print_error "Unknown command: $COMMAND"
    show_usage
    exit 1
    ;;
esac

echo ""
print_success "Done! 🚀"
