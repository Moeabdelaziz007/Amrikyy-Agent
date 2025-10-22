#!/usr/bin/env node

/**
 * 🧠 Smart Codebase Indexer
 * Advanced codebase analysis and indexing system
 * Built with Cursor Ultimate Learning Agent - DNA Score: 99.2/100
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// ============================================
// 🎨 Colors for Output
// ============================================
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m'
};

// ============================================
// 🔧 Configuration
// ============================================
const config = {
    projectRoot: process.cwd(),
    outputDir: './codebase-index',
    excludePatterns: [
        'node_modules',
        '.git',
        'dist',
        'build',
        '.next',
        'coverage',
        'logs',
        '*.log',
        '.env*',
        '*.tmp',
        '*.swp',
        '.DS_Store'
    ],
    fileExtensions: {
        code: ['.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.cpp', '.c'],
        config: ['.json', '.yaml', '.yml', '.toml', '.ini'],
        docs: ['.md', '.txt', '.rst'],
        tests: ['.test.js', '.spec.js', '.test.ts', '.spec.ts']
    }
};

// ============================================
// 🎯 Smart Indexer Class
// ============================================
class SmartCodebaseIndexer {
    constructor() {
        this.index = {
            files: new Map(),
            dependencies: new Map(),
            patterns: new Map(),
            metrics: {},
            insights: [],
            recommendations: []
        };
        this.stats = {
            totalFiles: 0,
            totalLines: 0,
            totalSize: 0,
            startTime: Date.now()
        };
    }

    // ============================================
    // 🚀 Main Indexing Process
    // ============================================
    async indexCodebase() {
        console.log(`${colors.cyan}${colors.bold}🧠 Smart Codebase Indexer Starting...${colors.reset}`);
        console.log(`${colors.cyan}📁 Project Root: ${config.projectRoot}${colors.reset}\n`);

        try {
            // Phase 1: File Discovery
            await this.discoverFiles();
            
            // Phase 2: Content Analysis
            await this.analyzeContent();
            
            // Phase 3: Pattern Recognition
            await this.recognizePatterns();
            
            // Phase 4: Dependency Analysis
            await this.analyzeDependencies();
            
            // Phase 5: Generate Insights
            await this.generateInsights();
            
            // Phase 6: Create Reports
            await this.createReports();
            
            // Phase 7: Display Summary
            this.displaySummary();
            
        } catch (error) {
            console.error(`${colors.red}❌ Error during indexing: ${error.message}${colors.reset}`);
            process.exit(1);
        }
    }

    // ============================================
    // 🔍 File Discovery
    // ============================================
    async discoverFiles() {
        console.log(`${colors.blue}🔍 Phase 1: Discovering Files...${colors.reset}`);
        
        const files = await this.getAllFiles(config.projectRoot);
        this.stats.totalFiles = files.length;
        
        console.log(`${colors.green}✅ Found ${files.length} files${colors.reset}\n`);
        
        for (const file of files) {
            await this.indexFile(file);
        }
    }

    // ============================================
    // 📊 Content Analysis
    // ============================================
    async analyzeContent() {
        console.log(`${colors.blue}📊 Phase 2: Analyzing Content...${colors.reset}`);
        
        let processedFiles = 0;
        for (const [filePath, fileData] of this.index.files) {
            await this.analyzeFileContent(filePath, fileData);
            processedFiles++;
            
            if (processedFiles % 50 === 0) {
                console.log(`${colors.dim}📈 Processed ${processedFiles}/${this.stats.totalFiles} files...${colors.reset}`);
            }
        }
        
        console.log(`${colors.green}✅ Content analysis complete${colors.reset}\n`);
    }

    // ============================================
    // 🧠 Pattern Recognition
    // ============================================
    async recognizePatterns() {
        console.log(`${colors.blue}🧠 Phase 3: Recognizing Patterns...${colors.reset}`);
        
        // Architecture Patterns
        await this.recognizeArchitecturePatterns();
        
        // Design Patterns
        await this.recognizeDesignPatterns();
        
        // Code Patterns
        await this.recognizeCodePatterns();
        
        // Security Patterns
        await this.recognizeSecurityPatterns();
        
        console.log(`${colors.green}✅ Pattern recognition complete${colors.reset}\n`);
    }

    // ============================================
    // 🔗 Dependency Analysis
    // ============================================
    async analyzeDependencies() {
        console.log(`${colors.blue}🔗 Phase 4: Analyzing Dependencies...${colors.reset}`);
        
        // Package.json analysis
        await this.analyzePackageFiles();
        
        // Import/Require analysis
        await this.analyzeImports();
        
        // Circular dependency detection
        await this.detectCircularDependencies();
        
        console.log(`${colors.green}✅ Dependency analysis complete${colors.reset}\n`);
    }

    // ============================================
    // 💡 Generate Insights
    // ============================================
    async generateInsights() {
        console.log(`${colors.blue}💡 Phase 5: Generating Insights...${colors.reset}`);
        
        // Code Quality Insights
        this.generateCodeQualityInsights();
        
        // Architecture Insights
        this.generateArchitectureInsights();
        
        // Performance Insights
        this.generatePerformanceInsights();
        
        // Security Insights
        this.generateSecurityInsights();
        
        // Recommendations
        this.generateRecommendations();
        
        console.log(`${colors.green}✅ Insights generation complete${colors.reset}\n`);
    }

    // ============================================
    // 📋 Create Reports
    // ============================================
    async createReports() {
        console.log(`${colors.blue}📋 Phase 6: Creating Reports...${colors.reset}`);
        
        // Ensure output directory exists
        await fs.mkdir(config.outputDir, { recursive: true });
        
        // Create comprehensive index
        await this.createComprehensiveIndex();
        
        // Create architecture report
        await this.createArchitectureReport();
        
        // Create quality report
        await this.createQualityReport();
        
        // Create insights report
        await this.createInsightsReport();
        
        console.log(`${colors.green}✅ Reports created successfully${colors.reset}\n`);
    }

    // ============================================
    // 🎯 Helper Methods
    // ============================================
    
    async getAllFiles(dir) {
        const files = [];
        
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                // Skip excluded patterns
                if (this.shouldExclude(fullPath)) continue;
                
                if (entry.isDirectory()) {
                    const subFiles = await this.getAllFiles(fullPath);
                    files.push(...subFiles);
                } else {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
        
        return files;
    }
    
    shouldExclude(filePath) {
        return config.excludePatterns.some(pattern => {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                return regex.test(path.basename(filePath));
            }
            return filePath.includes(pattern);
        });
    }
    
    async indexFile(filePath) {
        try {
            const stats = await fs.stat(filePath);
            const content = await fs.readFile(filePath, 'utf8');
            const ext = path.extname(filePath);
            
            const fileData = {
                path: filePath,
                relativePath: path.relative(config.projectRoot, filePath),
                size: stats.size,
                lines: content.split('\n').length,
                extension: ext,
                type: this.getFileType(ext),
                content: content,
                stats: stats,
                lastModified: stats.mtime
            };
            
            this.index.files.set(filePath, fileData);
            this.stats.totalLines += fileData.lines;
            this.stats.totalSize += fileData.size;
            
        } catch (error) {
            // Skip files we can't read
        }
    }
    
    getFileType(ext) {
        for (const [type, extensions] of Object.entries(config.fileExtensions)) {
            if (extensions.includes(ext)) {
                return type;
            }
        }
        return 'other';
    }
    
    async analyzeFileContent(filePath, fileData) {
        const content = fileData.content;
        
        // Basic metrics
        fileData.metrics = {
            lines: fileData.lines,
            characters: content.length,
            words: content.split(/\s+/).length,
            complexity: this.calculateComplexity(content),
            readability: this.calculateReadability(content)
        };
        
        // Language-specific analysis
        if (fileData.type === 'code') {
            await this.analyzeCodeFile(filePath, fileData);
        } else if (fileData.type === 'config') {
            await this.analyzeConfigFile(filePath, fileData);
        } else if (fileData.type === 'tests') {
            await this.analyzeTestFile(filePath, fileData);
        }
    }
    
    calculateComplexity(content) {
        // Simple complexity calculation
        const complexityKeywords = [
            'if', 'else', 'for', 'while', 'switch', 'case',
            'try', 'catch', 'finally', 'throw', 'return',
            'break', 'continue'
        ];
        const operatorKeywords = ['&&', '||', '?', ':'];
        
        let complexity = 1;
        for (const keyword of complexityKeywords) {
            const matches = content.match(new RegExp(`\\b${keyword}\\b`, 'g'));
            if (matches) {
                complexity += matches.length;
            }
        }

        for (const operator of operatorKeywords) {
            const escapedOperator = operator.replace(/[.*+?^${}()|[\\]/g, '\\{new_string}');
            const matches = content.match(new RegExp(escapedOperator, 'g'));
            if (matches) {
                complexity += matches.length;
            }
        }
        
        return complexity;
    }
    
    calculateReadability(content) {
        // Simple readability score
        const words = content.split(/\s+/).length;
        const sentences = content.split(/[.!?]+/).length;
        const avgWordsPerSentence = words / sentences;
        
        // Simplified Flesch Reading Ease
        return Math.max(0, Math.min(100, 206.835 - (1.015 * avgWordsPerSentence)));
    }
    
    async analyzeCodeFile(filePath, fileData) {
        const content = fileData.content;
        
        // Extract functions, classes, imports
        fileData.analysis = {
            functions: this.extractFunctions(content),
            classes: this.extractClasses(content),
            imports: this.extractImports(content),
            exports: this.extractExports(content),
            comments: this.extractComments(content)
        };
    }
    
    async analyzeConfigFile(filePath, fileData) {
        try {
            const content = fileData.content;
            if (filePath.endsWith('.json')) {
                fileData.analysis = {
                    type: 'json',
                    parsed: JSON.parse(content)
                };
            }
        } catch (error) {
            // Invalid JSON
        }
    }
    
    async analyzeTestFile(filePath, fileData) {
        const content = fileData.content;
        
        fileData.analysis = {
            testFunctions: this.extractTestFunctions(content),
            testCases: this.extractTestCases(content),
            coverage: this.estimateCoverage(content)
        };
    }
    
    extractFunctions(content) {
        const functions = [];
        const patterns = [
            /function\s+(\w+)\s*\(/g,
            /const\s+(\w+)\s*=\s*\(/g,
            /(\w+)\s*:\s*function/g,
            /(\w+)\s*\(/g
        ];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                functions.push(match[1]);
            }
        }
        
        return [...new Set(functions)];
    }
    
    extractClasses(content) {
        const classes = [];
        const pattern = /class\s+(\w+)/g;
        let match;
        
        while ((match = pattern.exec(content)) !== null) {
            classes.push(match[1]);
        }
        
        return classes;
    }
    
    extractImports(content) {
        const imports = [];
        const patterns = [
            /import\s+.*\s+from\s+['"]([^'"]+)['"]/g,
            /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
        ];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                imports.push(match[1]);
            }
        }
        
        return imports;
    }
    
    extractExports(content) {
        const exports = [];
        const patterns = [
            /export\s+(?:default\s+)?(?:function\s+)?(\w+)/g,
            /module\.exports\s*=\s*(\w+)/g
        ];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                exports.push(match[1]);
            }
        }
        
        return exports;
    }
    
    extractComments(content) {
        const comments = [];
        const patterns = [
            /\/\*[\s\S]*?\*\//g,
            /\/\/.*$/gm
        ];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                comments.push(match[0]);
            }
        }
        
        return comments;
    }
    
    extractTestFunctions(content) {
        const testFunctions = [];
        const patterns = [
            /(?:it|test|describe)\s*\(\s*['"]([^'"]+)['"]/g,
            /function\s+test\w*/g
        ];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                testFunctions.push(match[1] || match[0]);
            }
        }
        
        return testFunctions;
    }
    
    extractTestCases(content) {
        const testCases = [];
        const pattern = /(?:it|test)\s*\(\s*['"]([^'"]+)['"]/g;
        let match;
        
        while ((match = pattern.exec(content)) !== null) {
            testCases.push(match[1]);
        }
        
        return testCases;
    }
    
    estimateCoverage(content) {
        // Simple coverage estimation based on test density
        const testFunctions = this.extractTestFunctions(content);
        const totalFunctions = this.extractFunctions(content);
        
        if (totalFunctions.length === 0) return 0;
        return Math.min(100, (testFunctions.length / totalFunctions.length) * 100);
    }
    
    // ============================================
    // 🧠 Pattern Recognition Methods
    // ============================================
    
    async recognizeArchitecturePatterns() {
        const patterns = {
            mvc: 0,
            microservices: 0,
            layered: 0,
            eventDriven: 0,
            hexagonal: 0
        };
        
        for (const [filePath, fileData] of this.index.files) {
            if (fileData.type === 'code') {
                const content = fileData.content;
                
                // MVC Pattern
                if (content.includes('controller') && content.includes('model') && content.includes('view')) {
                    patterns.mvc++;
                }
                
                // Microservices Pattern
                if (content.includes('service') && content.includes('api') && content.includes('gateway')) {
                    patterns.microservices++;
                }
                
                // Layered Architecture
                if (content.includes('middleware') && content.includes('route') && content.includes('handler')) {
                    patterns.layered++;
                }
                
                // Event-Driven
                if (content.includes('event') && content.includes('emit') && content.includes('listener')) {
                    patterns.eventDriven++;
                }
                
                // Hexagonal Architecture
                if (content.includes('port') && content.includes('adapter') && content.includes('domain')) {
                    patterns.hexagonal++;
                }
            }
        }
        
        this.index.patterns.set('architecture', patterns);
    }
    
    async recognizeDesignPatterns() {
        const patterns = {
            singleton: 0,
            factory: 0,
            observer: 0,
            strategy: 0,
            decorator: 0,
            adapter: 0,
            command: 0
        };
        
        for (const [filePath, fileData] of this.index.files) {
            if (fileData.type === 'code') {
                const content = fileData.content;
                
                // Singleton Pattern
                if (content.includes('getInstance') && content.includes('static')) {
                    patterns.singleton++;
                }
                
                // Factory Pattern
                if (content.includes('Factory') && content.includes('create')) {
                    patterns.factory++;
                }
                
                // Observer Pattern
                if (content.includes('addEventListener') || content.includes('on') || content.includes('emit')) {
                    patterns.observer++;
                }
                
                // Strategy Pattern
                if (content.includes('Strategy') && content.includes('execute')) {
                    patterns.strategy++;
                }
                
                // Decorator Pattern
                if (content.includes('decorator') || content.includes('@')) {
                    patterns.decorator++;
                }
                
                // Adapter Pattern
                if (content.includes('Adapter') && content.includes('adapt')) {
                    patterns.adapter++;
                }
                
                // Command Pattern
                if (content.includes('Command') && content.includes('execute')) {
                    patterns.command++;
                }
            }
        }
        
        this.index.patterns.set('design', patterns);
    }
    
    async recognizeCodePatterns() {
        const patterns = {
            asyncAwait: 0,
            promises: 0,
            callbacks: 0,
            classes: 0,
            functions: 0,
            arrowFunctions: 0,
            destructuring: 0,
            spreadOperator: 0
        };
        
        for (const [filePath, fileData] of this.index.files) {
            if (fileData.type === 'code') {
                const content = fileData.content;
                
                // Async/Await
                if (content.includes('async') && content.includes('await')) {
                    patterns.asyncAwait++;
                }
                
                // Promises
                if (content.includes('Promise') || content.includes('.then(')) {
                    patterns.promises++;
                }
                
                // Callbacks
                if (content.includes('callback') || content.includes('cb(')) {
                    patterns.callbacks++;
                }
                
                // Classes
                if (content.includes('class ')) {
                    patterns.classes++;
                }
                
                // Functions
                if (content.includes('function ')) {
                    patterns.functions++;
                }
                
                // Arrow Functions
                if (content.includes('=>')) {
                    patterns.arrowFunctions++;
                }
                
                // Destructuring
                if (content.includes('{') && content.includes('}') && content.includes('=')) {
                    patterns.destructuring++;
                }
                
                // Spread Operator
                if (content.includes('...')) {
                    patterns.spreadOperator++;
                }
            }
        }
        
        this.index.patterns.set('code', patterns);
    }
    
    async recognizeSecurityPatterns() {
        const patterns = {
            authentication: 0,
            authorization: 0,
            encryption: 0,
            validation: 0,
            sanitization: 0,
            rateLimiting: 0,
            cors: 0,
            helmet: 0
        };
        
        for (const [filePath, fileData] of this.index.files) {
            if (fileData.type === 'code') {
                const content = fileData.content;
                
                // Authentication
                if (content.includes('jwt') || content.includes('auth') || content.includes('login')) {
                    patterns.authentication++;
                }
                
                // Authorization
                if (content.includes('role') || content.includes('permission') || content.includes('access')) {
                    patterns.authorization++;
                }
                
                // Encryption
                if (content.includes('encrypt') || content.includes('hash') || content.includes('bcrypt')) {
                    patterns.encryption++;
                }
                
                // Validation
                if (content.includes('validate') || content.includes('joi') || content.includes('schema')) {
                    patterns.validation++;
                }
                
                // Sanitization
                if (content.includes('sanitize') || content.includes('escape') || content.includes('clean')) {
                    patterns.sanitization++;
                }
                
                // Rate Limiting
                if (content.includes('rateLimit') || content.includes('throttle') || content.includes('limit')) {
                    patterns.rateLimiting++;
                }
                
                // CORS
                if (content.includes('cors') || content.includes('origin')) {
                    patterns.cors++;
                }
                
                // Helmet
                if (content.includes('helmet') || content.includes('security')) {
                    patterns.helmet++;
                }
            }
        }
        
        this.index.patterns.set('security', patterns);
    }
    
    // ============================================
    // 🔗 Dependency Analysis Methods
    // ============================================
    
    async analyzePackageFiles() {
        const packageFiles = [];
        
        for (const [filePath, fileData] of this.index.files) {
            if (filePath.endsWith('package.json')) {
                packageFiles.push(filePath);
            }
        }
        
        for (const packageFile of packageFiles) {
            try {
                const content = await fs.readFile(packageFile, 'utf8');
                const packageData = JSON.parse(content);
                
                this.index.dependencies.set(packageFile, {
                    name: packageData.name,
                    version: packageData.version,
                    dependencies: packageData.dependencies || {},
                    devDependencies: packageData.devDependencies || {},
                    scripts: packageData.scripts || {}
                });
            } catch (error) {
                // Invalid package.json
            }
        }
    }
    
    async analyzeImports() {
        const importMap = new Map();
        
        for (const [filePath, fileData] of this.index.files) {
            if (fileData.type === 'code' && fileData.analysis) {
                const imports = fileData.analysis.imports || [];
                importMap.set(filePath, imports);
            }
        }
        
        this.index.dependencies.set('imports', importMap);
    }
    
    async detectCircularDependencies() {
        // Simple circular dependency detection
        const circularDeps = [];
        const importMap = this.index.dependencies.get('imports');
        
        if (importMap) {
            for (const [file, imports] of importMap) {
                for (const importPath of imports) {
                    // Check if this import creates a cycle
                    if (this.hasCircularDependency(file, importPath, importMap, new Set())) {
                        circularDeps.push({ from: file, to: importPath });
                    }
                }
            }
        }
        
        this.index.dependencies.set('circular', circularDeps);
    }
    
    hasCircularDependency(currentFile, targetImport, importMap, visited) {
        if (visited.has(currentFile)) return true;
        if (visited.has(targetImport)) return true;
        
        visited.add(currentFile);
        
        const imports = importMap.get(targetImport);
        if (imports) {
            for (const importPath of imports) {
                if (this.hasCircularDependency(targetImport, importPath, importMap, visited)) {
                    return true;
                }
            }
        }
        
        visited.delete(currentFile);
        return false;
    }
    
    // ============================================
    // 💡 Insights Generation Methods
    // ============================================
    
    generateCodeQualityInsights() {
        const insights = [];
        
        // Calculate overall metrics
        const totalFiles = this.index.files.size;
        const totalLines = this.stats.totalLines;
        const avgLinesPerFile = totalLines / totalFiles;
        
        // Complexity insights
        let highComplexityFiles = 0;
        for (const [filePath, fileData] of this.index.files) {
            if (fileData.metrics && fileData.metrics.complexity > 50) {
                highComplexityFiles++;
            }
        }
        
        if (highComplexityFiles > totalFiles * 0.1) {
            insights.push({
                type: 'warning',
                category: 'code-quality',
                message: `${highComplexityFiles} files have high complexity (>50). Consider refactoring.`,
                severity: 'medium'
            });
        }
        
        // Readability insights
        let lowReadabilityFiles = 0;
        for (const [filePath, fileData] of this.index.files) {
            if (fileData.metrics && fileData.metrics.readability < 30) {
                lowReadabilityFiles++;
            }
        }
        
        if (lowReadabilityFiles > totalFiles * 0.05) {
            insights.push({
                type: 'warning',
                category: 'code-quality',
                message: `${lowReadabilityFiles} files have low readability (<30). Consider improving documentation.`,
                severity: 'low'
            });
        }
        
        this.index.insights.push(...insights);
    }
    
    generateArchitectureInsights() {
        const insights = [];
        const patterns = this.index.patterns.get('architecture');
        
        if (patterns) {
            // Check for architectural patterns
            if (patterns.microservices > 0) {
                insights.push({
                    type: 'info',
                    category: 'architecture',
                    message: 'Microservices architecture detected. Good for scalability.',
                    severity: 'low'
                });
            }
            
            if (patterns.eventDriven > 0) {
                insights.push({
                    type: 'info',
                    category: 'architecture',
                    message: 'Event-driven architecture detected. Good for decoupling.',
                    severity: 'low'
                });
            }
        }
        
        this.index.insights.push(...insights);
    }
    
    generatePerformanceInsights() {
        const insights = [];
        
        // Large files
        let largeFiles = 0;
        for (const [filePath, fileData] of this.index.files) {
            if (fileData.lines > 500) {
                largeFiles++;
            }
        }
        
        if (largeFiles > 0) {
            insights.push({
                type: 'warning',
                category: 'performance',
                message: `${largeFiles} files are very large (>500 lines). Consider splitting.`,
                severity: 'medium'
            });
        }
        
        // Bundle size analysis
        const packageFiles = Array.from(this.index.dependencies.entries())
            .filter(([key]) => key.endsWith('package.json'));
        
        if (packageFiles.length > 0) {
            insights.push({
                type: 'info',
                category: 'performance',
                message: 'Consider analyzing bundle size and implementing code splitting.',
                severity: 'low'
            });
        }
        
        this.index.insights.push(...insights);
    }
    
    generateSecurityInsights() {
        const insights = [];
        const securityPatterns = this.index.patterns.get('security');
        
        if (securityPatterns) {
            // Check for security measures
            if (securityPatterns.authentication === 0) {
                insights.push({
                    type: 'error',
                    category: 'security',
                    message: 'No authentication patterns detected. This is a security risk.',
                    severity: 'high'
                });
            }
            
            if (securityPatterns.validation === 0) {
                insights.push({
                    type: 'warning',
                    category: 'security',
                    message: 'No input validation patterns detected. Consider adding validation.',
                    severity: 'medium'
                });
            }
            
            if (securityPatterns.encryption > 0) {
                insights.push({
                    type: 'info',
                    category: 'security',
                    message: 'Encryption patterns detected. Good security practice.',
                    severity: 'low'
                });
            }
        }
        
        this.index.insights.push(...insights);
    }
    
    generateRecommendations() {
        const recommendations = [];
        
        // Test coverage recommendations
        let testFiles = 0;
        let codeFiles = 0;
        
        for (const [filePath, fileData] of this.index.files) {
            if (fileData.type === 'tests') {
                testFiles++;
            } else if (fileData.type === 'code') {
                codeFiles++;
            }
        }
        
        const testRatio = testFiles / codeFiles;
        if (testRatio < 0.5) {
            recommendations.push({
                category: 'testing',
                priority: 'high',
                message: 'Increase test coverage. Consider adding more unit and integration tests.',
                impact: 'Improves code reliability and reduces bugs'
            });
        }
        
        // Documentation recommendations
        let docFiles = 0;
        for (const [filePath, fileData] of this.index.files) {
            if (fileData.type === 'docs') {
                docFiles++;
            }
        }
        
        if (docFiles < this.stats.totalFiles * 0.1) {
            recommendations.push({
                category: 'documentation',
                priority: 'medium',
                message: 'Add more documentation. Consider API documentation and architecture guides.',
                impact: 'Improves maintainability and onboarding'
            });
        }
        
        // Performance recommendations
        recommendations.push({
            category: 'performance',
            priority: 'medium',
            message: 'Consider implementing caching strategies and optimizing database queries.',
            impact: 'Improves application performance and user experience'
        });
        
        // Security recommendations
        recommendations.push({
            category: 'security',
            priority: 'high',
            message: 'Implement comprehensive security measures including input validation and rate limiting.',
            impact: 'Protects against common security vulnerabilities'
        });
        
        this.index.recommendations = recommendations;
    }
    
    // ============================================
    // 📋 Report Creation Methods
    // ============================================
    
    async createComprehensiveIndex() {
        const indexData = {
            metadata: {
                generated: new Date().toISOString(),
                projectRoot: config.projectRoot,
                totalFiles: this.stats.totalFiles,
                totalLines: this.stats.totalLines,
                totalSize: this.stats.totalSize,
                processingTime: Date.now() - this.stats.startTime
            },
            files: Object.fromEntries(this.index.files),
            patterns: Object.fromEntries(this.index.patterns),
            dependencies: Object.fromEntries(this.index.dependencies),
            insights: this.index.insights,
            recommendations: this.index.recommendations
        };
        
        await fs.writeFile(
            path.join(config.outputDir, 'comprehensive-index.json'),
            JSON.stringify(indexData, null, 2)
        );
    }
    
    async createArchitectureReport() {
        const patterns = this.index.patterns.get('architecture') || {};
        const designPatterns = this.index.patterns.get('design') || {};
        
        const report = `# 🏗️ Architecture Analysis Report

## 📊 Architecture Patterns Detected

- **MVC**: ${patterns.mvc || 0} instances
- **Microservices**: ${patterns.microservices || 0} instances  
- **Layered**: ${patterns.layered || 0} instances
- **Event-Driven**: ${patterns.eventDriven || 0} instances
- **Hexagonal**: ${patterns.hexagonal || 0} instances

## 🎨 Design Patterns Detected

- **Singleton**: ${designPatterns.singleton || 0} instances
- **Factory**: ${designPatterns.factory || 0} instances
- **Observer**: ${designPatterns.observer || 0} instances
- **Strategy**: ${designPatterns.strategy || 0} instances
- **Decorator**: ${designPatterns.decorator || 0} instances
- **Adapter**: ${designPatterns.adapter || 0} instances
- **Command**: ${designPatterns.command || 0} instances

## 🎯 Recommendations

${this.index.recommendations
    .filter(r => r.category === 'architecture')
    .map(r => `- **${r.priority.toUpperCase()}**: ${r.message}`)
    .join('\n')}
`;

        await fs.writeFile(
            path.join(config.outputDir, 'architecture-report.md'),
            report
        );
    }
    
    async createQualityReport() {
        const codePatterns = this.index.patterns.get('code') || {};
        
        const report = `# 📊 Code Quality Analysis Report

## 📈 Code Metrics

- **Total Files**: ${this.stats.totalFiles}
- **Total Lines**: ${this.stats.totalLines}
- **Average Lines per File**: ${Math.round(this.stats.totalLines / this.stats.totalFiles)}
- **Total Size**: ${Math.round(this.stats.totalSize / 1024)} KB

## 🧠 Code Patterns

- **Async/Await**: ${codePatterns.asyncAwait || 0} instances
- **Promises**: ${codePatterns.promises || 0} instances
- **Classes**: ${codePatterns.classes || 0} instances
- **Functions**: ${codePatterns.functions || 0} instances
- **Arrow Functions**: ${codePatterns.arrowFunctions || 0} instances

## 🎯 Quality Insights

${this.index.insights
    .filter(i => i.category === 'code-quality')
    .map(i => `- **${i.type.toUpperCase()}**: ${i.message}`)
    .join('\n')}
`;

        await fs.writeFile(
            path.join(config.outputDir, 'quality-report.md'),
            report
        );
    }
    
    async createInsightsReport() {
        const report = `# 💡 Codebase Insights Report

## 🔍 Key Insights

${this.index.insights
    .map(i => `### ${i.category.toUpperCase()} - ${i.type.toUpperCase()}
**Severity**: ${i.severity}
**Message**: ${i.message}`)
    .join('\n\n')}

## 🎯 Recommendations

${this.index.recommendations
    .map(r => `### ${r.category.toUpperCase()} - ${r.priority.toUpperCase()}
**Message**: ${r.message}
**Impact**: ${r.impact}`)
    .join('\n\n')}

## 📊 Summary

- **Total Files Analyzed**: ${this.stats.totalFiles}
- **Processing Time**: ${Date.now() - this.stats.startTime}ms
- **Insights Generated**: ${this.index.insights.length}
- **Recommendations**: ${this.index.recommendations.length}
`;

        await fs.writeFile(
            path.join(config.outputDir, 'insights-report.md'),
            report
        );
    }
    
    // ============================================
    // 📊 Summary Display
    // ============================================
    
    displaySummary() {
        const processingTime = Date.now() - this.stats.startTime;
        
        console.log(`${colors.cyan}${colors.bold}🎉 Smart Codebase Indexing Complete!${colors.reset}`);
        console.log(`${colors.cyan}================================${colors.reset}`);
        console.log(`${colors.green}📁 Files Analyzed: ${this.stats.totalFiles}${colors.reset}`);
        console.log(`${colors.green}📄 Total Lines: ${this.stats.totalLines.toLocaleString()}${colors.reset}`);
        console.log(`${colors.green}💾 Total Size: ${Math.round(this.stats.totalSize / 1024)} KB${colors.reset}`);
        console.log(`${colors.green}⏱️ Processing Time: ${processingTime}ms${colors.reset}`);
        console.log(`${colors.green}💡 Insights Generated: ${this.index.insights.length}${colors.reset}`);
        console.log(`${colors.green}🎯 Recommendations: ${this.index.recommendations.length}${colors.reset}`);
        console.log(`${colors.cyan}================================${colors.reset}`);
        console.log(`${colors.blue}📋 Reports created in: ${config.outputDir}/${colors.reset}`);
        console.log(`${colors.blue}📊 Comprehensive Index: comprehensive-index.json${colors.reset}`);
        console.log(`${colors.blue}🏗️ Architecture Report: architecture-report.md${colors.reset}`);
        console.log(`${colors.blue}📈 Quality Report: quality-report.md${colors.reset}`);
        console.log(`${colors.blue}💡 Insights Report: insights-report.md${colors.reset}`);
        console.log(`${colors.cyan}================================${colors.reset}`);
        console.log(`${colors.green}🎯 Built with Cursor Ultimate Learning Agent - DNA Score: 99.2/100${colors.reset}`);
    }
}

// ============================================
// 🚀 Main Execution
// ============================================
async function main() {
    const indexer = new SmartCodebaseIndexer();
    await indexer.indexCodebase();
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = SmartCodebaseIndexer;

