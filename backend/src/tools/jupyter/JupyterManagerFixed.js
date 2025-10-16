// ═══════════════════════════════════════════════════════════════
// 🔧 JUPYTER MANAGER FIXED
// Fixed Jupyter server management with proper authentication
// ═══════════════════════════════════════════════════════════════

const { spawn } = require('child_process');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

class JupyterManagerFixed {
  constructor() {
    this.serverProcess = null;
    this.serverUrl = 'http://localhost:8888';
    this.token = '';
    this.isRunning = false;
  }

  /**
   * Start Jupyter server with fixed configuration
   */
  async startServer() {
    if (this.isRunning) {
      console.log('✅ Jupyter server already running');
      return true;
    }

    try {
      console.log('🚀 Starting Jupyter server with fixed configuration...');

      // Create jupyter directory if it doesn't exist
      const jupyterDir = path.join(process.cwd(), 'kody_env');
      if (!fs.existsSync(jupyterDir)) {
        fs.mkdirSync(jupyterDir, { recursive: true });
      }

      // Start Jupyter with fixed arguments
      this.serverProcess = spawn(
        'jupyter',
        [
          'lab',
          '--port=8888',
          '--no-browser',
          '--allow-root',
          '--IdentityProvider.token=""',
          '--PasswordIdentityProvider.hashed_password=""',
          '--ServerApp.disable_check_xsrf=true',
          '--ServerApp.allow_origin=*',
          '--ServerApp.allow_remote_access=true',
          '--ServerApp.open_browser=false',
        ],
        {
          cwd: jupyterDir,
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, PYTHONPATH: jupyterDir },
        }
      );

      // Handle process events
      this.serverProcess.on('error', (error) => {
        console.error('❌ Failed to start Jupyter server:', error);
        this.isRunning = false;
      });

      this.serverProcess.on('exit', (code) => {
        console.log(`Jupyter server exited with code ${code}`);
        this.isRunning = false;
      });

      // Wait for server to start
      await this.waitForServer();

      console.log('✅ Jupyter server started successfully');
      return true;
    } catch (error) {
      console.error('❌ Error starting Jupyter server:', error);
      return false;
    }
  }

  /**
   * Wait for Jupyter server to be ready
   */
  async waitForServer(timeout = 30000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const response = await axios.get(`${this.serverUrl}/api/status`, {
          timeout: 1000,
          headers: {
            Authorization: `token ${this.token}`,
          },
        });

        if (response.status === 200) {
          this.isRunning = true;
          return true;
        }
      } catch (error) {
        // Server not ready yet, continue waiting
      }

      // Wait 500ms before next attempt
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    throw new Error('Jupyter server failed to start within timeout');
  }

  /**
   * Create a new notebook session
   */
  async createSession() {
    if (!this.isRunning) {
      await this.startServer();
    }

    try {
      const response = await axios.post(
        `${this.serverUrl}/api/sessions`,
        {
          kernel: {
            name: 'python3',
          },
          name: `session-${Date.now()}`,
          path: 'temp-notebook.ipynb',
          type: 'notebook',
        },
        {
          headers: {
            Authorization: `token ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Failed to create Jupyter session:', error);
      throw error;
    }
  }

  /**
   * Execute code in a session
   */
  async executeCode(sessionId, code) {
    try {
      const response = await axios.post(
        `${this.serverUrl}/api/sessions/${sessionId}/execute`,
        {
          code: code,
        },
        {
          headers: {
            Authorization: `token ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Failed to execute code:', error);
      throw error;
    }
  }

  /**
   * Stop Jupyter server
   */
  async stopServer() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
      this.isRunning = false;
      console.log('🛑 Jupyter server stopped');
    }
  }

  /**
   * Get server status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      serverUrl: this.serverUrl,
      token: this.token ? '***' : '',
    };
  }
}

module.exports = JupyterManagerFixed;
