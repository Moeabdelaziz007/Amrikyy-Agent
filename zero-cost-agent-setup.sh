#!/bin/bash
# ZERO-COST AI AGENT WORKFLOW - SETUP SCRIPT
# Complete automated setup for enterprise-grade AI capabilities at $0 cost

set -e

echo "🚀 Zero-Cost AI Agent Workflow Setup"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 18+ first."
    exit 1
fi
print_status "Node.js $(node --version) found"

if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install npm first."
    exit 1
fi
print_status "npm $(npm --version) found"

if ! command -v git &> /dev/null; then
    print_error "git not found. Please install git first."
    exit 1
fi
print_status "git $(git --version) found"

# Create project directory
PROJECT_DIR="zero-cost-agent"
print_info "Creating project directory: $PROJECT_DIR"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Initialize package.json
print_info "Initializing project..."
cat > package.json << 'EOF'
{
  "name": "zero-cost-agent",
  "version": "1.0.0",
  "description": "Zero-cost AI agent with maximum capabilities",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "setup": "node setup.js",
    "test": "node test.js"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "node-fetch": "^3.3.2",
    "@supabase/supabase-js": "^2.39.8",
    "mongodb": "^6.3.0"
  }
}
EOF

print_status "package.json created"

# Install dependencies
print_info "Installing dependencies..."
npm install

# Install MCP servers
print_info "Installing MCP servers (this may take a few minutes)..."

declare -a mcp_servers=(
    "@modelcontextprotocol/server-filesystem"
    "@modelcontextprotocol/server-github"
    "@modelcontextprotocol/server-brave-search"
    "@modelcontextprotocol/server-postgres"
    "@modelcontextprotocol/server-memory"
    "@modelcontextprotocol/server-puppeteer"
    "@modelcontextprotocol/server-sequential-thinking"
    "@modelcontextprotocol/server-google-maps"
    "@modelcontextprotocol/server-slack"
)

for server in "${mcp_servers[@]}"; do
    print_info "Installing $server..."
    npm install -g "$server" 2>/dev/null || print_warning "Failed to install $server globally, will use npx instead"
done

print_status "MCP servers installed"

# Create .env template
print_info "Creating environment configuration..."
cat > .env.example << 'EOF'
# ===========================================
# ZERO-COST AI AGENT - FREE API KEYS
# Get all these for FREE from the respective services
# ===========================================

# AI Models (All Free Tier)
# Get free key: https://huggingface.co/settings/tokens (30k tokens/month)
HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxx

# Get free key: https://console.groq.com (14,400 requests/day - UNLIMITED TOKENS)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx

# Get free key: https://api.together.xyz ($25 free credit)
TOGETHER_API_KEY=xxxxxxxxxxxxxxxxxxxxx

# Web Search (All Free)
# Get free key: https://brave.com/search/api/ (2000 queries/month)
BRAVE_API_KEY=BSAxxxxxxxxxxxxxxxxxxxxx

# Get free key: https://serper.dev (2500 free searches)
SERPER_API_KEY=xxxxxxxxxxxxxxxxxxxxx

# Code & Development
# Get free token: https://github.com/settings/tokens (5000 API calls/hour)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx

# Get free account: https://www.jdoodle.com/compiler-api (200 executions/day)
JDOODLE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx
JDOODLE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxx

# Data & Analytics
# Get free key: https://www.alphavantage.co/support/#api-key (25 requests/day)
ALPHA_VANTAGE_KEY=xxxxxxxxxxxxxxxxxxxxx

# Get free key: https://openweathermap.org/api (1000 calls/day)
OPENWEATHER_KEY=xxxxxxxxxxxxxxxxxxxxx

# Communication (All Completely Free)
# Create bot: https://t.me/botfather
TELEGRAM_BOT_TOKEN=xxxxxxxxxxxxxxxxxxxxx

# Create webhook: Discord Server Settings -> Integrations -> Webhooks
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxxxxxxxxxxxxxxxxxxxx

# Get token: https://api.slack.com/apps
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxxxxxxxxxxx

# Database (All Free Forever)
# Get free account: https://supabase.com (500MB + 2GB bandwidth/month)
SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=xxxxxxxxxxxxxxxxxxxxx

# Get free cluster: https://www.mongodb.com/cloud/atlas (512MB forever free)
MONGODB_URI=mongodb+srv://xxxxxxxxxxxxxxxxxxxxx

# Optional: PostgreSQL connection for postgres_mcp
POSTGRES_CONNECTION_STRING=postgresql://user:pass@host:5432/dbname

# Media & Images
# Get free key: https://unsplash.com/developers (50 requests/hour)
UNSPLASH_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxx

# Get free account: https://cloudinary.com (25GB storage + bandwidth)
CLOUDINARY_CLOUD=xxxxxxxxxxxxxxxxxxx
EOF

print_status "Environment template created"

# Create Kody Marketing Agent
print_info "Creating Kody Marketing Agent..."
cat > kody-marketing-agent.js << 'EOF'
#!/usr/bin/env node

/**
 * KODY - ZERO-COST MARKETING AGENT
 * Advanced AI marketing automation with real results
 * 
 * Capabilities:
 * - Web search and market analysis
 * - Social media monitoring
 * - Content generation
 * - Competitor analysis
 * - Trend identification
 * - Automated reporting
 */

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class KodyMarketingAgent {
    constructor() {
        this.name = "Kody";
        this.role = "Marketing Intelligence Agent";
        this.version = "1.0.0";
        this.capabilities = [
            "web_search",
            "market_analysis", 
            "competitor_research",
            "trend_identification",
            "content_generation",
            "social_monitoring",
            "report_generation"
        ];
        
        // Initialize clients
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );
        
        this.mongodb = new MongoClient(process.env.MONGODB_URI);
        
        // API endpoints
        this.apis = {
            brave: `https://api.search.brave.com/res/v1/web/search?key=${process.env.BRAVE_API_KEY}`,
            serper: `https://google.serper.dev/search`,
            groq: `https://api.groq.com/openai/v1/chat/completions`
        };
    }

    async searchWeb(query, engine = 'brave') {
        try {
            let response;
            
            if (engine === 'brave') {
                response = await fetch(`${this.apis.brave}&q=${encodeURIComponent(query)}`);
            } else {
                response = await fetch(this.apis.serper, {
                    method: 'POST',
                    headers: {
                        'X-API-KEY': process.env.SERPER_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ q: query })
                });
            }
            
            const data = await response.json();
            return this.processSearchResults(data, engine);
        } catch (error) {
            console.error('Search error:', error);
            return { error: error.message };
        }
    }

    processSearchResults(data, engine) {
        if (engine === 'brave') {
            return {
                results: data.web?.results?.map(result => ({
                    title: result.title,
                    url: result.url,
                    description: result.description,
                    age: result.age
                })) || [],
                total: data.web?.results?.length || 0
            };
        } else {
            return {
                results: data.organic?.map(result => ({
                    title: result.title,
                    url: result.link,
                    description: result.snippet,
                    position: result.position
                })) || [],
                total: data.organic?.length || 0
            };
        }
    }

    async analyzeMarket(query) {
        console.log(`🔍 Kody analyzing market: ${query}`);
        
        const searches = [
            `${query} market trends 2024`,
            `${query} competitor analysis`,
            `${query} customer reviews`,
            `${query} pricing strategies`,
            `${query} social media sentiment`
        ];

        const results = await Promise.all(
            searches.map(search => this.searchWeb(search))
        );

        return this.generateMarketReport(query, results);
    }

    generateMarketReport(topic, searchResults) {
        const report = {
            topic,
            timestamp: new Date().toISOString(),
            summary: `Market analysis for ${topic}`,
            insights: [],
            competitors: [],
            trends: [],
            recommendations: []
        };

        // Process search results
        searchResults.forEach((result, index) => {
            if (result.results) {
                result.results.forEach(item => {
                    if (item.title.toLowerCase().includes('competitor')) {
                        report.competitors.push(item);
                    } else if (item.title.toLowerCase().includes('trend')) {
                        report.trends.push(item);
                    } else {
                        report.insights.push(item);
                    }
                });
            }
        });

        // Generate recommendations
        report.recommendations = [
            "Focus on customer experience improvements",
            "Monitor competitor pricing strategies", 
            "Leverage emerging market trends",
            "Enhance social media presence",
            "Develop unique value propositions"
        ];

        return report;
    }

    async generateContent(topic, type = 'blog') {
        console.log(`✍️ Kody generating ${type} content for: ${topic}`);
        
        const prompt = `Create a ${type} about ${topic}. Include:
        1. Engaging headline
        2. Key points (3-5)
        3. Call-to-action
        4. SEO keywords
        5. Social media hooks`;

        try {
            const response = await fetch(this.apis.groq, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.1-70b-versatile',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

            const data = await response.json();
            return {
                content: data.choices[0].message.content,
                type,
                topic,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    async monitorSocialMedia(brand) {
        console.log(`📱 Kody monitoring social media for: ${brand}`);
        
        const queries = [
            `${brand} reviews`,
            `${brand} complaints`,
            `${brand} customer feedback`,
            `${brand} social media mentions`
        ];

        const results = await Promise.all(
            queries.map(query => this.searchWeb(query))
        );

        return this.analyzeSocialSentiment(brand, results);
    }

    analyzeSocialSentiment(brand, results) {
        const sentiment = {
            brand,
            timestamp: new Date().toISOString(),
            positive: 0,
            negative: 0,
            neutral: 0,
            mentions: []
        };

        results.forEach(result => {
            if (result.results) {
                result.results.forEach(item => {
                    const text = `${item.title} ${item.description}`.toLowerCase();
                    
                    if (text.includes('great') || text.includes('excellent') || text.includes('love')) {
                        sentiment.positive++;
                    } else if (text.includes('bad') || text.includes('terrible') || text.includes('hate')) {
                        sentiment.negative++;
                    } else {
                        sentiment.neutral++;
                    }
                    
                    sentiment.mentions.push({
                        title: item.title,
                        url: item.url,
                        description: item.description
                    });
                });
            }
        });

        return sentiment;
    }

    async runMarketingCampaign(topic) {
        console.log(`🚀 Kody starting marketing campaign for: ${topic}`);
        
        const campaign = {
            topic,
            startTime: new Date().toISOString(),
            status: 'running',
            results: {}
        };

        // Step 1: Market Analysis
        campaign.results.marketAnalysis = await this.analyzeMarket(topic);
        
        // Step 2: Content Generation
        campaign.results.content = await this.generateContent(topic, 'blog');
        
        // Step 3: Social Media Monitoring
        campaign.results.socialMedia = await this.monitorSocialMedia(topic);
        
        // Step 4: Competitor Analysis
        campaign.results.competitors = await this.searchWeb(`${topic} competitors`);
        
        campaign.endTime = new Date().toISOString();
        campaign.status = 'completed';
        
        return campaign;
    }

    async saveResults(data, collection = 'marketing_results') {
        try {
            await this.mongodb.connect();
            const db = this.mongodb.db('kody_marketing');
            const result = await db.collection(collection).insertOne(data);
            console.log(`💾 Results saved with ID: ${result.insertedId}`);
            return result.insertedId;
        } catch (error) {
            console.error('Save error:', error);
            return null;
        } finally {
            await this.mongodb.close();
        }
    }

    async generateReport(campaignId) {
        console.log(`📊 Kody generating report for campaign: ${campaignId}`);
        
        try {
            await this.mongodb.connect();
            const db = this.mongodb.db('kody_marketing');
            const campaign = await db.collection('marketing_results').findOne({ _id: campaignId });
            
            if (!campaign) {
                return { error: 'Campaign not found' };
            }

            const report = {
                campaignId,
                generatedAt: new Date().toISOString(),
                summary: `Marketing Report for ${campaign.topic}`,
                keyFindings: [
                    `Market analysis completed with ${campaign.results.marketAnalysis?.insights.length || 0} insights`,
                    `Content generated: ${campaign.results.content?.type || 'N/A'}`,
                    `Social sentiment: ${campaign.results.socialMedia?.positive || 0} positive, ${campaign.results.socialMedia?.negative || 0} negative`,
                    `Competitors identified: ${campaign.results.competitors?.results?.length || 0}`
                ],
                recommendations: [
                    'Continue monitoring market trends',
                    'Engage with positive social media mentions',
                    'Address negative feedback promptly',
                    'Develop content strategy based on insights'
                ],
                nextSteps: [
                    'Schedule follow-up analysis',
                    'Implement recommended strategies',
                    'Set up automated monitoring',
                    'Track campaign performance'
                ]
            };

            return report;
        } catch (error) {
            return { error: error.message };
        } finally {
            await this.mongodb.close();
        }
    }
}

// CLI Interface
async function main() {
    const kody = new KodyMarketingAgent();
    const args = process.argv.slice(2);
    const command = args[0];
    const topic = args[1];

    console.log(`🤖 ${kody.name} - ${kody.role} v${kody.version}`);
    console.log('=====================================');

    switch (command) {
        case 'analyze':
            if (!topic) {
                console.error('❌ Please provide a topic to analyze');
                process.exit(1);
            }
            const analysis = await kody.analyzeMarket(topic);
            console.log('📊 Market Analysis Results:');
            console.log(JSON.stringify(analysis, null, 2));
            break;

        case 'content':
            if (!topic) {
                console.error('❌ Please provide a topic for content generation');
                process.exit(1);
            }
            const content = await kody.generateContent(topic);
            console.log('✍️ Generated Content:');
            console.log(JSON.stringify(content, null, 2));
            break;

        case 'campaign':
            if (!topic) {
                console.error('❌ Please provide a topic for marketing campaign');
                process.exit(1);
            }
            const campaign = await kody.runMarketingCampaign(topic);
            const savedId = await kody.saveResults(campaign);
            console.log('🚀 Marketing Campaign Results:');
            console.log(JSON.stringify(campaign, null, 2));
            if (savedId) {
                console.log(`💾 Campaign saved with ID: ${savedId}`);
            }
            break;

        case 'monitor':
            if (!topic) {
                console.error('❌ Please provide a brand to monitor');
                process.exit(1);
            }
            const monitoring = await kody.monitorSocialMedia(topic);
            console.log('📱 Social Media Monitoring Results:');
            console.log(JSON.stringify(monitoring, null, 2));
            break;

        default:
            console.log(`
Usage: node kody-marketing-agent.js <command> <topic>

Commands:
  analyze <topic>    - Analyze market for a topic
  content <topic>    - Generate marketing content
  campaign <topic>   - Run full marketing campaign
  monitor <brand>    - Monitor social media for a brand

Examples:
  node kody-marketing-agent.js analyze "AI travel agents"
  node kody-marketing-agent.js content "sustainable tourism"
  node kody-marketing-agent.js campaign "Maya Travel Agent"
  node kody-marketing-agent.js monitor "Amrikyy"
            `);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default KodyMarketingAgent;
EOF

print_status "Kody Marketing Agent created"

# Create test script
print_info "Creating test script..."
cat > test-kody.js << 'EOF'
#!/usr/bin/env node

import KodyMarketingAgent from './kody-marketing-agent.js';

async function testKody() {
    console.log('🧪 Testing Kody Marketing Agent...\n');
    
    const kody = new KodyMarketingAgent();
    
    // Test 1: Market Analysis
    console.log('Test 1: Market Analysis');
    console.log('=======================');
    const analysis = await kody.analyzeMarket('AI travel agents');
    console.log('Results:', JSON.stringify(analysis, null, 2));
    console.log('\n');
    
    // Test 2: Content Generation
    console.log('Test 2: Content Generation');
    console.log('==========================');
    const content = await kody.generateContent('sustainable tourism', 'blog');
    console.log('Results:', JSON.stringify(content, null, 2));
    console.log('\n');
    
    // Test 3: Social Media Monitoring
    console.log('Test 3: Social Media Monitoring');
    console.log('================================');
    const monitoring = await kody.monitorSocialMedia('Amrikyy');
    console.log('Results:', JSON.stringify(monitoring, null, 2));
    console.log('\n');
    
    console.log('✅ All tests completed!');
}

testKody().catch(console.error);
EOF

print_status "Test script created"

# Create MCP configuration
print_info "Creating MCP configuration..."
cat > mcp-config.json << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/"]
    },
    "github": {
      "command": "npx", 
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${POSTGRES_CONNECTION_STRING}"
      }
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
EOF

print_status "MCP configuration created"

# Make scripts executable
chmod +x kody-marketing-agent.js
chmod +x test-kody.js

print_status "Scripts made executable"

echo ""
echo "🎉 Zero-Cost AI Agent Setup Complete!"
echo "====================================="
echo ""
print_status "Project directory: $PROJECT_DIR"
print_status "Kody Marketing Agent: Ready"
print_status "MCP servers: Installed"
print_status "Test script: Created"
echo ""
print_info "Next steps:"
echo "1. Copy .env.example to .env and add your API keys"
echo "2. Run: npm run test (to test Kody)"
echo "3. Run: node kody-marketing-agent.js campaign 'your topic'"
echo ""
print_warning "Remember: All API keys are FREE tier - no costs!"
echo ""
print_status "Setup completed successfully! 🚀"
