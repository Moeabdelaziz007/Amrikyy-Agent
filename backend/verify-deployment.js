#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Verifies that the server is properly configured for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('DEPLOYMENT VERIFICATION');
console.log('='.repeat(80));
console.log();

let allChecks = true;

// 1. Check server.js exists and has route registration
console.log('1️⃣  Checking server.js configuration...');
const serverPath = path.join(__dirname, 'server.js');
if (!fs.existsSync(serverPath)) {
  console.log('   ❌ server.js not found!');
  allChecks = false;
} else {
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Check for route registration
  const hasRouteRegistration = serverContent.includes('app.use(\'/api/');
  const hasErrorHandling = serverContent.includes('loadRoute') || serverContent.includes('try {');
  const hasHealthCheck = serverContent.includes('/api/health');
  
  if (hasRouteRegistration && hasErrorHandling && hasHealthCheck) {
    console.log('   ✅ server.js properly configured');
    console.log('      • Route registration: ✅');
    console.log('      • Error handling: ✅');
    console.log('      • Health check: ✅');
  } else {
    console.log('   ⚠️  server.js configuration incomplete');
    if (!hasRouteRegistration) console.log('      • Missing route registration');
    if (!hasErrorHandling) console.log('      • Missing error handling');
    if (!hasHealthCheck) console.log('      • Missing health check');
    allChecks = false;
  }
}
console.log();

// 2. Check package.json has start script
console.log('2️⃣  Checking package.json...');
const packagePath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packagePath)) {
  console.log('   ❌ package.json not found!');
  allChecks = false;
} else {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.start) {
    console.log(`   ✅ Start script configured: "${packageJson.scripts.start}"`);
  } else {
    console.log('   ❌ No start script found in package.json');
    allChecks = false;
  }
  
  // Check for required dependencies
  const requiredDeps = ['express', 'cors', 'dotenv'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length === 0) {
    console.log('   ✅ Core dependencies present');
  } else {
    console.log(`   ⚠️  Missing dependencies: ${missingDeps.join(', ')}`);
  }
}
console.log();

// 3. Check Railway/Vercel configurations
console.log('3️⃣  Checking deployment configurations...');
const railwayPath = path.join(__dirname, 'railway.json');
if (fs.existsSync(railwayPath)) {
  const railwayConfig = JSON.parse(fs.readFileSync(railwayPath, 'utf8'));
  console.log('   ✅ Railway configuration found');
  console.log(`      • Health check: ${railwayConfig.deploy?.healthcheckPath || 'not set'}`);
  console.log(`      • Start command: ${railwayConfig.deploy?.startCommand || 'not set'}`);
} else {
  console.log('   ⚠️  No railway.json found (optional)');
}
console.log();

// 4. Check routes directory
console.log('4️⃣  Checking routes directory...');
const routesDir = path.join(__dirname, 'routes');
if (!fs.existsSync(routesDir)) {
  console.log('   ❌ routes/ directory not found!');
  allChecks = false;
} else {
  const routeFiles = fs.readdirSync(routesDir)
    .filter(file => file.endsWith('.js') && !file.endsWith('.test.js'));
  console.log(`   ✅ ${routeFiles.length} route files found`);
}
console.log();

// 5. Check environment template
console.log('5️⃣  Checking environment configuration...');
const envExamplePath = path.join(__dirname, '.env.example');
const envTemplatePath = path.join(__dirname, '.env.template');
if (fs.existsSync(envExamplePath) || fs.existsSync(envTemplatePath)) {
  console.log('   ✅ Environment template found');
} else {
  console.log('   ⚠️  No .env.example or .env.template found');
}
console.log();

// 6. Read route deployment report if exists
console.log('6️⃣  Checking route deployment report...');
const reportPath = path.join(__dirname, 'route-deployment-report.json');
if (fs.existsSync(reportPath)) {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  console.log('   ✅ Route deployment report found');
  console.log(`      • Total routes: ${report.totalRoutes}`);
  console.log(`      • Total endpoints: ${report.totalEndpoints}`);
  console.log(`      • Properly configured: ${report.properlyConfigured}`);
} else {
  console.log('   ⚠️  No route deployment report (run check-routes-deploy.js)');
}
console.log();

// Final summary
console.log('='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log();

if (allChecks) {
  console.log('✅ ALL CHECKS PASSED - Ready for deployment!');
  console.log();
  console.log('Next steps:');
  console.log('1. Set environment variables in your deployment platform');
  console.log('2. Deploy backend to Railway/Render/Heroku');
  console.log('3. Test health endpoint: curl https://your-domain/api/health');
  console.log('4. Verify routes are accessible');
  console.log();
  process.exit(0);
} else {
  console.log('❌ SOME CHECKS FAILED - Review issues above');
  console.log();
  console.log('Fix the issues before deploying!');
  console.log();
  process.exit(1);
}
