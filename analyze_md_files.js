#!/usr/bin/env node
/**
 * Analyze markdown files for duplicates, outdated content, and redundancy.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getFileHash(filepath) {
    try {
        const content = fs.readFileSync(filepath);
        return crypto.createHash('md5').update(content).digest('hex');
    } catch (e) {
        return null;
    }
}

function getFileContent(filepath) {
    try {
        return fs.readFileSync(filepath, 'utf-8');
    } catch (e) {
        return '';
    }
}

function normalizeContent(content) {
    // Remove extra whitespace
    content = content.replace(/\s+/g, ' ');
    // Remove markdown formatting
    content = content.replace(/[#*_`\[\]()]/g, '');
    return content.toLowerCase().trim();
}

function calculateSimilarity(str1, str2) {
    const norm1 = normalizeContent(str1);
    const norm2 = normalizeContent(str2);
    
    if (norm1.length === 0 || norm2.length === 0) return 0;
    
    // Simple word-based similarity
    const words1 = new Set(norm1.split(/\s+/));
    const words2 = new Set(norm2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
}

function extractMetadata(filepath, content) {
    const lines = content.split('\n');
    const metadata = {
        path: filepath,
        size: content.length,
        lines: lines.length,
        title: '',
        headers: [],
        hasCode: content.includes('```'),
        hasLinks: content.includes('[') && content.includes(']('),
        wordCount: content.split(/\s+/).length,
        lastModified: 0
    };
    
    try {
        metadata.lastModified = fs.statSync(filepath).mtimeMs;
    } catch (e) {}
    
    // Extract title (first h1)
    for (const line of lines) {
        if (line.trim().startsWith('# ')) {
            metadata.title = line.trim().substring(2).trim();
            break;
        }
    }
    
    // Extract all headers
    for (const line of lines) {
        if (line.trim().startsWith('#')) {
            metadata.headers.push(line.trim());
        }
    }
    
    return metadata;
}

function findMarkdownFiles(rootDir) {
    const mdFiles = [];
    const skipDirs = new Set(['.git', 'node_modules', '.venv', 'venv', '__pycache__', 'dist', 'build']);
    
    function walk(dir) {
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                if (skipDirs.has(entry.name)) continue;
                
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    walk(fullPath);
                } else if (entry.isFile() && entry.name.endsWith('.md')) {
                    mdFiles.push(fullPath);
                }
            }
        } catch (e) {
            // Skip directories we can't read
        }
    }
    
    walk(rootDir);
    return mdFiles;
}

function analyzeFiles(rootDir) {
    console.log('Finding markdown files...');
    const mdFiles = findMarkdownFiles(rootDir);
    console.log(`Found ${mdFiles.length} markdown files`);
    
    // Collect file data
    const fileData = [];
    const hashMap = {};
    
    console.log('Analyzing files...');
    for (const filepath of mdFiles) {
        const content = getFileContent(filepath);
        const fileHash = getFileHash(filepath);
        const metadata = extractMetadata(filepath, content);
        
        fileData.push({
            filepath,
            content,
            hash: fileHash,
            metadata
        });
        
        if (fileHash) {
            if (!hashMap[fileHash]) {
                hashMap[fileHash] = [];
            }
            hashMap[fileHash].push(filepath);
        }
    }
    
    // Find exact duplicates
    const exactDuplicates = {};
    for (const [hash, files] of Object.entries(hashMap)) {
        if (files.length > 1) {
            exactDuplicates[hash] = files;
        }
    }
    
    // Find similar files (>80% similarity)
    console.log('Finding similar files...');
    const similarFiles = [];
    const checkedPairs = new Set();
    
    for (let i = 0; i < fileData.length; i++) {
        const data1 = fileData[i];
        
        for (let j = i + 1; j < fileData.length; j++) {
            const data2 = fileData[j];
            
            const pairKey = [data1.filepath, data2.filepath].sort().join('|');
            if (checkedPairs.has(pairKey)) continue;
            checkedPairs.add(pairKey);
            
            // Skip if exact duplicates
            if (data1.hash === data2.hash) continue;
            
            // Skip very small files
            if (data1.metadata.size < 100 || data2.metadata.size < 100) continue;
            
            const similarity = calculateSimilarity(data1.content, data2.content);
            if (similarity > 0.80) {
                similarFiles.push({
                    file1: data1.filepath,
                    file2: data2.filepath,
                    similarity,
                    size1: data1.metadata.size,
                    size2: data2.metadata.size
                });
            }
        }
        
        if (i % 50 === 0) {
            console.log(`  Processed ${i}/${fileData.length} files...`);
        }
    }
    
    // Sort similar files by similarity
    similarFiles.sort((a, b) => b.similarity - a.similarity);
    
    // Categorize files
    const rootLevelFiles = fileData.filter(f => path.dirname(f.filepath) === rootDir);
    const docsFiles = fileData.filter(f => f.filepath.includes('/docs/'));
    
    // Identify outdated patterns
    const outdatedPatterns = [];
    for (const data of fileData) {
        const filepath = data.filepath;
        const content = data.content.toLowerCase();
        
        // Check for outdated indicators
        if (content.includes('maya') && !content.includes('amrikyy')) {
            outdatedPatterns.push({
                file: filepath,
                reason: 'References old name "Maya" instead of "Amrikyy"'
            });
        }
        
        if (content.includes('todo') || content.includes('fixme') || content.includes('wip')) {
            outdatedPatterns.push({
                file: filepath,
                reason: 'Contains TODO/FIXME/WIP markers'
            });
        }
        
        if (content.includes('deprecated')) {
            outdatedPatterns.push({
                file: filepath,
                reason: 'Marked as deprecated'
            });
        }
    }
    
    // Generate report
    const report = {
        summary: {
            totalFiles: mdFiles.length,
            totalLines: fileData.reduce((sum, d) => sum + d.metadata.lines, 0),
            totalSize: fileData.reduce((sum, d) => sum + d.metadata.size, 0),
            rootLevelFiles: rootLevelFiles.length,
            docsFiles: docsFiles.length,
            exactDuplicates: Object.keys(exactDuplicates).length,
            similarFiles: similarFiles.length,
            outdatedFiles: outdatedPatterns.length
        },
        exactDuplicates,
        similarFiles: similarFiles.slice(0, 100),
        outdatedPatterns: outdatedPatterns.slice(0, 100),
        rootLevelFiles: rootLevelFiles.map(d => d.metadata),
        largestFiles: fileData
            .map(d => d.metadata)
            .sort((a, b) => b.size - a.size)
            .slice(0, 30)
    };
    
    return report;
}

// Main execution
const rootDir = '/workspaces/Amrikyy-Agent';
const report = analyzeFiles(rootDir);

// Save report
fs.writeFileSync(
    path.join(rootDir, 'md_analysis_report.json'),
    JSON.stringify(report, null, 2)
);

console.log('\n' + '='.repeat(80));
console.log('MARKDOWN FILES ANALYSIS REPORT');
console.log('='.repeat(80));
console.log(`\nTotal Files: ${report.summary.totalFiles}`);
console.log(`Total Lines: ${report.summary.totalLines.toLocaleString()}`);
console.log(`Total Size: ${report.summary.totalSize.toLocaleString()} bytes`);
console.log(`Root Level Files: ${report.summary.rootLevelFiles}`);
console.log(`Docs Directory Files: ${report.summary.docsFiles}`);

console.log(`\n${'='.repeat(80)}`);
console.log(`EXACT DUPLICATES: ${report.summary.exactDuplicates}`);
console.log('='.repeat(80));
let count = 0;
for (const [hash, files] of Object.entries(report.exactDuplicates)) {
    if (count++ >= 10) break;
    console.log(`\nDuplicate set (${files.length} files):`);
    for (const f of files) {
        console.log(`  - ${f.replace(rootDir, '')}`);
    }
}

console.log(`\n${'='.repeat(80)}`);
console.log(`SIMILAR FILES (>80% similarity): ${report.summary.similarFiles}`);
console.log('='.repeat(80));
for (const item of report.similarFiles.slice(0, 30)) {
    console.log(`\nSimilarity: ${(item.similarity * 100).toFixed(1)}%`);
    console.log(`  File 1: ${item.file1.replace(rootDir, '')} (${item.size1} bytes)`);
    console.log(`  File 2: ${item.file2.replace(rootDir, '')} (${item.size2} bytes)`);
}

console.log(`\n${'='.repeat(80)}`);
console.log(`POTENTIALLY OUTDATED FILES: ${report.summary.outdatedFiles}`);
console.log('='.repeat(80));
for (const item of report.outdatedPatterns.slice(0, 30)) {
    console.log(`\n${item.file.replace(rootDir, '')}`);
    console.log(`  Reason: ${item.reason}`);
}

console.log(`\n${'='.repeat(80)}`);
console.log('LARGEST FILES');
console.log('='.repeat(80));
for (const item of report.largestFiles.slice(0, 15)) {
    console.log(`\n${item.path.replace(rootDir, '')}`);
    console.log(`  Size: ${item.size.toLocaleString()} bytes, Lines: ${item.lines.toLocaleString()}, Words: ${item.wordCount.toLocaleString()}`);
    if (item.title) {
        console.log(`  Title: ${item.title}`);
    }
}

console.log('\n\nFull report saved to: md_analysis_report.json');
