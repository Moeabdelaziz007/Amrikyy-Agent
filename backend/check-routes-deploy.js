const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('ROUTE DEPLOYMENT VALIDATION');
console.log('='.repeat(80));
console.log();

// Get all route files
const routesDir = path.join(process.cwd(), 'routes');
const routeFiles = fs.readdirSync(routesDir)
  .filter(file => file.endsWith('.js') && !file.endsWith('.test.js'));

console.log(`📁 Found ${routeFiles.length} route files in /routes directory:\n`);

const routeInfo = [];

routeFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if it exports a router
  const hasModuleExports = content.includes('module.exports');
  const hasRouter = content.includes('express.Router()') || content.includes('router =');
  const routeName = file.replace('.js', '');
  
  // Count endpoints
  const getCount = (content.match(/router\.get\(/g) || []).length;
  const postCount = (content.match(/router\.post\(/g) || []).length;
  const putCount = (content.match(/router\.put\(/g) || []).length;
  const deleteCount = (content.match(/router\.delete\(/g) || []).length;
  const patchCount = (content.match(/router\.patch\(/g) || []).length;
  
  const totalEndpoints = getCount + postCount + putCount + deleteCount + patchCount;
  
  routeInfo.push({
    name: routeName,
    file,
    hasRouter,
    hasModuleExports,
    endpoints: {
      GET: getCount,
      POST: postCount,
      PUT: putCount,
      DELETE: deleteCount,
      PATCH: patchCount,
      total: totalEndpoints
    }
  });
});

// Check server.js
const serverPath = path.join(process.cwd(), 'server.js');
const serverContent = fs.readFileSync(serverPath, 'utf8');

console.log('📋 Route Files Analysis:\n');
console.log('┌' + '─'.repeat(78) + '┐');
console.log('│ Route Name                │ Status │ GET POST PUT DEL PATCH │ Total │');
console.log('├' + '─'.repeat(78) + '┤');

let properRoutes = 0;
let totalEndpoints = 0;

routeInfo.forEach(route => {
  const status = route.hasRouter && route.hasModuleExports ? '✅ OK' : '⚠️  FIX';
  const endpoints = route.endpoints;
  const line = `│ ${route.name.padEnd(25)} │ ${status}  │ ${String(endpoints.GET).padStart(3)} ${String(endpoints.POST).padStart(4)} ${String(endpoints.PUT).padStart(3)} ${String(endpoints.DELETE).padStart(3)} ${String(endpoints.PATCH).padStart(5)} │ ${String(endpoints.total).padStart(5)} │`;
  console.log(line);
  
  if (route.hasRouter && route.hasModuleExports) {
    properRoutes++;
    totalEndpoints += endpoints.total;
  }
});

console.log('└' + '─'.repeat(78) + '┘');
console.log();

console.log('📊 Summary:');
console.log(`   • Total route files: ${routeFiles.length}`);
console.log(`   • Properly configured: ${properRoutes}`);
console.log(`   • Total endpoints: ${totalEndpoints}`);
console.log();

// Check which routes are used in server.js
console.log('🔌 Server.js Route Registration:\n');

const usedRoutes = [];
routeInfo.forEach(route => {
  // Check for various route registration patterns
  const patterns = [
    new RegExp(`require.*routes/${route.name}`, 'i'),
    new RegExp(`app\\.use.*/${route.name}`, 'i'),
    new RegExp(`loadRoute.*routes/${route.name}`, 'i'),
    new RegExp(`${route.name.replace(/-/g, '')}:.*require`, 'i')
  ];
  
  if (patterns.some(pattern => pattern.test(serverContent))) {
    usedRoutes.push(route.name);
  }
});

if (usedRoutes.length > 0) {
  console.log(`   ✅ Routes registered in server.js: ${usedRoutes.length} routes`);
  console.log(`      (Use production server with loadRoute for graceful error handling)`);
} else {
  console.log(`   ⚠️  NO ROUTES ARE REGISTERED IN SERVER.JS`);
  console.log(`   ⚠️  The server.js file appears to be a basic MVP implementation`);
}

console.log();

// List unregistered routes
const unregisteredRoutes = routeInfo
  .filter(r => r.hasRouter && r.hasModuleExports)
  .map(r => r.name)
  .filter(name => !usedRoutes.includes(name));

if (unregisteredRoutes.length > 0) {
  console.log('❌ Routes NOT registered in server.js:');
  console.log();
  unregisteredRoutes.forEach(route => {
    const info = routeInfo.find(r => r.name === route);
    console.log(`   • ${route} (${info.endpoints.total} endpoints)`);
  });
  console.log();
  console.log(`   Total unregistered: ${unregisteredRoutes.length} routes with ${
    unregisteredRoutes.reduce((sum, name) => {
      const info = routeInfo.find(r => r.name === name);
      return sum + info.endpoints.total;
    }, 0)
  } endpoints`);
}

console.log();
console.log('='.repeat(80));
console.log('RECOMMENDATIONS FOR DEPLOYMENT:');
console.log('='.repeat(80));
console.log();

if (unregisteredRoutes.length > 0) {
  console.log('⚠️  ISSUE FOUND:');
  console.log(`   The server.js file is a basic MVP version and does not register`);
  console.log(`   ${unregisteredRoutes.length} available route modules with ${totalEndpoints} endpoints.`);
  console.log();
  console.log('💡 SUGGESTED ACTIONS:');
  console.log('   1. Review which routes are needed for production deployment');
  console.log('   2. Create a production-ready server.js that imports required routes');
  console.log('   3. Or document which routes are intentionally excluded from MVP');
  console.log();
  console.log('📝 Example to register a route:');
  console.log('   const authRoutes = require("./routes/auth");');
  console.log('   app.use("/api/auth", authRoutes);');
} else {
  console.log('✅ All routes appear to be properly registered!');
}

console.log();
console.log('='.repeat(80));

// Save report to file
const report = {
  timestamp: new Date().toISOString(),
  totalRoutes: routeFiles.length,
  properlyConfigured: properRoutes,
  totalEndpoints: totalEndpoints,
  registeredInServer: usedRoutes.length,
  unregisteredRoutes: unregisteredRoutes,
  routes: routeInfo
};

fs.writeFileSync('route-deployment-report.json', JSON.stringify(report, null, 2));
console.log('📄 Detailed report saved to: route-deployment-report.json');
console.log();

process.exit(unregisteredRoutes.length > 0 ? 1 : 0);
