/**
 * Kelo AI API Client
 * Advanced AI provider for Amrikyy Travel Agent
 * Replaces Gemini 2.5 with enhanced capabilities
 */

const fetch = require('node-fetch');

class KeloClient {
  constructor() {
    this.apiKey = process.env.KELO_API_KEY;
    this.baseUrl = process.env.KELO_BASE_URL || 'https://api.kelo.ai/v1';
    this.model = process.env.KELO_MODEL || 'kelo-travel-pro';
    this.maxTokens = parseInt(process.env.KELO_MAX_TOKENS) || 3000;
    this.temperature = parseFloat(process.env.KELO_TEMPERATURE) || 0.7;
    this.contextWindow = parseInt(process.env.KELO_CONTEXT_WINDOW) || 8000;
  }

  /**
   * Send chat completion request to Kelo AI
   */
  async chatCompletion(messages, options = {}) {
    try {
      // Convert messages to Kelo format
      const contents = this.convertMessagesToKelo(messages);
      
      const requestBody = {
        model: this.model,
        messages: contents,
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature || this.temperature,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        stream: false,
        context_window: this.contextWindow
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Kelo-Version': '2024-12'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Kelo API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Extract content from response
      const content = data.choices?.[0]?.message?.content || 'No response generated';
      
      return {
        success: true,
        data: data,
        content: content,
        usage: data.usage,
        model: data.model
      };

    } catch (error) {
      console.error('Kelo API Error:', error);
      return {
        success: false,
        error: error.message,
        content: 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.'
      };
    }
  }

  /**
   * Convert OpenAI-style messages to Kelo format
   */
  convertMessagesToKelo(messages) {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'amrikyy-travel-agent'
      }
    }));
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

    return await this.chatCompletion(messages, {
      temperature: 0.8,
      maxTokens: 1500
    });
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

    return await this.chatCompletion(messages, {
      temperature: 0.6,
      maxTokens: 1200
    });
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

    return await this.chatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 1000
    });
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

    return await this.chatCompletion(messages, {
      temperature: 0.8,
      maxTokens: 1800
    });
  }

  /**
   * Generate payment recommendations
   */
  async generatePaymentRecommendations(tripDetails, paymentMethod = 'credit_card') {
    const systemPrompt = `أنت Maya، مستشار مالي للسفر. قدم نصائح الدفع والحجز بما في ذلك:
    - أفضل طرق الدفع للسفر
    - استراتيجيات صرف العملات
    - توصيات التأمين على السفر
    - نصائح توقيت الحجز
    - نصائح دفع لتوفير التكاليف
    - اعتبارات الأمان`;

    const userPrompt = `قدم توصيات الدفع والحجز لـ:
    الوجهة: ${tripDetails.destination}
    الميزانية: $${tripDetails.budget}
    المدة: ${tripDetails.duration} أيام
    الدفع المفضل: ${paymentMethod}
    
    قم بتضمين نصائح عملية للمدفوعات الآمنة والفعالة من حيث التكلفة.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.6,
      maxTokens: 1000
    });
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const testMessages = [
        { role: 'user', content: 'مرحبا، هل تعمل؟' }
      ];

      const response = await this.chatCompletion(testMessages, {
        maxTokens: 50,
        temperature: 0.1
      });

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
