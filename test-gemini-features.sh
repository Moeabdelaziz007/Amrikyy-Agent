#!/bin/bash

# 🧪 Test Gemini 2.5 Features
echo "🧪 Testing Gemini 2.5 Primary Brain Features..."
echo ""

if command -v node &> /dev/null; then
    node test-gemini-logic.js
else
    echo "❌ Node.js not found! Please install Node.js to run these tests."
    exit 1
fi
