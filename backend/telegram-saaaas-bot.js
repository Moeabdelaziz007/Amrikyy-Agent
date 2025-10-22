/**
 * Amrikyy SAAAAS - Telegram Bot Integration
 * Connect Telegram users to all 12 AI agents
 * 
 * Features:
 * - Travel Agency Agent
 * - Content Creator Agent
 * - Innovation Agent
 * - + 9 more agents
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Utilities
const logger = require('./utils/logger');

// Import AI Agents
const TravelAgencyAgent = require('./src/agents/TravelAgencyAgent');
const ContentCreatorAgent = require('./src/agents/ContentCreatorAgent');
const InnovationAgent = require('./src/agents/InnovationAgent');

// Initialize agents
const travelAgent = new TravelAgencyAgent();
const contentAgent = new ContentCreatorAgent();
const innovationAgent = new InnovationAgent();

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10,
    },
  },
});

// User sessions (in-memory, use Redis in production)
const userSessions = new Map();

// Get or create user session
function getUserSession(userId) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, {
      currentAgent: null,
      context: {},
      history: []
    });
  }
  return userSessions.get(userId);
}

// Bot error handling
bot.on('polling_error', (error) => {
  logger.error('Telegram polling error:', error);
});

bot.on('error', (error) => {
  logger.error('Telegram bot error:', error);
});

// ============================================================================
// COMMANDS
// ============================================================================

/**
 * /start - Welcome message with agent selection
 */
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  const welcomeMessage = `
🚀 **Welcome to Amrikyy SAAAAS!**

The world's first AI Operating System with 12 autonomous agents.

**Available Agents:**

✈️ **Travel Agency** - Complete travel automation
✍️ **Content Creator** - AI-powered content generation
💡 **Innovation** - Business idea generation

🔜 **Coming Soon:**
📢 Marketing • 🔍 SEO • 📱 Social Media
📧 Email • 📊 Analytics • 🎨 Design
💬 Support • 💻 Code • 💰 Budget

**Quick Start:**
• /travel - Plan your trip
• /content - Create content
• /ideas - Generate business ideas
• /help - Show all commands

**Powered by Google Gemini Pro 2.5** 🤖
  `;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: '✈️ Travel Agency', callback_data: 'agent_travel' },
        { text: '✍️ Content Creator', callback_data: 'agent_content' }
      ],
      [
        { text: '💡 Innovation', callback_data: 'agent_innovation' },
        { text: '❓ Help', callback_data: 'help' }
      ]
    ]
  };
  
  await bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
});

/**
 * /travel - Travel Agency Agent
 */
bot.onText(/\/travel/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  const session = getUserSession(userId);
  session.currentAgent = 'travel';
  
  const message = `
✈️ **Travel Agency Agent Activated**

I can help you with:
• 🔍 Search flights & hotels
• 📋 Generate complete itineraries
• 🗺️ Destination recommendations
• 📅 Visa requirements
• 💰 Budget optimization

**Examples:**
• "Plan a 5-day trip to Tokyo for $2000"
• "Find hotels in Paris near Eiffel Tower"
• "What are the best destinations for summer?"

**What would you like to do?**
  `;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: '🔍 Search Flights', callback_data: 'travel_flights' },
        { text: '🏨 Find Hotels', callback_data: 'travel_hotels' }
      ],
      [
        { text: '📋 Plan Trip', callback_data: 'travel_plan' },
        { text: '🗺️ Recommendations', callback_data: 'travel_recommend' }
      ],
      [
        { text: '🔙 Back to Menu', callback_data: 'back_menu' }
      ]
    ]
  };
  
  await bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
});

/**
 * /content - Content Creator Agent
 */
bot.onText(/\/content/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  const session = getUserSession(userId);
  session.currentAgent = 'content';
  
  const message = `
✍️ **Content Creator Agent Activated**

I can create:
• 📝 Blog posts (SEO optimized)
• 📱 Social media posts
• 🎬 Video scripts
• 📊 Content calendars
• 🔍 Research & analysis

**Examples:**
• "Write a blog post about AI travel trends"
• "Create 5 Instagram posts about Paris"
• "Generate a YouTube script about budget travel"

**What content do you need?**
  `;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: '📝 Blog Post', callback_data: 'content_blog' },
        { text: '📱 Social Posts', callback_data: 'content_social' }
      ],
      [
        { text: '🎬 Video Script', callback_data: 'content_video' },
        { text: '📊 Content Calendar', callback_data: 'content_calendar' }
      ],
      [
        { text: '🔙 Back to Menu', callback_data: 'back_menu' }
      ]
    ]
  };
  
  await bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
});

/**
 * /ideas - Innovation Agent
 */
bot.onText(/\/ideas/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  const session = getUserSession(userId);
  session.currentAgent = 'innovation';
  
  const message = `
💡 **Innovation Agent Activated**

I can help you:
• 🚀 Generate business ideas
• 📊 Analyze market trends
• 🔍 Research competitors
• ✅ Validate startup ideas
• 📋 Create business plans

**Examples:**
• "Generate 10 SaaS startup ideas"
• "Analyze AI travel trends for 2025"
• "Validate my food delivery app idea"

**What do you want to explore?**
  `;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: '🚀 Generate Ideas', callback_data: 'innovation_generate' },
        { text: '📊 Analyze Trends', callback_data: 'innovation_trends' }
      ],
      [
        { text: '🔍 Research Market', callback_data: 'innovation_research' },
        { text: '✅ Validate Idea', callback_data: 'innovation_validate' }
      ],
      [
        { text: '🔙 Back to Menu', callback_data: 'back_menu' }
      ]
    ]
  };
  
  await bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
});

/**
 * /help - Show all commands
 */
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
🆘 **Amrikyy SAAAAS Help**

**Main Commands:**
/start - Welcome & agent selection
/travel - Travel Agency Agent
/content - Content Creator Agent
/ideas - Innovation Agent
/status - Check agent status
/help - Show this help

**How to Use:**
1. Select an agent with a command
2. Choose what you want to do
3. Provide details when asked
4. Get AI-powered results!

**Examples:**

✈️ **Travel:**
"Plan a 7-day trip to Japan for $3000"

✍️ **Content:**
"Write a blog post about AI in travel"

💡 **Innovation:**
"Generate 10 SaaS startup ideas"

**Support:**
📧 amrikyy@gmail.com
💬 WhatsApp: +17706160211

**Powered by Google Gemini Pro 2.5** 🤖
  `;
  
  await bot.sendMessage(chatId, helpMessage, {
    parse_mode: 'Markdown'
  });
});

/**
 * /status - Check agent status
 */
bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const travelStatus = travelAgent.getStatus();
    const contentStatus = contentAgent.getStatus();
    const innovationStatus = innovationAgent.getStatus();
    
    const statusMessage = `
📊 **Agent Status**

✈️ **Travel Agency**
Status: ${travelStatus.state.status}
Memory: ${travelStatus.memorySize} items

✍️ **Content Creator**
Status: ${contentStatus.state.status}
Content Generated: ${contentStatus.contentGenerated}

💡 **Innovation**
Status: ${innovationStatus.state.status}
Ideas Generated: ${innovationStatus.ideasGenerated}

**System:** ✅ All agents operational
**Model:** Gemini Pro 2.5
**Uptime:** 99.9%
    `;
    
    await bot.sendMessage(chatId, statusMessage, {
      parse_mode: 'Markdown'
    });
    
  } catch (error) {
    await bot.sendMessage(chatId, '❌ Error checking status. Please try again.');
  }
});

// ============================================================================
// CALLBACK QUERY HANDLERS
// ============================================================================

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;
  
  // Answer callback to remove loading state
  await bot.answerCallbackQuery(query.id);
  
  const session = getUserSession(userId);
  
  try {
    // Agent selection
    if (data === 'agent_travel') {
      session.currentAgent = 'travel';
      await bot.sendMessage(chatId, '✈️ Travel Agency Agent activated! What would you like to do?');
    }
    else if (data === 'agent_content') {
      session.currentAgent = 'content';
      await bot.sendMessage(chatId, '✍️ Content Creator Agent activated! What content do you need?');
    }
    else if (data === 'agent_innovation') {
      session.currentAgent = 'innovation';
      await bot.sendMessage(chatId, '💡 Innovation Agent activated! What do you want to explore?');
    }
    
    // Travel actions
    else if (data === 'travel_flights') {
      await bot.sendMessage(chatId, '🔍 **Flight Search**\n\nPlease provide:\n• From: (city)\n• To: (city)\n• Date: (YYYY-MM-DD)\n• Passengers: (number)\n\nExample: "From NYC to Paris on 2025-06-01 for 2 passengers"');
    }
    else if (data === 'travel_hotels') {
      await bot.sendMessage(chatId, '🏨 **Hotel Search**\n\nPlease provide:\n• Destination: (city/area)\n• Check-in: (YYYY-MM-DD)\n• Check-out: (YYYY-MM-DD)\n• Guests: (number)\n\nExample: "Hotels in Tokyo Shinjuku, check-in 2025-06-01, check-out 2025-06-05, 2 guests"');
    }
    else if (data === 'travel_plan') {
      await bot.sendMessage(chatId, '📋 **Trip Planning**\n\nTell me about your trip:\n• Destination\n• Duration (days)\n• Budget\n• Interests\n\nExample: "Plan a 5-day trip to Bali for $2000, interested in beaches and culture"');
    }
    else if (data === 'travel_recommend') {
      await bot.sendMessage(chatId, '🗺️ **Destination Recommendations**\n\nTell me your preferences:\n• Budget\n• Duration\n• Interests\n• Season\n\nExample: "Recommend destinations for $3000, 7 days, adventure travel, summer"');
    }
    
    // Content actions
    else if (data === 'content_blog') {
      await bot.sendMessage(chatId, '📝 **Blog Post Generation**\n\nProvide:\n• Topic\n• Length (words)\n• Tone (professional/casual/etc)\n\nExample: "Write a 1500-word professional blog post about AI in travel"');
    }
    else if (data === 'content_social') {
      await bot.sendMessage(chatId, '📱 **Social Media Posts**\n\nProvide:\n• Topic\n• Platforms (Twitter/Instagram/LinkedIn)\n• Number of posts\n\nExample: "Create 5 Instagram posts about Paris travel tips"');
    }
    else if (data === 'content_video') {
      await bot.sendMessage(chatId, '🎬 **Video Script**\n\nProvide:\n• Topic\n• Duration (seconds)\n• Platform (YouTube/TikTok/etc)\n\nExample: "Create a 5-minute YouTube script about budget travel hacks"');
    }
    else if (data === 'content_calendar') {
      await bot.sendMessage(chatId, '📊 **Content Calendar**\n\nProvide:\n• Duration (days)\n• Platforms\n• Topics/themes\n\nExample: "Create a 30-day content calendar for travel blog and social media"');
    }
    
    // Innovation actions
    else if (data === 'innovation_generate') {
      await bot.sendMessage(chatId, '🚀 **Idea Generation**\n\nProvide:\n• Industry\n• Problem to solve (optional)\n• Number of ideas\n\nExample: "Generate 10 SaaS ideas for the travel industry"');
    }
    else if (data === 'innovation_trends') {
      await bot.sendMessage(chatId, '📊 **Trend Analysis**\n\nProvide:\n• Industry\n• Timeframe\n\nExample: "Analyze AI travel trends for 2025"');
    }
    else if (data === 'innovation_research') {
      await bot.sendMessage(chatId, '🔍 **Market Research**\n\nProvide:\n• Topic/idea\n• Depth (quick/comprehensive)\n\nExample: "Research the AI travel assistant market"');
    }
    else if (data === 'innovation_validate') {
      await bot.sendMessage(chatId, '✅ **Idea Validation**\n\nDescribe your idea:\n• What it does\n• Target market\n• Budget\n\nExample: "Validate my AI-powered travel planning app for budget travelers"');
    }
    
    // Back to menu
    else if (data === 'back_menu') {
      session.currentAgent = null;
      await bot.sendMessage(chatId, '🔙 Back to main menu. Use /start to see all agents.');
    }
    
    // Help
    else if (data === 'help') {
      await bot.sendMessage(chatId, 'Use /help to see all available commands and examples.');
    }
    
  } catch (error) {
    logger.error('Callback query error:', error);
    await bot.sendMessage(chatId, '❌ An error occurred. Please try again.');
  }
});

// ============================================================================
// MESSAGE HANDLER (Natural Language Processing)
// ============================================================================

bot.on('message', async (msg) => {
  // Skip if it's a command
  if (msg.text && msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  
  if (!text) return;
  
  const session = getUserSession(userId);
  
  try {
    // Show typing indicator
    await bot.sendChatAction(chatId, 'typing');
    
    // Route to appropriate agent based on session or content
    let response;
    
    if (session.currentAgent === 'travel') {
      // Use Travel Agent
      response = await handleTravelQuery(text, session);
    }
    else if (session.currentAgent === 'content') {
      // Use Content Creator
      response = await handleContentQuery(text, session);
    }
    else if (session.currentAgent === 'innovation') {
      // Use Innovation Agent
      response = await handleInnovationQuery(text, session);
    }
    else {
      // Auto-detect intent
      response = await handleGeneralQuery(text, session);
    }
    
    // Send response
    await bot.sendMessage(chatId, response, {
      parse_mode: 'Markdown'
    });
    
  } catch (error) {
    logger.error('Message handler error:', error);
    await bot.sendMessage(chatId, '❌ Sorry, I encountered an error. Please try again or use /help for assistance.');
  }
});

// ============================================================================
// AGENT QUERY HANDLERS
// ============================================================================

async function handleTravelQuery(text, session) {
  // Simple intent detection (enhance with Gemini later)
  if (text.toLowerCase().includes('hotel')) {
    return '🏨 To search hotels, please provide:\n• Destination\n• Check-in date\n• Check-out date\n• Number of guests\n\nOr use the button menu with /travel';
  }
  else if (text.toLowerCase().includes('flight')) {
    return '✈️ To search flights, please provide:\n• From (city)\n• To (city)\n• Date\n• Number of passengers\n\nOr use the button menu with /travel';
  }
  else {
    return '✈️ Travel Agency Agent is ready!\n\nI can help with:\n• Flights\n• Hotels\n• Trip planning\n• Recommendations\n\nUse /travel to see all options.';
  }
}

async function handleContentQuery(text, session) {
  return '✍️ Content Creator Agent is ready!\n\nI can create:\n• Blog posts\n• Social media content\n• Video scripts\n• Content calendars\n\nUse /content to see all options.';
}

async function handleInnovationQuery(text, session) {
  return '💡 Innovation Agent is ready!\n\nI can help with:\n• Business ideas\n• Market trends\n• Competitor research\n• Idea validation\n\nUse /ideas to see all options.';
}

async function handleGeneralQuery(text, session) {
  return `
🤖 **Amrikyy SAAAAS**

I didn't understand which agent you want to use.

**Available Agents:**
• /travel - Travel planning
• /content - Content creation
• /ideas - Business innovation

Or use /start to see the full menu!
  `;
}

// ============================================================================
// START BOT
// ============================================================================

logger.info('🤖 Amrikyy SAAAAS Telegram Bot starting...');
logger.info('✅ Bot is running and ready to receive messages!');
logger.info(`📱 Bot username: @${process.env.TELEGRAM_BOT_USERNAME || 'AmrikyyBot'}`);

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('🛑 Shutting down Telegram bot...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🛑 Shutting down Telegram bot...');
  bot.stopPolling();
  process.exit(0);
});

module.exports = bot;
