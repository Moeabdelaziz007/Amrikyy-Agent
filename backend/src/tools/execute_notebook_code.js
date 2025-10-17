// ═══════════════════════════════════════════════════════════════
// 🔧 EXECUTE NOTEBOOK CODE TOOL
// Tool for executing Python code in Jupyter environment
// ═══════════════════════════════════════════════════════════════

const JupyterManagerFixed = require('./jupyter/JupyterManagerFixed');
const { wrapTool } = require('../utils/langsmith_helpers');

class ExecuteNotebookCodeTool {
  constructor() {
    this.jupyterManager = new JupyterManagerFixed();
    this.sessions = new Map();
  }

  /**
   * Execute Python code in Jupyter environment
   */
  async execute(code, sessionId = null) {
    try {
      // Start Jupyter server if not running
      if (!this.jupyterManager.isRunning) {
        await this.jupyterManager.startServer();
      }

      // Create new session if none provided
      if (!sessionId) {
        const session = await this.jupyterManager.createSession();
        sessionId = session.id;
        this.sessions.set(sessionId, {
          created: Date.now(),
          executions: 0,
        });
      }

      // Execute code
      const result = await this.jupyterManager.executeCode(sessionId, code);

      // Update session stats
      const session = this.sessions.get(sessionId);
      if (session) {
        session.executions++;
        session.lastExecution = Date.now();
      }

      return {
        success: true,
        result: result,
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Code execution failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get session information
   */
  getSessionInfo(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions() {
    const now = Date.now();
    const active = [];

    for (const [sessionId, session] of this.sessions) {
      // Consider session active if used in last 5 minutes
      if (now - session.lastExecution < 300000) {
        active.push({
          sessionId,
          ...session,
        });
      }
    }

    return active;
  }

  /**
   * Clean up old sessions
   */
  cleanupOldSessions() {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.sessions) {
      if (now - session.created > maxAge) {
        this.sessions.delete(sessionId);
        console.log(`🧹 Cleaned up old session: ${sessionId}`);
      }
    }
  }

  /**
   * Get tool status
   */
  getStatus() {
    return {
      jupyterStatus: this.jupyterManager.getStatus(),
      activeSessions: this.sessions.size,
      sessions: Array.from(this.sessions.entries()).map(([id, session]) => ({
        sessionId: id,
        ...session,
      })),
    };
  }
}

// Create and export tool instance with tracing
const executeNotebookCodeTool = new ExecuteNotebookCodeTool();
const tracedExecuteNotebookCodeTool = wrapTool(executeNotebookCodeTool, 'execute_notebook_code', ['tool', 'jupyter', 'python']);

module.exports = tracedExecuteNotebookCodeTool;
