#!/usr/bin/env node

/**
 * Generate Mini Agent Services using Gemini 2.5 Pro
 * Reads GEMINI_MINI_AGENTS_PROMPT.md and sends to Gemini API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  try {
    log('\n🚀 Starting Mini Agent Services Generation...', 'bright');
    log('━'.repeat(60), 'cyan');

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      log('\n❌ Error: GEMINI_API_KEY not found in environment variables', 'red');
      log('Please set your Gemini API key:', 'yellow');
      log('export GEMINI_API_KEY=your-api-key-here\n', 'cyan');
      process.exit(1);
    }

    // Read the prompt file
    log('\n📄 Reading prompt file...', 'blue');
    const promptPath = path.join(__dirname, '..', 'GEMINI_MINI_AGENTS_PROMPT.md');
    const prompt = fs.readFileSync(promptPath, 'utf8');
    log(`✅ Loaded prompt (${prompt.length} characters)`, 'green');

    // Initialize Gemini
    log('\n🤖 Initializing Gemini 2.5 Pro...', 'blue');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp', // Using flash for speed, can switch to gemini-2.5-pro
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });
    log('✅ Gemini initialized', 'green');

    // Send prompt to Gemini
    log('\n💭 Sending prompt to Gemini...', 'blue');
    log('⏳ This may take 30-60 seconds...', 'yellow');
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    log(`✅ Received response (${response.length} characters)`, 'green');

    // Save response
    const outputDir = path.join(__dirname, '..', 'gemini-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(outputDir, `mini-agents-${timestamp}.md`);
    
    fs.writeFileSync(outputFile, response, 'utf8');
    log(`\n💾 Response saved to: ${outputFile}`, 'green');

    // Display summary
    log('\n' + '━'.repeat(60), 'cyan');
    log('📊 GENERATION SUMMARY', 'bright');
    log('━'.repeat(60), 'cyan');
    log(`Prompt size: ${prompt.length} characters`, 'blue');
    log(`Response size: ${response.length} characters`, 'blue');
    log(`Output file: ${outputFile}`, 'blue');
    log('━'.repeat(60), 'cyan');

    // Show preview
    log('\n📝 RESPONSE PREVIEW:', 'bright');
    log('━'.repeat(60), 'cyan');
    const preview = response.substring(0, 500);
    log(preview, 'cyan');
    if (response.length > 500) {
      log('\n... (truncated, see full output in file)', 'yellow');
    }
    log('━'.repeat(60), 'cyan');

    log('\n✅ Generation complete!', 'green');
    log('\n📋 Next steps:', 'bright');
    log('1. Review the generated code in: ' + outputFile, 'cyan');
    log('2. Extract agent classes and save to backend/src/agents/', 'cyan');
    log('3. Extract UI components and save to frontend/src/components/', 'cyan');
    log('4. Test the agents individually', 'cyan');
    log('5. Deploy to production\n', 'cyan');

  } catch (error) {
    log('\n❌ Error during generation:', 'red');
    log(error.message, 'red');
    if (error.stack) {
      log('\nStack trace:', 'yellow');
      log(error.stack, 'yellow');
    }
    process.exit(1);
  }
}

// Run the script
main();
