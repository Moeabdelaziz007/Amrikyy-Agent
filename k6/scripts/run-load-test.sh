#!/bin/bash

###############################################################################
# Amadeus Flight API Load Test Runner
# 
# Automates load testing with proper environment setup and result collection
#
# Usage:
#   ./k6/scripts/run-load-test.sh [profile]
#
# Profiles: smoke, default, stress, spike, soak
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROFILE=${1:-default}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
K6_DIR="$PROJECT_ROOT/k6"
OUTPUT_DIR="$PROJECT_ROOT/test-outputs"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Amadeus Flight API Load Test Runner                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}✗ k6 is not installed!${NC}"
    echo ""
    echo "Install k6:"
    echo "  macOS:   brew install k6"
    echo "  Linux:   sudo apt-get install k6"
    echo "  Windows: choco install k6"
    echo ""
    echo "Or download from: https://k6.io/docs/getting-started/installation"
    exit 1
fi

echo -e "${GREEN}✓ k6 installed: $(k6 version)${NC}"

# Check if backend is running
echo -e "${YELLOW}⚙  Checking backend availability...${NC}"
BACKEND_URL="${BASE_URL:-http://localhost:5000}"

if curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running at $BACKEND_URL${NC}"
else
    echo -e "${RED}✗ Backend is not reachable at $BACKEND_URL${NC}"
    echo ""
    echo "Please start the backend first:"
    echo "  cd backend && npm run dev"
    echo ""
    echo "Or set BASE_URL environment variable to your backend URL"
    exit 1
fi

# Load environment variables from .env if it exists
if [ -f "$PROJECT_ROOT/backend/.env" ]; then
    echo -e "${YELLOW}⚙  Loading environment variables from backend/.env${NC}"
    export $(grep -v '^#' "$PROJECT_ROOT/backend/.env" | xargs)
fi

# Validate required environment variables
if [ -z "$AMADEUS_CLIENT_ID" ]; then
    echo -e "${YELLOW}⚠  Warning: AMADEUS_CLIENT_ID not set${NC}"
    echo "   Some tests may fail without valid Amadeus credentials"
fi

if [ -z "$AMADEUS_CLIENT_SECRET" ]; then
    echo -e "${YELLOW}⚠  Warning: AMADEUS_CLIENT_SECRET not set${NC}"
    echo "   Some tests may fail without valid Amadeus credentials"
fi

# Display test configuration
echo ""
echo -e "${BLUE}═══ Test Configuration ═══${NC}"
echo "  Profile:    $PROFILE"
echo "  Backend:    $BACKEND_URL"
echo "  Output Dir: $OUTPUT_DIR"
echo ""

# Run the load test
echo -e "${GREEN}🚀 Starting load test with profile: ${PROFILE}${NC}"
echo ""

TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
LOG_FILE="$OUTPUT_DIR/amadeus-load-test-${PROFILE}-${TIMESTAMP}.log"

# Export environment variables for k6
export BASE_URL="$BACKEND_URL"
export LOAD_PROFILE="$PROFILE"
export AMADEUS_CLIENT_ID="${AMADEUS_CLIENT_ID:-}"
export AMADEUS_CLIENT_SECRET="${AMADEUS_CLIENT_SECRET:-}"
export AGENT_TIMEOUT="${AGENT_TIMEOUT:-10000}"
export AGENT_PRIORITY="${AGENT_PRIORITY:-1}"

# Run k6 with the load test script
k6 run \
    --out json="$OUTPUT_DIR/amadeus-load-test-${PROFILE}-${TIMESTAMP}.json" \
    "$K6_DIR/amadeus-flight-load-test.js" \
    2>&1 | tee "$LOG_FILE"

EXIT_CODE=${PIPESTATUS[0]}

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                  ✓ Load Test Completed                        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Results saved to:"
    echo "  Log:  $LOG_FILE"
    echo "  JSON: $OUTPUT_DIR/amadeus-load-test-${PROFILE}-${TIMESTAMP}.json"
    echo "  HTML: $OUTPUT_DIR/amadeus-load-test-${PROFILE}-${TIMESTAMP}.html"
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                  ✗ Load Test Failed                           ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Check the log file for details: $LOG_FILE"
    exit $EXIT_CODE
fi

# Generate summary report
echo ""
echo -e "${BLUE}═══ Generating Summary Report ═══${NC}"

if [ -f "$K6_DIR/scripts/generate-report.js" ]; then
    node "$K6_DIR/scripts/generate-report.js" \
        "$OUTPUT_DIR/amadeus-load-test-${PROFILE}-${TIMESTAMP}.json" \
        "$OUTPUT_DIR/amadeus-load-test-${PROFILE}-${TIMESTAMP}-summary.html"
    
    echo -e "${GREEN}✓ Summary report generated${NC}"
    echo "  Open: $OUTPUT_DIR/amadeus-load-test-${PROFILE}-${TIMESTAMP}-summary.html"
else
    echo -e "${YELLOW}⚠  Report generator not found, skipping${NC}"
fi

echo ""
echo -e "${GREEN}Done!${NC}"

