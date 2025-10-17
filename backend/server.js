process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Application specific logging, throwing an error, or other logic here
  process.exit(1);
});

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ... (rest of the server code) ...

// Start server with WebSocket support
const server = app.listen(PORT, () => {
    console.log(`🚀 Amrikyy Trips server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:3000`);
    console.log(`🔧 Backend API: http://localhost:${PORT}`);
});

// Setup WebSocket for real-time workflow updates
const WebSocket = require('ws');
const { setupWorkflowWebSocket } = require('./src/websocket/workflowHandler');

const wss = new WebSocket.Server({ server, path: '/ws/workflow' });
setupWorkflowWebSocket(wss);
console.log('🔌 WebSocket server ready at ws://localhost:' + PORT + '/ws/workflow');

module.exports = app;
