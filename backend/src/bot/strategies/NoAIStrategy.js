
const AIStrategy = require('./AIStrategy');

// Predefined responses, similar to telegram-bot-no-ai.js
const responses = {
  destinations: {
    'تركيا': '🇹🇷 تركيا وجهة رائعة!\n\n✨ أفضل الأماكن:\n• إسطنبول - المدينة التي تجمع بين الشرق والغرب\n• كابادوكيا - المناظر الطبيعية الخلابة\n• أنطاليا - الشواطئ الجميلة',
    'دبي': '🇦🇪 دبي - مدينة المستقبل!\n\n✨ أفضل الأماكن:\n• برج خليفة - أطول برج في العالم\n• دبي مول - أكبر مول تجاري\n• نخلة جميرا - جزيرة اصطناعية',
  },
  budgetAdvice: {
    low: '💰 ميزانية اقتصادية (أقل من $500)\n\n✅ نصائح:\n• اختر hostels أو فنادق 2-3 نجوم\n• استخدم المواصلات العامة\n• تناول الطعام في المطاعم المحلية',
  },
  default: '👋 شكراً لرسالتك!\n\nكيف يمكنني مساعدتك اليوم?'
};

/**
 * NoAIStrategy provides responses based on predefined rules and keywords.
 * It does not use any external AI service.
 */
class NoAIStrategy extends AIStrategy {
  constructor() {
    super('NoAI');
  }

  /**
   * Generates a response based on keywords in the message.
   * @param {string} message - The user's message.
   * @param {Array<object>} history - The conversation history (ignored in this strategy).
   * @returns {Promise<string>} The predefined response.
   */
  async generateResponse(message, history = []) {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes('تركيا') || lowerCaseMessage.includes('turkey')) {
      return responses.destinations['تركيا'];
    }
    if (lowerCaseMessage.includes('دبي') || lowerCaseMessage.includes('dubai')) {
      return responses.destinations['دبي'];
    }
    if (lowerCaseemessage.includes('ميزانية') || lowerCaseMessage.includes('budget')) {
      return responses.budgetAdvice.low; // Return a default budget advice
    }

    return responses.default;
  }

  /**
   * Returns a generic message as this strategy cannot generate deep insights.
   * @param {string} destination - The destination.
   * @returns {Promise<string>} A simple, predefined insight.
   */
  async getDestinationInsights(destination) {
    return responses.destinations[destination] || `معلومات حول ${destination} غير متوفرة حالياً في هذا الوضع.`;
  }

  /**
   * Health check for the NoAI strategy.
   * @returns {Promise<boolean>} Always returns true as it's self-contained.
   */
  async healthCheck() {
    return true;
  }
}

module.exports = NoAIStrategy;
