#!/bin/bash

# Run Database Migrations
# This script helps you run migrations in the correct order

set -e  # Exit on error

echo "🚀 Amrikyy Database Migrations"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Supabase URL is set
if [ -z "$SUPABASE_URL" ]; then
    echo -e "${RED}❌ Error: SUPABASE_URL not set${NC}"
    echo "Please set your Supabase URL:"
    echo "export SUPABASE_URL='https://driujancggfxgdsuyaih.supabase.co'"
    exit 1
fi

# Check if Supabase Service Role Key is set
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ Error: SUPABASE_SERVICE_ROLE_KEY not set${NC}"
    echo "Please set your Supabase Service Role Key"
    exit 1
fi

echo -e "${YELLOW}📋 Available Migrations:${NC}"
echo ""
ls -1 *.sql | grep -v rollback | sort
echo ""

# Ask user which migrations to run
echo -e "${YELLOW}Which migrations do you want to run?${NC}"
echo "1) Run all migrations"
echo "2) Run specific migration"
echo "3) Exit"
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}Running all migrations...${NC}"
        for file in $(ls *.sql | grep -v rollback | sort); do
            echo ""
            echo -e "${YELLOW}📄 Running: $file${NC}"
            # Here you would use Supabase CLI or psql
            # For now, just show the file
            echo "To run this migration, copy the contents to Supabase SQL Editor:"
            echo "File: migrations/$file"
        done
        ;;
    2)
        read -p "Enter migration number (e.g., 001): " num
        file="${num}_*.sql"
        if [ -f $file ]; then
            echo ""
            echo -e "${GREEN}Running migration: $file${NC}"
            echo "To run this migration, copy the contents to Supabase SQL Editor:"
            echo "File: migrations/$file"
        else
            echo -e "${RED}❌ Migration not found: $file${NC}"
        fi
        ;;
    3)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Migration instructions displayed${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Go to: https://supabase.com/dashboard/project/driujancggfxgdsuyaih/sql"
echo "2. Copy the SQL from the migration file"
echo "3. Paste into SQL Editor"
echo "4. Click 'Run'"
echo "5. Verify success message"
echo ""
