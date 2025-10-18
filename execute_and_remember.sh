#!/bin/bash

# execute_and_remember.sh
# Executes a command and, if successful, records a memory of the action.

# Check for required arguments
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 \"<command_to_execute>\" \"<memory_description>\""
  exit 1
fi

COMMAND_TO_EXECUTE=$1
MEMORY_DESCRIPTION=$2

# Execute the command
echo "Executing command: $COMMAND_TO_EXECUTE"
eval "$COMMAND_TO_EXECUTE"
COMMAND_EXIT_CODE=$?

# Check if the command was successful
if [ $COMMAND_EXIT_CODE -eq 0 ]; then
  echo "Command executed successfully."
  # Record the memory using the new smart tool
  ./save_knowledge.sh --type "Action" --topic "Task Execution" --insight "$MEMORY_DESCRIPTION"
else
  echo "Command failed with exit code $COMMAND_EXIT_CODE. Memory not recorded."
  exit $COMMAND_EXIT_CODE
fi
