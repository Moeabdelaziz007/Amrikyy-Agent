#!/bin/bash

# Travel APIs Setup Wizard
# Interactive script to configure travel API keys

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}${BOLD}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║     🚀 Travel APIs Setup Wizard                       ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if .env exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
    read -p "Do you want to update it? (y/n): " UPDATE_ENV
    if [ "$UPDATE_ENV" != "y" ]; then
        echo -e "${RED}Setup cancelled${NC}"
        exit 0
    fi
else
    echo -e "${GREEN}Creating new .env file...${NC}"
    cp .env.template .env
fi

echo ""
echo -e "${CYAN}This wizard will help you configure the required travel APIs.${NC}"
echo -e "${CYAN}You'll need API keys from:${NC}"
echo -e "  1. Kiwi Tequila (Flights)"
echo -e "  2. Booking.com (Hotels)"
echo -e "  3. Mapbox (Maps & Geocoding)"
echo ""

# Function to update .env file
update_env() {
    local key=$1
    local value=$2
    
    if grep -q "^${key}=" .env; then
        # Key exists, update it
        sed -i "s|^${key}=.*|${key}=${value}|" .env
    else
        # Key doesn't exist, append it
        echo "${key}=${value}" >> .env
    fi
}

# Kiwi Tequila API
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}1. Kiwi Tequila API (Flights)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Setup Instructions:${NC}"
echo "  1. Visit: https://tequila.kiwi.com/portal/login"
echo "  2. Sign up for a developer account"
echo "  3. Navigate to 'API Keys' section"
echo "  4. Create a new API key"
echo ""
read -p "Enter your Kiwi API Key (or press Enter to skip): " KIWI_KEY

if [ ! -z "$KIWI_KEY" ]; then
    update_env "KIWI_API_KEY" "$KIWI_KEY"
    echo -e "${GREEN}✅ Kiwi API key saved${NC}"
else
    echo -e "${YELLOW}⚠️  Skipped Kiwi API key${NC}"
fi

echo ""

# Booking.com Affiliate API
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}2. Booking.com Affiliate API (Hotels)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Setup Instructions:${NC}"
echo "  1. Visit: https://www.booking.com/affiliate-program"
echo "  2. Apply for affiliate partnership"
echo "  3. Wait for approval (usually 1-3 days)"
echo "  4. Get your Affiliate ID from Partner Hub"
echo ""
read -p "Enter your Booking.com Affiliate ID (or press Enter to skip): " BOOKING_ID

if [ ! -z "$BOOKING_ID" ]; then
    update_env "BOOKING_COM_AFFILIATE_ID" "$BOOKING_ID"
    echo -e "${GREEN}✅ Booking.com Affiliate ID saved${NC}"
    
    read -p "Enter your Booking.com API Key (optional, press Enter to skip): " BOOKING_KEY
    if [ ! -z "$BOOKING_KEY" ]; then
        update_env "BOOKING_COM_API_KEY" "$BOOKING_KEY"
        echo -e "${GREEN}✅ Booking.com API key saved${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipped Booking.com credentials${NC}"
fi

echo ""

# Mapbox API
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}3. Mapbox API (Maps & Geocoding)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Setup Instructions:${NC}"
echo "  1. Visit: https://account.mapbox.com"
echo "  2. Sign up for a free account"
echo "  3. Navigate to 'Access Tokens'"
echo "  4. Copy your default public token"
echo ""
read -p "Enter your Mapbox API Key (or press Enter to skip): " MAPBOX_KEY

if [ ! -z "$MAPBOX_KEY" ]; then
    update_env "MAPBOX_API_KEY" "$MAPBOX_KEY"
    echo -e "${GREEN}✅ Mapbox API key saved${NC}"
else
    echo -e "${YELLOW}⚠️  Skipped Mapbox API key${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Validate APIs
echo -e "${CYAN}Would you like to validate the API keys now?${NC}"
read -p "(y/n): " VALIDATE

if [ "$VALIDATE" = "y" ]; then
    echo ""
    echo -e "${CYAN}Running API validation...${NC}"
    echo ""
    node scripts/validate-travel-apis.js
    VALIDATION_RESULT=$?
    
    if [ $VALIDATION_RESULT -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ All APIs validated successfully!${NC}"
        echo -e "${GREEN}You're ready to start the server.${NC}"
    else
        echo ""
        echo -e "${YELLOW}⚠️  Some APIs failed validation.${NC}"
        echo -e "${CYAN}Check the output above for details.${NC}"
    fi
else
    echo -e "${CYAN}You can validate APIs later with:${NC}"
    echo -e "  ${YELLOW}npm run validate-travel-apis${NC}"
fi

echo ""
echo -e "${CYAN}Next Steps:${NC}"
echo "  1. Review your .env file"
echo "  2. Start the server: ${YELLOW}npm start${NC}"
echo "  3. Check API documentation: ${YELLOW}TRAVEL_APIS_SETUP_GUIDE.md${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
