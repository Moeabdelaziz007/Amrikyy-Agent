#!/bin/bash

###############################################################################
# V0 Component Integration CLI
# CURSERO AI - Integration Engineer
# DNA Score: 99.2/100
###############################################################################

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

CATEGORIES=("auth" "chat" "dashboard" "layout" "ui" "data" "telegram" "other")

print_header() {
  echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║${NC}    ${GREEN}V0 Component Integration CLI${NC}                          ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}    CURSERO AI - Integration Engineer                     ${BLUE}║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_error() { echo -e "${RED}✖${NC} $1"; }

show_usage() {
  echo "Usage: ./integrate-v0-component.sh [COMMAND] [OPTIONS]"
  echo ""
  echo "Commands:"
  echo "  new <name> <category>    Create new component"
  echo "  list                     List all components"
  echo "  sync                     Sync from V0 repository"
  echo "  help                     Show this help"
  echo ""
  echo "Categories: auth, chat, dashboard, layout, ui, data, telegram"
}

create_component() {
  local name=$1
  local category=$2
  
  if [ -z "$name" ] || [ -z "$category" ]; then
    print_error "Name and category required"
    show_usage
    exit 1
  fi
  
  local dir="frontend/src/components/$category"
  mkdir -p "$dir"
  
  local file="$dir/${name}.tsx"
  
  if [ -f "$file" ]; then
    print_error "Component exists: $file"
    exit 1
  fi
  
  cp frontend/src/templates/Component.template.tsx "$file"
  sed -i.bak "s/ComponentName/${name}/g" "$file"
  sed -i.bak "s/\[Date\]/$(date +%Y-%m-%d)/g" "$file"
  rm -f "${file}.bak"
  
  echo "export { ${name} } from './${name}';" >> "$dir/index.ts"
  
  print_success "Component created: $file"
}

list_components() {
  print_info "Listing components..."
  for cat in "${CATEGORIES[@]}"; do
    local dir="frontend/src/components/$cat"
    if [ -d "$dir" ]; then
      local count=$(find "$dir" -name "*.tsx" 2>/dev/null | wc -l)
      if [ "$count" -gt 0 ]; then
        echo -e "${GREEN}📁 $cat${NC} ($count)"
        find "$dir" -name "*.tsx" 2>/dev/null | while read f; do
          echo "   ├─ $(basename $f .tsx)"
        done
      fi
    fi
  done
}

sync_v0() {
  print_info "Syncing V0 repository..."
  local repo="https://github.com/Moeabdelaziz007/v0-ui-AmrikyAIOS.git"
  local dir="/tmp/v0-ui"
  
  if [ -d "$dir" ]; then
    cd "$dir" && git pull
  else
    git clone "$repo" "$dir"
  fi
  
  print_success "V0 repository synced to $dir"
  find "$dir" -name "*.tsx" | grep -v node_modules
}

print_header

case ${1:-help} in
  new) create_component "$2" "$3" ;;
  list) list_components ;;
  sync) sync_v0 ;;
  *) show_usage ;;
esac

echo ""
print_success "Done! 🚀"
