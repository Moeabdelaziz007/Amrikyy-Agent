/**
 * Amrikyy Agent - Simple Codebase Indexer (Node.js)
 * 
 * Optional Node.js helper to build file index programmatically.
 * Useful for additional processing (tokenization, hashing, etc.)
 * 
 * Usage:
 *   node .gitpod/scripts/build-simple-index.js [outdir]
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-23
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = process.cwd();
const outDir = process.argv[2] || '.gitpod/.index';
const exts = new Set([
  '.js', '.ts', '.json', '.py', '.go', '.java',
  '.jsx', '.tsx', '.md', '.html', '.css',
  '.yml', '.yaml', '.sh', '.env.example'
]);

// Directories to ignore
const ignoreDirs = new Set([
  'node_modules', '.git', 'dist', 'build', 'uploads',
  '.next', '.venv', 'coverage', '.cache'
]);

/**
 * Recursively walk directory tree
 */
function walk(dir, files = []) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip ignored directories
      if (ignoreDirs.has(entry.name)) {
        continue;
      }
      
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        walk(fullPath, files);
      } else {
        const ext = path.extname(entry.name);
        if (exts.has(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

/**
 * Calculate file hash (for change detection)
 */
function getFileHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

/**
 * Get file stats
 */
function getFileStats(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      modified: stats.mtime.toISOString(),
      created: stats.birthtime.toISOString()
    };
  } catch (error) {
    return null;
  }
}

/**
 * Build index with metadata
 */
function buildIndex() {
  console.log('🔍 [Amrikyy] Building codebase index (Node.js)...');
  
  // Ensure output directory exists
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  // Walk directory tree
  console.log('📁 [Amrikyy] Scanning files...');
  const files = walk(root);
  console.log(`📊 [Amrikyy] Found ${files.length} files`);
  
  // Build index with metadata
  const index = [];
  let processed = 0;
  
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(root, filePath);
      const stats = getFileStats(filePath);
      
      index.push({
        path: relativePath,
        content,
        hash: getFileHash(content),
        size: stats?.size || 0,
        lines: content.split('\n').length,
        extension: path.extname(filePath),
        modified: stats?.modified,
        created: stats?.created
      });
      
      processed++;
      
      // Show progress
      if (processed % 100 === 0) {
        console.log(`⏳ [Amrikyy] Processed ${processed}/${files.length} files...`);
      }
      
    } catch (error) {
      console.error(`❌ [Amrikyy] Error reading ${filePath}:`, error.message);
    }
  }
  
  // Write index
  const indexPath = path.join(outDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`✅ [Amrikyy] Index written: ${indexPath}`);
  
  // Write metadata
  const metadata = {
    timestamp: new Date().toISOString(),
    fileCount: index.length,
    totalSize: index.reduce((sum, f) => sum + f.size, 0),
    totalLines: index.reduce((sum, f) => sum + f.lines, 0),
    extensions: [...new Set(index.map(f => f.extension))],
    project: 'Amrikyy-Agent',
    version: '2.0.0'
  };
  
  const metadataPath = path.join(outDir, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`✅ [Amrikyy] Metadata written: ${metadataPath}`);
  
  // Summary
  console.log('');
  console.log('🎉 [Amrikyy] Indexing complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📁 Files indexed: ${metadata.fileCount}`);
  console.log(`📏 Total size: ${(metadata.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📝 Total lines: ${metadata.totalLines.toLocaleString()}`);
  console.log(`📄 Extensions: ${metadata.extensions.join(', ')}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
}

// Run if called directly
if (require.main === module) {
  buildIndex();
}

module.exports = { buildIndex, walk, getFileHash };
