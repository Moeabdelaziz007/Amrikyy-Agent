/**
 * Project Context Database for AIX Agent System
 * 
 * Maintains complete awareness of:
 * - Entire codebase structure
 * - Architecture and dependencies
 * - Recent changes and history
 * - Project goals and roadmap
 * - Active features and TODOs
 * 
 * Provides agents with deep project knowledge
 */

const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../utils/logger');
const log = logger.child('ProjectContext');

class ProjectContextDatabase {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    
    // Project knowledge
    this.context = {
      structure: null, // File/folder structure
      architecture: null, // System architecture
      dependencies: new Map(), // Package dependencies
      files: new Map(), // File contents and metadata
      changes: [], // Recent changes
      goals: [], // Project goals
      todos: [], // TODOs and FIXMEs
      agents: new Map(), // Agent knowledge
      patterns: new Map() // Code patterns
    };

    // File watchers
    this.watchers = new Map();

    // Index status
    this.indexed = false;
    this.lastIndexed = null;

    // Ignore patterns
    this.ignorePatterns = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      'coverage',
      '.DS_Store',
      '*.log'
    ];

    log.info('Project Context Database initialized', {
      rootPath: this.rootPath
    });
  }

  /**
   * Index entire project
   */
  async indexProject() {
    log.info('Starting project indexing...');

    try {
      // 1. Index file structure
      await this.indexFileStructure();

      // 2. Index architecture
      await this.indexArchitecture();

      // 3. Index dependencies
      await this.indexDependencies();

      // 4. Index source files
      await this.indexSourceFiles();

      // 5. Index documentation
      await this.indexDocumentation();

      // 6. Index TODOs
      await this.indexTodos();

      // 7. Extract goals
      await this.extractGoals();

      this.indexed = true;
      this.lastIndexed = Date.now();

      log.success('Project indexed successfully', {
        files: this.context.files.size,
        todos: this.context.todos.length,
        goals: this.context.goals.length
      });

    } catch (error) {
      log.error('Project indexing failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Index file structure
   */
  async indexFileStructure() {
    const structure = await this.scanDirectory(this.rootPath);
    this.context.structure = structure;

    log.debug('File structure indexed', {
      totalFiles: this.countFiles(structure)
    });
  }

  /**
   * Scan directory recursively
   */
  async scanDirectory(dir, depth = 0) {
    if (depth > 10) return null; // Prevent infinite recursion

    const result = {
      path: dir,
      name: path.basename(dir),
      type: 'directory',
      children: []
    };

    try {
      const items = await fs.readdir(dir);

      for (const item of items) {
        // Check ignore patterns
        if (this.shouldIgnore(item)) continue;

        const fullPath = path.join(dir, item);
        const stats = await fs.stat(fullPath);

        if (stats.isDirectory()) {
          const subDir = await this.scanDirectory(fullPath, depth + 1);
          if (subDir) result.children.push(subDir);
        } else {
          result.children.push({
            path: fullPath,
            name: item,
            type: 'file',
            size: stats.size,
            modified: stats.mtime
          });
        }
      }
    } catch (error) {
      log.warn('Failed to scan directory', { dir, error: error.message });
    }

    return result;
  }

  /**
   * Should ignore file/folder?
   */
  shouldIgnore(name) {
    for (const pattern of this.ignorePatterns) {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        if (regex.test(name)) return true;
      } else if (name === pattern) {
        return true;
      }
    }
    return false;
  }

  /**
   * Count total files
   */
  countFiles(node) {
    if (node.type === 'file') return 1;
    return node.children.reduce((sum, child) => sum + this.countFiles(child), 0);
  }

  /**
   * Index architecture
   */
  async indexArchitecture() {
    const architecture = {
      type: 'monorepo', // or microservices, monolith, etc.
      structure: 'fullstack', // frontend + backend + ios
      components: {
        frontend: { path: 'frontend', technology: 'React + TypeScript' },
        backend: { path: 'backend', technology: 'Node.js + Express' },
        ios: { path: 'MayaTravelAgent', technology: 'SwiftUI' },
        agents: { path: 'backend/agents', technology: 'AIX Format' }
      },
      databases: {
        primary: 'Supabase (PostgreSQL)',
        cache: 'Redis (future)'
      },
      apis: {
        rest: 'Express REST API',
        websocket: 'Socket.io (planned)',
        telegram: 'Telegram Bot API',
        whatsapp: 'WhatsApp Business API'
      },
      deployment: {
        frontend: 'Vercel',
        backend: 'Railway/Render',
        ios: 'App Store'
      }
    };

    this.context.architecture = architecture;

    log.debug('Architecture indexed', {
      type: architecture.type,
      components: Object.keys(architecture.components).length
    });
  }

  /**
   * Index dependencies
   */
  async indexDependencies() {
    // Backend dependencies
    await this.indexPackageJson(path.join(this.rootPath, 'backend/package.json'), 'backend');

    // Frontend dependencies
    await this.indexPackageJson(path.join(this.rootPath, 'frontend/package.json'), 'frontend');

    log.debug('Dependencies indexed', {
      total: this.context.dependencies.size
    });
  }

  /**
   * Index package.json
   */
  async indexPackageJson(filePath, component) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const pkg = JSON.parse(content);

      this.context.dependencies.set(component, {
        name: pkg.name,
        version: pkg.version,
        dependencies: pkg.dependencies || {},
        devDependencies: pkg.devDependencies || {},
        scripts: pkg.scripts || {}
      });

    } catch (error) {
      log.warn('Failed to index package.json', { filePath, error: error.message });
    }
  }

  /**
   * Index source files
   */
  async indexSourceFiles() {
    const extensions = ['.js', '.ts', '.tsx', '.jsx', '.swift', '.aix', '.md'];
    const files = this.findFilesByExtensions(this.context.structure, extensions);

    for (const file of files) {
      await this.indexFile(file.path);
    }

    log.debug('Source files indexed', {
      count: this.context.files.size
    });
  }

  /**
   * Find files by extensions
   */
  findFilesByExtensions(node, extensions) {
    const results = [];

    if (node.type === 'file') {
      const ext = path.extname(node.name);
      if (extensions.includes(ext)) {
        results.push(node);
      }
    } else if (node.children) {
      for (const child of node.children) {
        results.push(...this.findFilesByExtensions(child, extensions));
      }
    }

    return results;
  }

  /**
   * Index individual file
   */
  async indexFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const stats = await fs.stat(filePath);

      const fileInfo = {
        path: filePath,
        relativePath: path.relative(this.rootPath, filePath),
        size: stats.size,
        modified: stats.mtime,
        lines: content.split('\n').length,
        content: content.length > 50000 ? null : content, // Don't store huge files
        type: this.determineFileType(filePath),
        imports: this.extractImports(content),
        exports: this.extractExports(content),
        functions: this.extractFunctions(content),
        todos: this.extractFileTodos(content),
        indexed: Date.now()
      };

      this.context.files.set(filePath, fileInfo);

    } catch (error) {
      log.warn('Failed to index file', { filePath, error: error.message });
    }
  }

  /**
   * Determine file type
   */
  determineFileType(filePath) {
    const ext = path.extname(filePath);
    const name = path.basename(filePath);

    if (ext === '.aix') return 'agent';
    if (ext === '.md') return 'documentation';
    if (name.includes('test') || name.includes('spec')) return 'test';
    if (name.includes('component') || ext === '.tsx') return 'component';
    if (name.includes('route') || name.includes('api')) return 'api';
    if (name.includes('model')) return 'model';
    if (name.includes('util')) return 'utility';

    return 'code';
  }

  /**
   * Extract imports from file
   */
  extractImports(content) {
    const imports = [];
    const importRegex = /import\s+(?:{[^}]+}|[^from]+)\s+from\s+['"]([^'"]+)['"]/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  /**
   * Extract exports from file
   */
  extractExports(content) {
    const exports = [];
    const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g;
    
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }

    return exports;
  }

  /**
   * Extract function names
   */
  extractFunctions(content) {
    const functions = [];
    const funcRegex = /(?:function|const|let|var)\s+(\w+)\s*[=\(]/g;
    
    let match;
    while ((match = funcRegex.exec(content)) !== null) {
      functions.push(match[1]);
    }

    return functions.slice(0, 50); // Limit to first 50
  }

  /**
   * Extract TODOs from file
   */
  extractFileTodos(content) {
    const todos = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const todoMatch = line.match(/\/\/\s*(TODO|FIXME|NOTE|HACK):\s*(.+)/i);
      
      if (todoMatch) {
        todos.push({
          type: todoMatch[1].toUpperCase(),
          text: todoMatch[2].trim(),
          line: i + 1
        });
      }
    }

    return todos;
  }

  /**
   * Index documentation
   */
  async indexDocumentation() {
    const docFiles = this.findFilesByExtensions(this.context.structure, ['.md']);

    const docs = {};
    for (const file of docFiles) {
      const content = await fs.readFile(file.path, 'utf8');
      const relativePath = path.relative(this.rootPath, file.path);
      docs[relativePath] = {
        path: file.path,
        content,
        modified: file.modified
      };
    }

    this.context.documentation = docs;

    log.debug('Documentation indexed', {
      count: Object.keys(docs).length
    });
  }

  /**
   * Index all TODOs
   */
  async indexTodos() {
    const todos = [];

    for (const fileInfo of this.context.files.values()) {
      if (fileInfo.todos && fileInfo.todos.length > 0) {
        for (const todo of fileInfo.todos) {
          todos.push({
            ...todo,
            file: fileInfo.relativePath,
            filePath: fileInfo.path
          });
        }
      }
    }

    this.context.todos = todos;

    log.debug('TODOs indexed', {
      count: todos.length
    });
  }

  /**
   * Extract project goals
   */
  async extractGoals() {
    const goals = [];

    // Check README
    const readmePath = path.join(this.rootPath, 'README.md');
    try {
      const content = await fs.readFile(readmePath, 'utf8');
      const goalMatches = content.match(/##?\s*Goals?\s*\n([\s\S]*?)(?=\n##|$)/i);
      
      if (goalMatches) {
        const goalText = goalMatches[1];
        const goalItems = goalText.match(/[-*]\s*(.+)/g);
        
        if (goalItems) {
          goalItems.forEach(item => {
            goals.push({
              text: item.replace(/^[-*]\s*/, '').trim(),
              source: 'README.md'
            });
          });
        }
      }
    } catch (error) {
      // README might not exist
    }

    // Check governance docs
    const manifestPath = path.join(this.rootPath, 'docs/governance/PROJECT_MANIFEST.md');
    try {
      const content = await fs.readFile(manifestPath, 'utf8');
      const goalMatches = content.match(/##?\s*Goals?\s*\n([\s\S]*?)(?=\n##|$)/i);
      
      if (goalMatches) {
        const goalText = goalMatches[1];
        const goalItems = goalText.match(/[-*]\s*(.+)/g);
        
        if (goalItems) {
          goalItems.forEach(item => {
            goals.push({
              text: item.replace(/^[-*]\s*/, '').trim(),
              source: 'PROJECT_MANIFEST.md'
            });
          });
        }
      }
    } catch (error) {
      // Manifest might not exist
    }

    this.context.goals = goals;

    log.debug('Goals extracted', {
      count: goals.length
    });
  }

  /**
   * Get file content
   */
  getFile(filePath) {
    return this.context.files.get(filePath);
  }

  /**
   * Search files
   */
  searchFiles(query) {
    const results = [];

    for (const [filePath, fileInfo] of this.context.files) {
      if (fileInfo.content && fileInfo.content.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          file: fileInfo.relativePath,
          filePath: filePath,
          type: fileInfo.type,
          matches: this.findMatches(fileInfo.content, query)
        });
      }
    }

    return results;
  }

  /**
   * Find matches in content
   */
  findMatches(content, query) {
    const lines = content.split('\n');
    const matches = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(query.toLowerCase())) {
        matches.push({
          line: i + 1,
          text: lines[i].trim()
        });
      }
    }

    return matches.slice(0, 10); // Limit to 10 matches
  }

  /**
   * Get project summary
   */
  getProjectSummary() {
    return {
      name: 'Amrikyy Travel Agent Platform',
      type: this.context.architecture?.type,
      structure: this.context.architecture?.structure,
      components: Object.keys(this.context.architecture?.components || {}),
      totalFiles: this.context.files.size,
      codeLines: this.getTotalLines(),
      dependencies: this.context.dependencies.size,
      todos: this.context.todos.length,
      goals: this.context.goals.length,
      lastIndexed: this.lastIndexed,
      indexed: this.indexed
    };
  }

  /**
   * Get total lines of code
   */
  getTotalLines() {
    let total = 0;
    for (const file of this.context.files.values()) {
      total += file.lines || 0;
    }
    return total;
  }

  /**
   * Get context for agent
   */
  getContextForAgent(agentId, scope = 'full') {
    const context = {
      project: this.getProjectSummary(),
      architecture: this.context.architecture,
      goals: this.context.goals
    };

    if (scope === 'full') {
      context.recentChanges = this.context.changes.slice(-10);
      context.todos = this.context.todos.slice(0, 20);
      context.files = Array.from(this.context.files.values())
        .filter(f => f.type !== 'test')
        .slice(0, 50)
        .map(f => ({
          path: f.relativePath,
          type: f.type,
          functions: f.functions
        }));
    }

    return context;
  }

  /**
   * Track file change
   */
  trackChange(filePath, changeType) {
    this.context.changes.push({
      file: filePath,
      type: changeType,
      timestamp: Date.now()
    });

    // Keep last 1000 changes
    if (this.context.changes.length > 1000) {
      this.context.changes.shift();
    }

    // Re-index the file
    this.indexFile(filePath);
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      indexed: this.indexed,
      lastIndexed: this.lastIndexed,
      files: this.context.files.size,
      codeLines: this.getTotalLines(),
      todos: this.context.todos.length,
      goals: this.context.goals.length,
      changes: this.context.changes.length,
      dependencies: this.context.dependencies.size
    };
  }
}

module.exports = ProjectContextDatabase;

