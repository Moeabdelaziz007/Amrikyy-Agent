#!/bin/bash

# save_knowledge.sh
# A smart tool to record structured knowledge into openmemory.md.

# Set default values
INSIGHT=""
TOPIC="General"
IMPORTANCE="Medium"
TYPE="Fact"
CONTEXT="N/A"

# Parse named arguments
while [ "$#" -gt 0 ]; do
  case "$1" in
    --insight)
      INSIGHT="$2"
      shift 2
      ;;
    --topic)
      TOPIC="$2"
      shift 2
      ;;
    --importance)
      IMPORTANCE="$2"
      shift 2
      ;;
    --type)
      TYPE="$2"
      shift 2
      ;;
    --context)
      CONTEXT="$2"
      shift 2
      ;;
    *)
      echo "Unknown parameter: $1"
      exit 1
      ;;
  esac
done

# Check if insight is provided
if [ -z "$INSIGHT" ]; then
  echo "Error: --insight is a required argument."
  echo "Usage: $0 --insight \"<text>\" [--topic \"<text>\"] [--importance \"<level>\"] [--type \"<type>\"] [--context \"<text>\"]"
  exit 1
fi

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
MEMORY_FILE="openmemory.md"

# Create the formatted memory entry
cat <<EOF >> "$MEMORY_FILE"

---
**Timestamp**: $TIMESTAMP
**Topic**: $TOPIC
**Importance**: $IMPORTANCE
**Type**: $TYPE
**Key Insight**: $INSIGHT
**Context**: $CONTEXT
---
EOF

echo "Smart memory recorded successfully."
