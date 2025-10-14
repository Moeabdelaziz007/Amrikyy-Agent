# 🌐 Amrikyy WebSocket Server

**Production-grade WebSocket server for real-time AI agent visualization**

---

## 🚀 Quick Start (Direct Setup - No Docker)

### **1. Install Dependencies:**

```bash
cd backend/websocket
npm install
```

### **2. Set Environment Variables:**

Create `.env` file:
```bash
WS_PORT=8080
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### **3. Run Development Server:**

```bash
npm run dev
```

Server runs on: `http://localhost:8080`

---

## 📡 **Available Endpoints:**

- **WebSocket:** `ws://localhost:8080/ws?token=YOUR_JWT`
- **Health Check:** `http://localhost:8080/healthz`
- **Ready Check:** `http://localhost:8080/readyz`
- **Metrics:** `http://localhost:8080/metrics`

---

## 🧪 **Testing Connection:**

### **Option 1: Using wscat (recommended):**

```bash
# Install wscat
npm install -g wscat

# Generate test JWT (use node console)
node -e "console.log(require('jsonwebtoken').sign({ id: 'test' }, 'your-secret-key'))"

# Connect
wscat -c "ws://localhost:8080/ws?token=YOUR_JWT_HERE"
```

### **Option 2: Using browser console:**

```javascript
const ws = new WebSocket('ws://localhost:8080/ws?token=YOUR_JWT');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.send(JSON.stringify({ type: 'ping' }));
```

---

## 📨 **Message Types:**

### **Client → Server:**

**Execute Agent:**
```json
{
  "type": "execute",
  "agentId": "amrikyy-001",
  "task": {
    "function": "plan_trip",
    "params": { "destination": "Japan", "budget": 2000 }
  }
}
```

**Subscribe to Agent:**
```json
{
  "type": "subscribe",
  "agentId": "amrikyy-001"
}
```

**Ping:**
```json
{
  "type": "ping"
}
```

### **Server → Client:**

**Initial State:**
```json
{
  "type": "initial",
  "data": { /* topology, patterns, etc */ }
}
```

**Topology Update (every 2s):**
```json
{
  "type": "topology_update",
  "data": { /* quantum topology snapshot */ },
  "timestamp": 1234567890
}
```

**Insights Update (every 5s):**
```json
{
  "type": "insights_update",
  "data": { /* pattern learning insights */ },
  "timestamp": 1234567890
}
```

**Execution Result:**
```json
{
  "type": "execution_result",
  "agentId": "amrikyy-001",
  "result": { /* execution result */ },
  "visualization": { /* real-time viz data */ },
  "timestamp": 1234567890
}
```

---

## 🔧 **Scripts:**

- `npm run dev` - Development with hot reload
- `npm run build` - Build TypeScript
- `npm start` - Production (after build)
- `npm run watch` - Watch mode with nodemon

---

## 🔐 **Security:**

**For Production:**
1. Change `JWT_SECRET` to strong random string
2. Use WSS (secure WebSocket) with TLS certificate
3. Enable CORS policy
4. Set up rate limiting (already included)
5. Use helmet for HTTP security headers (already included)

---

## 📊 **Monitoring:**

**Prometheus Metrics:**
- `ws_connections_total` - Total connections
- `ws_messages_total` - Total messages
- `ws_message_latency_seconds` - Message latency

**Access:** `http://localhost:8080/metrics`

---

## 🐛 **Troubleshooting:**

**Port already in use:**
```bash
# Change port in .env
WS_PORT=8081
```

**Connection refused:**
```bash
# Check server is running
curl http://localhost:8080/healthz
```

**Invalid token:**
```bash
# Generate new JWT with correct secret
node -e "console.log(require('jsonwebtoken').sign({ id: 'test' }, 'your-secret-key'))"
```

---

## 📝 **Notes:**

- Server integrates with `EnhancedAIXManager`
- Real-time updates from `QuantumTopologyLayer`
- Pattern insights from `PatternLearningEngine`
- Project context from `ProjectContextDatabase`

---

**Status:** Production-Ready ✅  
**No Docker needed** - Runs directly with Node.js!

