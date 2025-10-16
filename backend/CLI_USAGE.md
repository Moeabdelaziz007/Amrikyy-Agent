# 🚀 Amrikyy CLI - Direct Control Interface

## Overview

The Amrikyy CLI is a powerful command-line interface for direct interaction with the AIX Agent System. It provides quick access to all agents, trip planning capabilities, and system management functions.

## Quick Start

### 1. Basic Commands

```bash
# List all available agents
node amrikyy-cli.js agents

# Get system status
node amrikyy-cli.js status

# Initialize all agents
node amrikyy-cli.js awaken

# Show usage examples
node amrikyy-cli.js examples
```

### 2. Trip Planning

```bash
# Plan a basic trip
node amrikyy-cli.js plan-trip -d "Cairo, Egypt" -p 3 -b 1000 -i food history

# Plan with specific agent
node amrikyy-cli.js plan-trip -d "Tokyo" -p 7 -b 2000 -i culture art --agent luna-trip-architect-v1
```

### 3. Luna POC Testing

```bash
# Test Luna specifically
node amrikyy-cli.js luna-test -d "Paris" -p 3 -b 1500 -i food culture

# Quick Luna awakening test
node test-luna-awakening.js
```

## Command Reference

### Agent Management

| Command | Description | Example |
|---------|-------------|---------|
| `agents` | List all available agents | `node amrikyy-cli.js agents` |
| `agent <id>` | Get agent details | `node amrikyy-cli.js agent luna-trip-architect-v1` |

### Trip Planning

| Command | Description | Options |
|---------|-------------|---------|
| `plan-trip` | Plan a new trip | `-d, --destination`, `-p, --days`, `-b, --budget`, `-i, --interests` |
| `luna-test` | Test Luna specifically | Same as plan-trip but forces Luna agent |

### System Management

| Command | Description |
|---------|-------------|
| `status` | Get system status and health |
| `awaken` | Initialize all AIX agents |
| `examples` | Show usage examples |

## Options

- `-v, --verbose`: Enable verbose logging
- `--debug`: Enable debug mode with stack traces

## Examples

### Basic Trip Planning

```bash
# Plan a 3-day food trip to Cairo
node amrikyy-cli.js plan-trip -d "Cairo, Egypt" -p 3 -b 1000 -i food culture

# Plan a 7-day cultural trip to Tokyo
node amrikyy-cli.js plan-trip -d "Tokyo, Japan" -p 7 -b 2000 -i culture art history
```

### Luna POC Testing

```bash
# Test Luna with a foodie trip to Paris
node amrikyy-cli.js luna-test -d "Paris, France" -p 3 -b 1500 -i food wine culture

# Direct awakening test
node test-luna-awakening.js
```

### System Management

```bash
# Check system health
node amrikyy-cli.js status

# Initialize all agents
node amrikyy-cli.js awaken

# Get detailed agent information
node amrikyy-cli.js agent luna-trip-architect-v1
```

## Troubleshooting

### Common Issues

1. **"No agents found"**
   - Check that AIX files are in `backend/agents/aix/`
   - Verify `luna-v1.aix` exists

2. **"Manager initialization failed"**
   - Check AIX directory path
   - Verify all dependencies are installed

3. **"Task execution failed"**
   - Use `--debug` flag for detailed error information
   - Check agent capabilities and tools

### Debug Mode

```bash
# Enable debug mode for detailed error information
node amrikyy-cli.js plan-trip -d "Cairo" --debug

# Enable verbose logging
node amrikyy-cli.js plan-trip -d "Cairo" --verbose
```

## Integration with Development Workflow

### Testing New Agents

```bash
# Test new AIX agent
node amrikyy-cli.js agent <new-agent-id>

# Force specific agent for testing
node amrikyy-cli.js plan-trip -d "Test" --agent <new-agent-id>
```

### Performance Monitoring

```bash
# Check system status
node amrikyy-cli.js status

# Monitor agent performance
node amrikyy-cli.js plan-trip -d "Cairo" --verbose
```

## Next Steps

After successful CLI testing, you can:

1. **Integrate with n8n** for visual workflow orchestration
2. **Add webhook endpoints** for external integrations
3. **Implement scheduled tasks** for automated operations
4. **Add monitoring and alerting** for production deployment

---

**Ready to test Luna's awakening?** Run: `node test-luna-awakening.js`
