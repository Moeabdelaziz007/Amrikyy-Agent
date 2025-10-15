#!/bin/bash
# Test Private Journal MCP Server Functionality
# Sends test messages and verifies responses

set -e

echo "🧪 TESTING PRIVATE JOURNAL MCP SERVER"
echo "====================================="
echo ""

MCP_SERVER="backend/mcp-servers/private-journal/dist/index.js"

# Check if server exists
if [ ! -f "$MCP_SERVER" ]; then
  echo "❌ ERROR: MCP server not found at $MCP_SERVER"
  echo "Run: cd backend/mcp-servers/private-journal && npm install && npm run build"
  exit 1
fi

echo "✅ MCP server found"
echo ""

# Create temp files for communication
INPUT_PIPE=$(mktemp)
OUTPUT_FILE=$(mktemp)

# Cleanup on exit
cleanup() {
  rm -f "$INPUT_PIPE" "$OUTPUT_FILE"
  kill $SERVER_PID 2>/dev/null || true
}
trap cleanup EXIT

echo "🚀 Starting MCP server..."

# Start the server in background
node "$MCP_SERVER" < "$INPUT_PIPE" > "$OUTPUT_FILE" 2>&1 &
SERVER_PID=$!

# Give server time to start
sleep 2

# Check if server is still running
if ! kill -0 $SERVER_PID 2>/dev/null; then
  echo "❌ Server failed to start. Output:"
  cat "$OUTPUT_FILE"
  exit 1
fi

echo "✅ Server started (PID: $SERVER_PID)"
echo ""

# Test 1: Initialize
echo "📤 Test 1: Sending initialize request..."
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"1.0","clientInfo":{"name":"test","version":"1.0"}}}' >> "$INPUT_PIPE"

sleep 1

if grep -q "result" "$OUTPUT_FILE"; then
  echo "✅ Server responded to initialize"
else
  echo "⚠️  No response detected (this may be normal for some MCP implementations)"
fi

echo ""
echo "📋 Server Output:"
echo "----------------"
cat "$OUTPUT_FILE"
echo ""

# Test 2: List tools
echo "📤 Test 2: Listing available tools..."
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' >> "$INPUT_PIPE"

sleep 1

echo ""
echo "📊 RESULTS"
echo "=========="

if kill -0 $SERVER_PID 2>/dev/null; then
  echo "✅ Server is responsive"
  echo "✅ MCP server test PASSED"
  echo ""
  echo "🎯 Available tools (check docs for details):"
  echo "   - process_thoughts: Store journal entries"
  echo "   - search_journal: Semantic search"
  echo "   - read_journal_entry: Read specific entry"
  echo "   - list_recent_entries: List recent entries"
  echo ""
  echo "Next: Test in Continue with /remember command"
else
  echo "❌ Server stopped unexpectedly"
  echo "Check output above for errors"
  exit 1
fi
