# 🚀 Gemini CLI Integration Guide

## Overview

This guide walks through setting up Gemini 2.5 CLI for the Amrikyy autonomous transformation project.

## Installation

### Step 1: Install Gemini CLI

```bash
# Install globally
npm install -g @google/generative-ai-cli

# Verify installation
gemini --version
```

### Step 2: Configure API Key

```bash
# Set your Gemini API key
gemini config set-api-key YOUR_GEMINI_API_KEY

# Verify configuration
gemini config list
```

### Step 3: Test Connection

```bash
# Simple test
echo "Hello, Gemini!" | gemini "Respond with 'Hello, Amrikyy!'"

# Expected output: Hello, Amrikyy!
```

## Project Integration

### Step 1: Initialize Project Context

```bash
# Navigate to project root
cd /workspaces/Amrikyy-Agent

# Initialize Gemini context (auto-generates GEMINI.md)
gemini /init

# This will analyze:
# - README.md
# - package.json
# - Project structure
# - Key files
```

### Step 2: Add Multiple Directories (if needed)

```bash
# If you have multiple related projects
gemini --include-directories /path/to/Amrikyy-Agent /path/to/AIX-Format

# Or dynamically in a session
gemini
> /directory add /path/to/other-project
```

### Step 3: Test Project Understanding

```bash
# Ask about the project
gemini "What is the architecture of Amrikyy Travel Agent?"

# Ask about specific files
gemini "Explain the AgentCoordinator.js file"

# Ask about implementation
gemini "How do I add a new MCP tool?"
```

## Use Cases for Automation

### 1. Intake Analyzer - Message Processing

```bash
# Extract structured data from messages
MESSAGE='أريد السفر إلى تركيا لمدة 7 أيام مع عائلتي (4 أشخاص) بميزانية 5000 دولار'

echo "$MESSAGE" | gemini --format json "
Extract travel request details:
- destination (string)
- dates (ISO 8601 range if mentioned, else null)
- budget (number in USD)
- travelers (number)
- preferences (array of strings)
Output ONLY valid JSON.
"

# Expected output:
# {
#   "destination": "Turkey",
#   "dates": null,
#   "budget": 5000,
#   "travelers": 4,
#   "preferences": ["family-friendly"]
# }
```

### 2. Document Verification - Passport OCR

```bash
# Extract passport data from OCR text
OCR_TEXT="PASSPORT
P<USADOE<<JOHN<<<<<<<<<<<<<<<<<<<<<<<<<
1234567890USA8001011M2501011<<<<<<<<<<<<<"

echo "$OCR_TEXT" | gemini --format json "
Extract passport details:
- documentType (string)
- fullName (string)
- documentNumber (string)
- nationality (string)
- expiryDate (ISO 8601)
Output ONLY valid JSON.
"
```

### 3. Deal Analysis - Ranking

```bash
# Analyze and rank travel deals
DEALS='[
  {"destination": "Paris", "price": 450, "discount": 30},
  {"destination": "Rome", "price": 380, "discount": 25},
  {"destination": "Barcelona", "price": 420, "discount": 35}
]'

echo "$DEALS" | gemini --format json "
Rank these travel deals by:
1. Value for money (discount %)
2. Popularity (destination demand)
3. Seasonality (is it good timing?)

Return top 3 deals with scores.
Output ONLY valid JSON array.
"
```

### 4. Disruption Analysis

```bash
# Analyze travel disruption and suggest solutions
DISRUPTION='{
  "flight": "AA123",
  "status": "delayed 4 hours",
  "weather": "severe storm",
  "destination": "Miami"
}'

echo "$DISRUPTION" | gemini --format json "
Analyze this travel disruption and suggest:
1. Severity level (1-10)
2. Impact on itinerary
3. Three rebooking options
4. Estimated additional cost
5. Recommended action
Output ONLY valid JSON.
"
```

### 5. Content Generation - Marketing

```bash
# Generate marketing content
DEAL='{
  "destination": "Istanbul",
  "price": 599,
  "originalPrice": 899,
  "discount": 33,
  "dates": "Nov 15-22"
}'

echo "$DEAL" | gemini "
Write an exciting Instagram post in Arabic for this travel deal.
Include:
- Catchy headline
- Key benefits
- Call to action
- Relevant emojis
Max 150 words.
"
```

## Integration with Node.js Backend

### Method 1: Direct CLI Execution

```javascript
// backend/services/automation/GeminiCLI.js
const { execSync } = require('child_process');

class GeminiCLI {
  static extract(text, prompt) {
    try {
      const command = `echo "${text}" | gemini --format json "${prompt}"`;
      const result = execSync(command, { encoding: 'utf-8' });
      return JSON.parse(result);
    } catch (error) {
      console.error('Gemini CLI error:', error);
      throw error;
    }
  }

  static async analyze(data, prompt) {
    const jsonData = JSON.stringify(data);
    const command = `echo '${jsonData}' | gemini --format json "${prompt}"`;
    const result = execSync(command, { encoding: 'utf-8' });
    return JSON.parse(result);
  }
}

module.exports = GeminiCLI;
```

### Method 2: SDK Integration

```javascript
// backend/services/automation/GeminiSDK.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiSDK {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
  }

  async extract(text, schema) {
    const prompt = `Extract the following from the text: ${JSON.stringify(schema)}
    
Text: ${text}

Output ONLY valid JSON matching the schema.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();
    
    return JSON.parse(jsonText);
  }

  async analyzeImage(imageBuffer, prompt) {
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg'
      }
    };

    const result = await this.model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text();
  }
}

module.exports = GeminiSDK;
```

## Intake Analyzer Implementation

### Complete Service

```javascript
// backend/services/automation/IntakeAnalyzer.js
const GeminiCLI = require('./GeminiCLI');
const supabase = require('../../database/supabase');
const logger = require('../../utils/logger');

class IntakeAnalyzer {
  static async processMessage(message) {
    try {
      logger.info('Processing message with Gemini CLI', { 
        messageId: message.id 
      });

      // Extract structured data
      const extracted = await GeminiCLI.extract(message.text, `
        Extract travel request details:
        - destination (string, null if not mentioned)
        - origin (string, null if not mentioned)
        - departureDate (ISO 8601, null if not mentioned)
        - returnDate (ISO 8601, null if not mentioned)
        - budget (number in USD, null if not mentioned)
        - travelers (number, default 1)
        - preferences (array of strings)
        - urgency (low/medium/high)
        
        Output ONLY valid JSON.
      `);

      // Validate extracted data
      const validated = this.validateExtraction(extracted);

      // Save to database
      const lead = await supabase.from('leads').insert({
        user_id: message.user_id,
        message_id: message.id,
        destination: validated.destination,
        origin: validated.origin,
        departure_date: validated.departureDate,
        return_date: validated.returnDate,
        budget: validated.budget,
        travelers: validated.travelers,
        preferences: validated.preferences,
        urgency: validated.urgency,
        raw_message: message.text,
        extracted_at: new Date().toISOString(),
        status: 'new'
      }).select().single();

      // Mark message as processed
      await supabase.from('messages')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('id', message.id);

      logger.info('Message processed successfully', { 
        leadId: lead.id,
        extraction: validated 
      });

      return {
        success: true,
        lead: lead,
        extraction: validated
      };

    } catch (error) {
      logger.error('Failed to process message', { 
        error: error.message,
        messageId: message.id 
      });

      throw error;
    }
  }

  static validateExtraction(data) {
    // Ensure required fields
    return {
      destination: data.destination || null,
      origin: data.origin || null,
      departureDate: data.departureDate || null,
      returnDate: data.returnDate || null,
      budget: data.budget ? Number(data.budget) : null,
      travelers: data.travelers ? Number(data.travelers) : 1,
      preferences: Array.isArray(data.preferences) ? data.preferences : [],
      urgency: ['low', 'medium', 'high'].includes(data.urgency) 
        ? data.urgency 
        : 'medium'
    };
  }

  static async processUnprocessedMessages() {
    try {
      // Fetch unprocessed messages
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('processed', false)
        .order('created_at', { ascending: true })
        .limit(10);

      if (!messages || messages.length === 0) {
        logger.info('No unprocessed messages found');
        return { processed: 0 };
      }

      logger.info(`Processing ${messages.length} unprocessed messages`);

      const results = [];
      for (const message of messages) {
        try {
          const result = await this.processMessage(message);
          results.push(result);
        } catch (error) {
          logger.error('Failed to process individual message', {
            messageId: message.id,
            error: error.message
          });
        }
      }

      return {
        processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.length - results.filter(r => r.success).length
      };

    } catch (error) {
      logger.error('Failed to process unprocessed messages', {
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = IntakeAnalyzer;
```

### Cron Job Setup

```javascript
// backend/jobs/intakeAnalyzerJob.js
const cron = require('node-cron');
const IntakeAnalyzer = require('../services/automation/IntakeAnalyzer');
const logger = require('../utils/logger');

// Run every minute
cron.schedule('* * * * *', async () => {
  try {
    logger.info('Running Intake Analyzer job');
    
    const result = await IntakeAnalyzer.processUnprocessedMessages();
    
    logger.info('Intake Analyzer job completed', result);
  } catch (error) {
    logger.error('Intake Analyzer job failed', {
      error: error.message
    });
  }
});

logger.info('Intake Analyzer cron job scheduled (every minute)');
```

### API Endpoint

```javascript
// backend/routes/automation.js
const express = require('express');
const router = express.Router();
const IntakeAnalyzer = require('../services/automation/IntakeAnalyzer');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/automation/process-message
 * Process a single message with Intake Analyzer
 */
router.post('/process-message', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        error: 'messageId is required'
      });
    }

    // Fetch message
    const { data: message } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    // Process message
    const result = await IntakeAnalyzer.processMessage(message);

    res.json(result);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/automation/process-batch
 * Process all unprocessed messages
 */
router.post('/process-batch', authenticateToken, async (req, res) => {
  try {
    const result = await IntakeAnalyzer.processUnprocessedMessages();

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
```

## Testing

### Test Intake Analyzer

```bash
# Test with sample message
curl -X POST http://localhost:5000/api/automation/process-message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "messageId": "msg_123"
  }'

# Expected response:
# {
#   "success": true,
#   "lead": { ... },
#   "extraction": {
#     "destination": "Turkey",
#     "budget": 5000,
#     "travelers": 4,
#     ...
#   }
# }
```

### Test Batch Processing

```bash
curl -X POST http://localhost:5000/api/automation/process-batch \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
# {
#   "success": true,
#   "processed": 10,
#   "successful": 9,
#   "failed": 1
# }
```

## Performance Optimization

### Caching

```javascript
// Cache Gemini responses for similar messages
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour

class IntakeAnalyzer {
  static async processMessage(message) {
    // Check cache
    const cacheKey = `extraction:${message.text}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      logger.info('Using cached extraction');
      return cached;
    }

    // Process with Gemini
    const result = await GeminiCLI.extract(message.text, prompt);
    
    // Cache result
    cache.set(cacheKey, result);
    
    return result;
  }
}
```

### Rate Limiting

```javascript
// Limit Gemini API calls
const Bottleneck = require('bottleneck');

const limiter = new Bottleneck({
  maxConcurrent: 5,  // Max 5 concurrent requests
  minTime: 200       // Min 200ms between requests
});

class GeminiCLI {
  static extract(text, prompt) {
    return limiter.schedule(() => {
      // Actual Gemini call
      const command = `echo "${text}" | gemini --format json "${prompt}"`;
      return execSync(command, { encoding: 'utf-8' });
    });
  }
}
```

## Monitoring

### Success Metrics

```javascript
// Track extraction accuracy
const metrics = {
  total: 0,
  successful: 0,
  failed: 0,
  avgProcessingTime: 0
};

class IntakeAnalyzer {
  static async processMessage(message) {
    const startTime = Date.now();
    metrics.total++;

    try {
      const result = await GeminiCLI.extract(message.text, prompt);
      metrics.successful++;
      
      const processingTime = Date.now() - startTime;
      metrics.avgProcessingTime = 
        (metrics.avgProcessingTime * (metrics.total - 1) + processingTime) / metrics.total;

      return result;
    } catch (error) {
      metrics.failed++;
      throw error;
    }
  }

  static getMetrics() {
    return {
      ...metrics,
      successRate: (metrics.successful / metrics.total * 100).toFixed(2) + '%'
    };
  }
}
```

## Troubleshooting

### Common Issues

**1. Gemini CLI not found:**
```bash
# Reinstall globally
npm install -g @google/generative-ai-cli

# Check PATH
echo $PATH
```

**2. API key not configured:**
```bash
# Set API key
gemini config set-api-key YOUR_KEY

# Verify
gemini config list
```

**3. JSON parsing errors:**
```javascript
// Add error handling
try {
  const result = JSON.parse(geminiOutput);
} catch (error) {
  logger.error('Failed to parse Gemini output', {
    output: geminiOutput,
    error: error.message
  });
  
  // Retry with stricter prompt
  const retryPrompt = `${originalPrompt}

CRITICAL: Output MUST be valid JSON. No markdown, no explanations.`;
}
```

**4. Rate limit exceeded:**
```javascript
// Implement exponential backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('rate limit')) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Next Steps

1. ✅ Install Gemini CLI
2. ✅ Configure API key
3. ✅ Test basic functionality
4. ✅ Implement Intake Analyzer
5. ✅ Setup cron job
6. ✅ Deploy to production
7. ✅ Monitor performance
8. ✅ Optimize based on metrics

## Resources

- **Gemini API Docs:** https://ai.google.dev/docs
- **CLI Documentation:** https://github.com/google/generative-ai-js
- **Best Practices:** https://ai.google.dev/docs/best_practices

---

**Status:** Ready for Implementation  
**Priority:** P0 - Critical  
**Estimated Time:** 1-2 days  
**Expected Impact:** 5-15 hours/day saved
