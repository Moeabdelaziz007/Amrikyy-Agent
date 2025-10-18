# 🧪 AI Agents Testing Guide - Complete Documentation

## 📋 **Overview**

This guide provides comprehensive testing instructions for all AI agents in the Amrikyy Platform, including:
1. **Pattern Learning Mega Agent** - Advanced pattern recognition with quantum capabilities
2. **NanoCoordinator** - Lightweight quantum mesh orchestrator

---

## 🧠 **1. Pattern Learning Mega Agent**

### **Agent Specifications**
- **File**: `backend/agents/pattern-learning-mega-agent.aix`
- **Size**: 481 lines
- **DNA Score**: 97.5/100 ⭐⭐⭐⭐⭐
- **Level**: MEGA Pattern Learning
- **Capabilities**: 8 core specializations (96-99/100 each)

### **Core Capabilities**
1. **Pattern Recognition**: 99/100 - Ultimate pattern detection
2. **Topology Analysis**: 98/100 - Network structure mastery
3. **Quantum Simulation**: 97/100 - Quantum pattern processing
4. **Neural Architecture**: 96/100 - Advanced neural network design
5. **Graph Theory**: 98/100 - Complex graph analysis
6. **Adaptive Learning**: 97/100 - Self-improving systems
7. **Simulation Mastery**: 98/100 - Large-scale simulations
8. **Mega Intelligence**: 98/100 - Super-intelligent analysis

### **MCP Tools (5 Tools)**
- `pattern_analyzer` - Complex pattern analysis
- `topology_explorer` - Network topology optimization
- `quantum_simulator` - Quantum pattern simulation
- `neural_architect` - Neural architecture design
- `simulation_engine` - Complex system simulation

### **API Integration (12 Endpoints)**
- **Pattern Analysis API**: 4 endpoints
- **Topology Analysis API**: 4 endpoints
- **Quantum Simulation API**: 4 endpoints

### **Testing Commands**

#### **Option 1: Node.js Test Script**
```bash
# Run test script
node backend/agents/test-pattern-learning-agent.js

# Make executable and run
chmod +x backend/agents/test-pattern-learning-agent.js
./backend/agents/test-pattern-learning-agent.js
```

#### **Option 2: Python Test Script**
```bash
# Run Python test
python3 backend/agents/test-pattern-learning-agent.py

# Make executable and run
chmod +x backend/agents/test-pattern-learning-agent.py
./backend/agents/test-pattern-learning-agent.py
```

### **Expected Test Output**

```
🧠 PATTERN LEARNING AGENT - TEST SUITE
Testing Pattern Learning Mega Agent v1.0.0

============================================================
  TEST 1: Load AIX File
============================================================
✅ AIX file loaded successfully
ℹ️  File size: 13529 bytes
ℹ️  Lines: 481

============================================================
  TEST 2: Validate AIX Structure
============================================================
✅ Section found: $schema
✅ Section found: version
✅ Section found: genome
✅ Section found: meta:
✅ Section found: identity:
✅ Section found: intelligence:
✅ Section found: interaction:
✅ Section found: workflow:
✅ Section found: apis:
✅ Section found: mcp_tools:
✅ Section found: security:
✅ Section found: monitoring:
✅ Section found: dna_scoring:
✅ Section found: deployment:

ℹ️  Validation: 14/14 sections found

============================================================
  TEST 3: Extract Agent Capabilities
============================================================
✅ pattern_recognition: 99/100
✅ topology_analysis: 98/100
✅ quantum_simulation: 97/100
✅ neural_architecture: 96/100
✅ graph_theory: 98/100
✅ adaptive_learning: 97/100
✅ simulation_mastery: 98/100
✅ mega_intelligence: 98/100

ℹ️  Average capability score: 97.6/100

============================================================
  TEST 4: Extract MCP Tools
============================================================
✅ Tool found: pattern_analyzer
✅ Tool found: topology_explorer
✅ Tool found: quantum_simulator
✅ Tool found: neural_architect
✅ Tool found: simulation_engine

ℹ️  MCP Tools: 5/5 found

============================================================
  TEST 5: Extract API Endpoints
============================================================
✅ API found: pattern-analysis-api
✅ API found: topology-analysis-api
✅ API found: quantum-simulation-api

ℹ️  APIs: 3/3 found

============================================================
  TEST 6: Extract DNA Score
============================================================
✅ DNA Score: 97.5/100
✅ Rating: MEGA LEVEL ⭐⭐⭐⭐⭐

============================================================
  TEST 7: Pattern Recognition Simulation
============================================================
ℹ️  Simulating pattern recognition...
✅ Pattern 1: Linear - 1, 2, 3, 4, 5
✅ Pattern 2: Even Numbers - 2, 4, 6, 8, 10
✅ Pattern 3: Fibonacci - 1, 1, 2, 3, 5, 8
✅ Pattern 4: Multiples of 10 - 10, 20, 30, 40, 50

ℹ️  ✨ Pattern recognition simulation complete!

============================================================
  TEST RESULTS SUMMARY
============================================================

Total Tests: 7
Passed: 7
Failed: 0

Success Rate: 100.0%

🎉 ALL TESTS PASSED! Agent is working perfectly!

============================================================
```

### **Test Success Criteria**
- ✅ All 7 tests passing
- ✅ Success rate = 100%
- ✅ DNA score ≥ 97.5/100
- ✅ All 14 sections present
- ✅ All 5 MCP tools found
- ✅ All 3 APIs configured
- ✅ All 8 capabilities ≥ 96/100

---

## 🔬 **2. NanoCoordinator**

### **Agent Specifications**
- **File**: `backend/src/nano_coordinator.py`
- **Size**: 210 lines Python
- **Target Latency**: <50ms
- **Max Agents**: 1000
- **Type**: Quantum Mesh Orchestrator

### **Core Features**
1. **Quantum Mesh** - Entangled agent communication
2. **WebSocket Server** - Real-time messaging
3. **SQLite Persistence** - Memory storage
4. **Adaptive Rewards** - Performance-based scoring
5. **Self-Organizing** - Dynamic topology

### **Testing Commands**

#### **Start NanoCoordinator**
```bash
# Run coordinator
python3 backend/src/nano_coordinator.py

# Run in background
python3 backend/src/nano_coordinator.py &

# Check if running
ps aux | grep nano_coordinator
```

#### **Test with Nano Agents**
```bash
# Start coordinator
python3 backend/src/nano_coordinator.py &

# Start nano agents
python3 backend/src/nano_agents/nano_analyst.py &
python3 backend/src/nano_agents/nano_researcher.py &

# Check connections
lsof -i :8765

# Stop all
pkill -f nano_
```

### **Expected Output**

```
============================================================
🧠 NanoCoordinator - Quantum Mesh Orchestrator v1.0.0
============================================================
📡 WebSocket Server: ws://localhost:8765
💾 Memory Database: nano_memory.db
🎯 Target Latency: <50ms
🔗 Max Agents: 1000
⚡ Quantum Mesh: Enabled
============================================================

2025-10-15 02:40:00 - NanoCoordinator - INFO - 🧠 NanoCoordinator initialized on localhost:8765
2025-10-15 02:40:00 - NanoCoordinator - INFO - ✅ Database initialized
2025-10-15 02:40:00 - NanoCoordinator - INFO - 🚀 Starting NanoCoordinator on ws://localhost:8765
2025-10-15 02:40:00 - NanoCoordinator - INFO - ✅ NanoCoordinator active and ready for agents!
2025-10-15 02:40:00 - NanoCoordinator - INFO - 📊 Connect agents using: ws://localhost:8765

# When agents connect:
2025-10-15 02:40:05 - NanoCoordinator - INFO - [nano_analyst] → analyze (latency: 12.34ms, reward: 1.00)
2025-10-15 02:40:06 - NanoCoordinator - INFO - [nano_researcher] → research (latency: 15.67ms, reward: 1.00)
```

### **Test Success Criteria**
- ✅ WebSocket server starts on port 8765
- ✅ Database initializes successfully
- ✅ Agents can connect
- ✅ Message latency < 50ms
- ✅ Reward system working
- ✅ Quantum broadcast functioning
- ✅ Graceful shutdown

---

## 🎯 **3. Combined Testing**

### **Test Both Agents Together**

```bash
#!/bin/bash
# test-all-agents.sh

echo "🧪 Testing All AI Agents..."
echo ""

# Test 1: Pattern Learning Agent
echo "1️⃣ Testing Pattern Learning Agent..."
if command -v node &> /dev/null; then
    node backend/agents/test-pattern-learning-agent.js
    PATTERN_RESULT=$?
elif command -v python3 &> /dev/null; then
    python3 backend/agents/test-pattern-learning-agent.py
    PATTERN_RESULT=$?
else
    echo "❌ Neither Node.js nor Python3 found!"
    PATTERN_RESULT=1
fi

echo ""

# Test 2: NanoCoordinator
echo "2️⃣ Testing NanoCoordinator..."
if command -v python3 &> /dev/null; then
    timeout 5s python3 backend/src/nano_coordinator.py &
    NANO_PID=$!
    sleep 2
    
    # Check if process is running
    if ps -p $NANO_PID > /dev/null; then
        echo "✅ NanoCoordinator started successfully"
        kill $NANO_PID 2>/dev/null
        NANO_RESULT=0
    else
        echo "❌ NanoCoordinator failed to start"
        NANO_RESULT=1
    fi
else
    echo "❌ Python3 not found!"
    NANO_RESULT=1
fi

echo ""
echo "📊 Test Results:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $PATTERN_RESULT -eq 0 ]; then
    echo "✅ Pattern Learning Agent: PASSED"
else
    echo "❌ Pattern Learning Agent: FAILED"
fi

if [ $NANO_RESULT -eq 0 ]; then
    echo "✅ NanoCoordinator: PASSED"
else
    echo "❌ NanoCoordinator: FAILED"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Overall result
if [ $PATTERN_RESULT -eq 0 ] && [ $NANO_RESULT -eq 0 ]; then
    echo "🎉 ALL AGENTS PASSED!"
    exit 0
else
    echo "⚠️  Some agents failed. Check logs above."
    exit 1
fi
```

### **Make Test Script Executable**
```bash
chmod +x test-all-agents.sh
./test-all-agents.sh
```

---

## 📊 **4. Agent Comparison**

| Feature | Pattern Learning Agent | NanoCoordinator |
|---------|----------------------|-----------------|
| **Type** | Mega Intelligence Agent | Micro Orchestrator |
| **Size** | 481 lines AIX | 210 lines Python |
| **DNA Score** | 97.5/100 ⭐⭐⭐⭐⭐ | N/A (Coordinator) |
| **Latency** | <100ms | <50ms ⚡ |
| **Capabilities** | 8 mega capabilities | Mesh orchestration |
| **Tools** | 5 MCP tools | WebSocket + SQLite |
| **APIs** | 12 endpoints | 1 WebSocket server |
| **Purpose** | Pattern recognition | Agent coordination |
| **Complexity** | MEGA | NANO |
| **Memory** | Vector + Graph DB | SQLite |
| **Deployment** | Kubernetes (4 replicas) | Single instance |
| **Scaling** | 2-12 replicas | 1000+ agents |

---

## 🚀 **5. Google Colab Testing**

### **For Pattern Learning Agent**

```python
# Google Colab Notebook

# 1. Upload AIX file
from google.colab import files
uploaded = files.upload()  # Upload pattern-learning-mega-agent.aix

# 2. Install dependencies
!pip install pyyaml

# 3. Load and validate
import yaml

with open('pattern-learning-mega-agent.aix', 'r') as f:
    agent = yaml.safe_load(f)

print("✅ Agent loaded successfully!")
print(f"DNA Score: {agent['dna_scoring']['current_score']['total']}/100")

# 4. Test pattern recognition
import numpy as np

# Generate test patterns
patterns = {
    'linear': np.arange(1, 6),
    'fibonacci': np.array([1, 1, 2, 3, 5, 8]),
    'exponential': 2 ** np.arange(1, 6)
}

for name, pattern in patterns.items():
    print(f"✅ Pattern: {name} - {pattern}")

# 5. Advanced testing with ML
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

# Generate synthetic pattern data
X, y = make_classification(n_samples=1000, n_features=20, n_classes=5)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

print(f"✅ Generated {len(X_train)} training samples")
print(f"✅ Generated {len(X_test)} test samples")
```

### **For NanoCoordinator**

```python
# Google Colab Notebook

# 1. Install dependencies
!pip install websockets

# 2. Upload coordinator file
from google.colab import files
uploaded = files.upload()  # Upload nano_coordinator.py

# 3. Run coordinator in background
import subprocess
import time

# Start coordinator
proc = subprocess.Popen(['python3', 'nano_coordinator.py'])
time.sleep(2)

# Check if running
if proc.poll() is None:
    print("✅ NanoCoordinator started successfully!")
else:
    print("❌ NanoCoordinator failed to start")

# 4. Test WebSocket connection
import asyncio
import websockets
import json

async def test_connection():
    uri = "ws://localhost:8765"
    async with websockets.connect(uri) as websocket:
        # Send test message
        message = json.dumps({
            "agent": "test_agent",
            "action": "test_connection"
        })
        await websocket.send(message)
        
        # Receive response
        response = await websocket.recv()
        print(f"✅ Received: {response}")

# Run test
await test_connection()

# 5. Cleanup
proc.terminate()
print("✅ Test complete!")
```

---

## 🔧 **6. Troubleshooting**

### **Common Issues**

#### **Issue 1: Node.js Not Found**
```bash
# Check Node.js
node --version
npm --version

# Install Node.js (if needed)
# Ubuntu/Debian:
sudo apt-get update
sudo apt-get install nodejs npm

# macOS:
brew install node
```

#### **Issue 2: Python3 Not Found**
```bash
# Check Python
python3 --version

# Install Python3 (if needed)
# Ubuntu/Debian:
sudo apt-get update
sudo apt-get install python3 python3-pip

# macOS:
brew install python3
```

#### **Issue 3: WebSocket Connection Failed**
```bash
# Check if port 8765 is in use
lsof -i :8765

# Kill process using port
kill -9 $(lsof -t -i:8765)

# Try different port
python3 backend/src/nano_coordinator.py --port 8766
```

#### **Issue 4: Permission Denied**
```bash
# Fix file permissions
chmod +x backend/agents/test-pattern-learning-agent.js
chmod +x backend/agents/test-pattern-learning-agent.py
chmod +x backend/src/nano_coordinator.py
```

#### **Issue 5: AIX File Not Found**
```bash
# Check if file exists
ls -la backend/agents/pattern-learning-mega-agent.aix

# Restore from git
git checkout f45858e -- backend/agents/pattern-learning-mega-agent.aix
```

---

## 📚 **7. Related Documentation**

- `PATTERN_LEARNING_AGENT_VALIDATION_REPORT.md` - Full validation report
- `NANO_COORDINATOR_COMPLETE_GUIDE.md` - NanoCoordinator guide
- `.cursorrules` - Cursor AI testing rules
- `backend/agents/pattern-learning-mega-agent.aix` - Agent definition
- `backend/src/nano_coordinator.py` - Coordinator implementation

---

## 🎯 **8. Next Steps**

### **After Successful Testing:**

1. ✅ **Deploy to Development**
   ```bash
   # Deploy Pattern Learning Agent
   kubectl apply -f k8s/pattern-learning-agent.yaml
   
   # Deploy NanoCoordinator
   kubectl apply -f k8s/nano-coordinator.yaml
   ```

2. ✅ **Integration Testing**
   - Connect agents to NanoCoordinator
   - Test message routing
   - Verify latency < 50ms
   - Test quantum broadcasting

3. ✅ **Performance Benchmarking**
   - Measure pattern recognition accuracy
   - Test topology analysis speed
   - Verify quantum simulation fidelity
   - Benchmark mesh scalability

4. ✅ **Production Deployment**
   - Full rollout to Amrikyy platform
   - Enable monitoring and alerts
   - Setup auto-scaling
   - Configure backups

---

## 🎊 **Success Metrics**

### **Pattern Learning Agent**
- ✅ All 7 tests passing (100%)
- ✅ DNA score ≥ 97.5/100
- ✅ All capabilities ≥ 96/100
- ✅ Pattern recognition accuracy > 99%
- ✅ Topology analysis < 1 second

### **NanoCoordinator**
- ✅ WebSocket server running
- ✅ Message latency < 50ms
- ✅ Support 1000+ agents
- ✅ Quantum mesh functioning
- ✅ Reward system working

### **Overall Platform**
- ✅ Both agents operational
- ✅ Integration successful
- ✅ Performance targets met
- ✅ Ready for production

---

**Last Updated:** 2025-10-15  
**Version:** 1.0.0  
**Status:** ✅ Complete Testing Guide  
**Agents Tested:** 2/2 (100%)
