#!/bin/bash

# Free Models Installation Script
# Installs Ollama and downloads free models for Continue

set -e

echo "🚀 Free Models Setup - Zero Cost AI Development"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Ollama is installed
echo -e "${BLUE}Checking for Ollama...${NC}"
if command -v ollama &> /dev/null; then
    echo -e "${GREEN}✓ Ollama is already installed${NC}"
    ollama --version
else
    echo -e "${YELLOW}⚠ Ollama not found. Installing...${NC}"
    
    # Detect OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Detected macOS"
        curl -fsSL https://ollama.com/install.sh | sh
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "Detected Linux"
        curl -fsSL https://ollama.com/install.sh | sh
    else
        echo -e "${RED}✗ Unsupported OS. Please install Ollama manually from https://ollama.com${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Ollama installed successfully${NC}"
fi

echo ""
echo -e "${BLUE}Starting Ollama service...${NC}"
# Start Ollama in background if not running
if ! pgrep -x "ollama" > /dev/null; then
    ollama serve &
    sleep 3
    echo -e "${GREEN}✓ Ollama service started${NC}"
else
    echo -e "${GREEN}✓ Ollama service already running${NC}"
fi

echo ""
echo -e "${BLUE}Downloading free models...${NC}"
echo "This may take a few minutes depending on your internet speed."
echo ""

# Function to pull model with progress
pull_model() {
    local model=$1
    local description=$2
    local size=$3
    
    echo -e "${YELLOW}Downloading ${description} (${size})...${NC}"
    if ollama pull "$model"; then
        echo -e "${GREEN}✓ ${description} downloaded${NC}"
    else
        echo -e "${RED}✗ Failed to download ${description}${NC}"
        return 1
    fi
    echo ""
}

# Pull models
pull_model "qwen2.5-coder:1.5b" "Qwen 1.5B (Autocomplete)" "~1GB"
pull_model "qwen2.5-coder:7b" "Qwen 7B (Chat/Edit)" "~4.7GB"
pull_model "nomic-embed-text" "Nomic Embeddings" "~274MB"

echo ""
echo -e "${BLUE}Verifying installations...${NC}"
echo ""

# List installed models
echo "Installed models:"
ollama list

echo ""
echo -e "${GREEN}✓ All models installed successfully!${NC}"
echo ""

# Test models
echo -e "${BLUE}Testing models...${NC}"
echo ""

echo "Testing Qwen 1.5B..."
if echo "Write a hello world function" | ollama run qwen2.5-coder:1.5b > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Qwen 1.5B working${NC}"
else
    echo -e "${YELLOW}⚠ Qwen 1.5B test failed (may still work in Continue)${NC}"
fi

echo "Testing Qwen 7B..."
if echo "Write a hello world function" | ollama run qwen2.5-coder:7b > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Qwen 7B working${NC}"
else
    echo -e "${YELLOW}⚠ Qwen 7B test failed (may still work in Continue)${NC}"
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next steps:"
echo "1. Copy the Continue configuration:"
echo "   ${BLUE}cp docs/ai-setup/free-models/continue-free-config.json ~/.continue/config.json${NC}"
echo ""
echo "2. Restart VS Code"
echo ""
echo "3. Test autocomplete:"
echo "   - Open any code file"
echo "   - Start typing"
echo "   - See suggestions appear!"
echo ""
echo "4. Test chat:"
echo "   - Press Cmd/Ctrl + L"
echo "   - Ask a coding question"
echo ""
echo "💰 Total cost: $0/month"
echo "🔒 100% private (all local)"
echo "⚡ No rate limits"
echo ""
echo "Enjoy your free AI coding assistant! 🚀"
