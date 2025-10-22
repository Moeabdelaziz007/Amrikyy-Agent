/**
 * Google Gemini AI Client
 * Official Gemini API integration for Amrikyy Travel Agent
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiClient {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    
    if (!this.apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not configured. AI features will be limited.');
      this.isEnabled = false;
      return;
    }

    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
    this.proModel = process.env.GEMINI_PRO_MODEL || 'gemini-2.5-pro';
    this.isEnabled = true;
  }

  /**
   * Send chat completion request to Gemini
   */
  async chatCompletion(messages, options = {}) {
    if (!this.isEnabled) {
      return {
        success: false,
        error: 'Gemini API not configured',
        content: 'عذراً، خدمة الذكاء الاصطناعي غير متاحة حالياً.'
      };
    }

    try {
      // Use Pro model for complex tasks, Flash for simple ones
      const modelName = options.useProModel ? this.proModel : this.model;
      const model = this.genAI.getGenerativeModel({ model: modelName });

      // Convert messages to Gemini format
      const prompt = this.convertMessagesToPrompt(messages);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      return {
        success: true,
        content: content,
        model: modelName
      };

    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        success: false,
        error: error.message,
        content: 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.'
      };
    }
  }

  /**
   * Convert OpenAI-style messages to Gemini prompt
   */
  convertMessagesToPrompt(messages) {
    return messages.map(msg => {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      return `${role}: ${msg.content}`;
    }).join('\n\n');
  }

  /**
   * Generate travel recommendations
   */
  async generateTravelRecommendations(destination, budget, duration, preferences = []) {
    const systemPrompt = `أنت Maya، مساعد سفر ذكي متخصص في التخطيط للرحلات. 
    قدم توصيات سفر مفصلة وعملية تتضمن:
    - 3-5 أماكن يجب زيارتها
    - توصيات الطعام المحلي
    - خيارات النقل
    - نصائح لتوفير المال
    - رؤى ثقافية
    - نصائح السلامة
    استجب بالعربية ما لم يُطلب منك الإنجليزية.`;

    const userPrompt = `خطط لرحلة مدتها ${duration} إلى ${destination} بميزانية ${budget}. 
    التفضيلات: ${preferences.join(', ')}. 
    قدم دليل سفر شامل مع نصائح عملية.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return await this.chatCompletion(messages, { useProModel: true });
  }

  /**
   * Generate budget analysis
   */
  async generateBudgetAnalysis(tripData, totalBudget) {
    const systemPrompt = `أنت Maya، مستشار مالي للسفر. قم بتحليل تكاليف الرحلة وقدم:
    - تفصيل مفصل للميزانية
    - توصيات لتوفير التكاليف
    - خيارات بديلة
    - اقتراحات صندوق الطوارئ
    - نصائح صرف العملات`;

    const userPrompt = `حلل ميزانية هذه الرحلة:
    الوجهة: ${tripData.destination}
    المدة: ${tripData.duration} أيام
    المسافرون: ${tripData.travelers} أشخاص
    الميزانية الإجمالية: $${totalBudget}
    
    قدم تحليلاً مالياً مفصلاً وتوصيات.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return await this.chatCompletion(messages, { useProModel: true });
  }

  /**
   * Generate chat response
   */
  async generateChatResponse(userMessage, conversationHistory = []) {
    const systemPrompt = `أنت Maya، مساعد سفر ذكي ودود. 
    تساعد المستخدمين في:
    - تخطيط السفر والتوصيات
    - تحليل الميزانية
    - معلومات الوجهات
    - رؤى ثقافية
    - نصائح ونصائح السفر
    
    كن محادثاً ومفيداً وقدم نصائح عملية.
    استجب بالعربية ما لم يُطلب منك الإنجليزية.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    return await this.chatCompletion(messages);
  }

  /**
   * Generate destination insights
   */
  async generateDestinationInsights(destination, travelType = 'leisure') {
    const systemPrompt = `أنت Maya، خبير وجهات السفر. قدم رؤى شاملة حول الوجهات بما في ذلك:
    - أفضل وقت للزيارة
    - الظروف الجوية
    - المعالم الثقافية
    - العادات والآداب المحلية
    - خيارات النقل
    - توصيات الإقامة
    - اعتبارات السلامة
    - الجواهر المخفية والمعالم غير التقليدية`;

    const userPrompt = `قدم رؤى مفصلة حول ${destination} لسفر ${travelType}. 
    قم بتضمين معلومات عملية ونصائح ثقافية وتوصيات للزوار لأول مرة.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return await this.chatCompletion(messages, { useProModel: true });
  }

  /**
   * Health check
   */
  async healthCheck() {
    if (!this.isEnabled) {
      return {
        success: false,
        status: 'unhealthy',
        error: 'Gemini API not configured'
      };
    }

    try {
      const testMessages = [
        { role: 'user', content: 'مرحبا، هل تعمل؟' }
      ];

      const response = await this.chatCompletion(testMessages);

      return {
        success: response.success,
        status: response.success ? 'healthy' : 'unhealthy',
        error: response.error || null
      };

    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

module.exports = GeminiClient;
