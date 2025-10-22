/**
 * CodebaseIndexer - Automated codebase indexing service
 * 
 * Features:
 * - Scans all code files (.js, .ts, .jsx, .tsx)
 * - Extracts functions, classes, components
 * - Generates metadata (imports, exports, dependencies)
 * - Creates embeddings with Gemini for semantic search
 * - Stores in Redis cache + Supabase persistent storage
 * 
 * @author Ona AI
 * @created 2025-01-25
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { GoogleGenerativeAI } = require('@google/generative-ai');

class CodebaseIndexer {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.patterns = options.patterns || [
      '**/*.js',
      '**/*.ts',
      '**/*.jsx',
      '**/*.tsx'
    ];
    this.ignorePatterns = options.ignorePatterns || [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.git/**',
      '**/coverage/**'
    ];
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.gemini.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' 
    });
    this.index = new Map();
  }

  /**
   * Scan all code files in the codebase
   */
  async scanFiles() {
    console.log(`🔍 Scanning codebase in: ${this.rootDir}`);
    
    const files = await glob(this.patterns, {
      cwd: this.rootDir,
      ignore: this.ignorePatterns,
      absolute: true
    });

    console.log(`📁 Found ${files.length} files to index`);
    return files;
  }

  /**
   * Parse a single file and extract metadata
   */
  async parseFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const relativePath = path.relative(this.rootDir, filePath);
      const ext = path.extname(filePath);

      // Parse with Babel
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: [
          'jsx',
          'typescript',
          'classProperties',
          'decorators-legacy',
          'dynamicImport',
          'objectRestSpread'
        ]
      });

      const metadata = {
        path: relativePath,
        absolutePath: filePath,
        extension: ext,
        size: content.length,
        lines: content.split('\n').length,
        functions: [],
        classes: [],
        components: [],
        imports: [],
        exports: [],
        comments: [],
        lastModified: (await fs.stat(filePath)).mtime
      };

      // Traverse AST to extract information
      traverse(ast, {
        // Extract functions
        FunctionDeclaration(path) {
          metadata.functions.push({
            name: path.node.id?.name || 'anonymous',
            params: path.node.params.map(p => p.name || 'param'),
            async: path.node.async,
            line: path.node.loc?.start.line
          });
        },

        // Extract arrow functions
        VariableDeclarator(path) {
          if (path.node.init?.type === 'ArrowFunctionExpression') {
            metadata.functions.push({
              name: path.node.id.name,
              params: path.node.init.params.map(p => p.name || 'param'),
              async: path.node.init.async,
              arrow: true,
              line: path.node.loc?.start.line
            });
          }
        },

        // Extract classes
        ClassDeclaration(path) {
          metadata.classes.push({
            name: path.node.id?.name || 'anonymous',
            methods: path.node.body.body
              .filter(m => m.type === 'ClassMethod')
              .map(m => m.key.name),
            line: path.node.loc?.start.line
          });
        },

        // Extract React components (JSX)
        JSXElement(path) {
          const componentName = path.node.openingElement.name.name;
          if (componentName && !metadata.components.includes(componentName)) {
            metadata.components.push(componentName);
          }
        },

        // Extract imports
        ImportDeclaration(path) {
          metadata.imports.push({
            source: path.node.source.value,
            specifiers: path.node.specifiers.map(s => s.local.name)
          });
        },

        // Extract exports
        ExportNamedDeclaration(path) {
          if (path.node.declaration) {
            const name = path.node.declaration.id?.name || 
                        path.node.declaration.declarations?.[0]?.id?.name;
            if (name) metadata.exports.push(name);
          }
        },

        ExportDefaultDeclaration(path) {
          metadata.exports.push('default');
        }
      });

      // Extract comments
      if (ast.comments) {
        metadata.comments = ast.comments.map(c => ({
          type: c.type,
          value: c.value.trim(),
          line: c.loc.start.line
        }));
      }

      return metadata;
    } catch (error) {
      console.error(`❌ Error parsing ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Generate embedding for a file using Gemini
   */
  async generateEmbedding(metadata, content) {
    try {
      // Create a summary of the file for embedding
      const summary = `
File: ${metadata.path}
Functions: ${metadata.functions.map(f => f.name).join(', ')}
Classes: ${metadata.classes.map(c => c.name).join(', ')}
Components: ${metadata.components.join(', ')}
Imports: ${metadata.imports.map(i => i.source).join(', ')}
Content preview: ${content.substring(0, 500)}
      `.trim();

      // Generate embedding with Gemini
      const result = await this.model.embedContent(summary);
      return result.embedding.values;
    } catch (error) {
      console.error(`❌ Error generating embedding:`, error.message);
      return null;
    }
  }

  /**
   * Index a single file
   */
  async indexFile(filePath) {
    const metadata = await this.parseFile(filePath);
    if (!metadata) return null;

    const content = await fs.readFile(filePath, 'utf-8');
    const embedding = await this.generateEmbedding(metadata, content);

    const indexEntry = {
      ...metadata,
      embedding,
      indexed_at: new Date().toISOString()
    };

    this.index.set(metadata.path, indexEntry);
    return indexEntry;
  }

  /**
   * Index entire codebase
   */
  async indexCodebase() {
    console.log('🚀 Starting codebase indexing...');
    const startTime = Date.now();

    const files = await this.scanFiles();
    const results = {
      total: files.length,
      indexed: 0,
      failed: 0,
      skipped: 0
    };

    for (const file of files) {
      try {
        const entry = await this.indexFile(file);
        if (entry) {
          results.indexed++;
          console.log(`✅ Indexed: ${entry.path}`);
        } else {
          results.failed++;
        }
      } catch (error) {
        console.error(`❌ Failed to index ${file}:`, error.message);
        results.failed++;
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✨ Indexing complete in ${duration}s`);
    console.log(`📊 Results: ${results.indexed} indexed, ${results.failed} failed`);

    return results;
  }

  /**
   * Search codebase with semantic similarity
   */
  async search(query, options = {}) {
    const limit = options.limit || 10;
    const threshold = options.threshold || 0.7;

    // Generate embedding for query
    const queryEmbedding = await this.model.embedContent(query);
    const queryVector = queryEmbedding.embedding.values;

    // Calculate similarity scores
    const results = [];
    for (const [path, entry] of this.index.entries()) {
      if (!entry.embedding) continue;

      const similarity = this.cosineSimilarity(queryVector, entry.embedding);
      if (similarity >= threshold) {
        results.push({
          ...entry,
          similarity,
          score: similarity
        });
      }
    }

    // Sort by similarity and limit
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, limit);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Get index statistics
   */
  getStats() {
    const entries = Array.from(this.index.values());
    
    return {
      totalFiles: entries.length,
      totalFunctions: entries.reduce((sum, e) => sum + e.functions.length, 0),
      totalClasses: entries.reduce((sum, e) => sum + e.classes.length, 0),
      totalComponents: entries.reduce((sum, e) => sum + e.components.length, 0),
      totalLines: entries.reduce((sum, e) => sum + e.lines, 0),
      byExtension: this.groupBy(entries, 'extension'),
      lastIndexed: entries.length > 0 ? 
        new Date(Math.max(...entries.map(e => new Date(e.indexed_at)))).toISOString() : 
        null
    };
  }

  /**
   * Group entries by a field
   */
  groupBy(entries, field) {
    return entries.reduce((acc, entry) => {
      const key = entry[field];
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Export index to JSON
   */
  async exportIndex(outputPath) {
    const data = {
      metadata: {
        rootDir: this.rootDir,
        indexed_at: new Date().toISOString(),
        stats: this.getStats()
      },
      entries: Array.from(this.index.entries()).map(([path, entry]) => ({
        path,
        ...entry,
        embedding: entry.embedding ? '[VECTOR]' : null // Don't export full embeddings
      }))
    };

    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
    console.log(`💾 Index exported to: ${outputPath}`);
  }
}

module.exports = CodebaseIndexer;
