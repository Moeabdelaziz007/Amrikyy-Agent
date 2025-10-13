/**
 * Kelo AI API Client
 * Advanced AI provider for Maya Travel Agent
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
        source: 'maya-travel-agent'
      }
    }));
  }

  /**
   * Generate advanced travel recommendations with Kelo AI
   */
  async generateTravelRecommendations(destination, budget, duration, preferences = []) {
    const systemPrompt = `أنت Maya، مساعد سفر ذكي متقدم مدعوم بـ Kelo AI. 
    أنت خبير في:
    - التخطيط الذكي للرحلات
    - تحليل البيانات السياحية في الوقت الفعلي
    - التوصيات الشخصية المبنية على الذكاء الاصطناعي
    - تحليل الاتجاهات السياحية
    - إدارة المخاطر والسلامة
    
    قدم توصيات سفر متقدمة تتضمن:
    - 5-7 أماكن يجب زيارتها مع ترتيب الأولوية
    - خطة يومية مفصلة
    - توصيات الطعام المحلي مع التقييمات
    - خيارات النقل الذكية
    - نصائح توفير المال المبنية على البيانات
    - رؤى ثقافية عميقة
    - نصائح السلامة المحدثة
    - تنبؤات الطقس والظروف
    - نصائح التصوير والذكريات
    - توصيات الأنشطة الموسمية
    
    استخدم البيانات في الوقت الفعلي وقدم نصائح عملية ومحدثة.`;

    const userPrompt = `خطط لرحلة ذكية مدتها ${duration} أيام إلى ${destination} بميزانية ${budget}. 
    التفضيلات: ${preferences.join(', ')}. 
    قدم دليل سفر شامل مع خطة يومية مفصلة ونصائح ذكية.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.8,
      maxTokens: 2000
    });
  }

  /**
   * Generate intelligent budget analysis
   */
  async generateBudgetAnalysis(tripData, totalBudget) {
    const systemPrompt = `أنت Maya، مستشار مالي ذكي للسفر مدعوم بـ Kelo AI.
    أنت متخصص في:
    - تحليل الميزانيات السياحية الذكية
    - تحليل الاتجاهات السعرية
    - استراتيجيات توفير التكاليف المبنية على البيانات
    - إدارة المخاطر المالية
    - تحليل صرف العملات
    
    قدم تحليلاً مالياً متقدماً يتضمن:
    - تفصيل مفصل للميزانية مع التنبؤات
    - توصيات توفير التكاليف المبنية على البيانات
    - خيارات بديلة ذكية
    - اقتراحات صندوق الطوارئ
    - نصائح صرف العملات مع الأسعار الحالية
    - تحليل المخاطر المالية
    - استراتيجيات الحجز الذكية
    - نصائح التأمين على السفر`;

    const userPrompt = `حلل ميزانية هذه الرحلة بذكاء:
    الوجهة: ${tripData.destination}
    المدة: ${tripData.duration} أيام
    المسافرون: ${tripData.travelers} أشخاص
    الميزانية الإجمالية: $${totalBudget}
    نوع السفر: ${tripData.travelType || 'leisure'}
    
    قدم تحليلاً مالياً متقدماً مع توصيات ذكية.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.6,
      maxTokens: 1500
    });
  }

  /**
   * Generate intelligent chat response
   */
  async generateChatResponse(userMessage, conversationHistory = []) {
    const systemPrompt = `أنت Maya، مساعد سفر ذكي متقدم مدعوم بـ Kelo AI.
    أنت خبير في:
    - التخطيط الذكي للرحلات
    - تحليل البيانات السياحية
    - التوصيات الشخصية
    - إدارة المخاطر
    - الثقافات والوجهات العالمية
    
    تساعد المستخدمين في:
    - تخطيط السفر الذكي والتوصيات المتقدمة
    - تحليل الميزانية الذكي
    - معلومات الوجهات المحدثة
    - رؤى ثقافية عميقة
    - نصائح ونصائح السفر الذكية
    - إدارة المخاطر والسلامة
    - التوصيات الشخصية المبنية على الذكاء الاصطناعي
    
    كن محادثاً ومفيداً وقدم نصائح عملية ومتقدمة.
    استخدم البيانات في الوقت الفعلي وقدم إجابات شاملة.
    استجب بالعربية ما لم يُطلب منك الإنجليزية.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 1200
    });
  }

  /**
   * Generate comprehensive destination insights
   */
  async generateDestinationInsights(destination, travelType = 'leisure') {
    const systemPrompt = `أنت Maya، خبير وجهات السفر المتقدم مدعوم بـ Kelo AI.
    أنت متخصص في:
    - تحليل الوجهات السياحية الشامل
    - البيانات السياحية في الوقت الفعلي
    - تحليل الاتجاهات السياحية
    - إدارة المخاطر والسلامة
    - الثقافات والتقاليد المحلية
    
    قدم رؤى شاملة ومتقدمة حول الوجهات تتضمن:
    - أفضل وقت للزيارة مع التنبؤات
    - الظروف الجوية والمناخية المفصلة
    - المعالم الثقافية والتاريخية
    - العادات والآداب المحلية العميقة
    - خيارات النقل الذكية
    - توصيات الإقامة المبنية على البيانات
    - اعتبارات السلامة المحدثة
    - الجواهر المخفية والمعالم غير التقليدية
    - نصائح التصوير والذكريات
    - توصيات الأنشطة الموسمية
    - تحليل الاتجاهات السياحية`;

    const userPrompt = `قدم رؤى مفصلة ومتقدمة حول ${destination} لسفر ${travelType}. 
    قم بتضمين معلومات عملية ونصائح ثقافية وتوصيات للزوار لأول مرة.
    استخدم البيانات في الوقت الفعلي وقدم تحليلاً شاملاً.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.8,
      maxTokens: 2200
    });
  }

  /**
   * Generate intelligent payment recommendations
   */
  async generatePaymentRecommendations(tripDetails, paymentMethod = 'credit_card') {
    const systemPrompt = `أنت Maya، مستشار مالي ذكي للسفر مدعوم بـ Kelo AI.
    أنت متخصص في:
    - استراتيجيات الدفع الذكية للسفر
    - تحليل صرف العملات
    - إدارة المخاطر المالية
    - التوصيات المبنية على البيانات
    
    قدم نصائح الدفع والحجز المتقدمة تتضمن:
    - أفضل طرق الدفع للسفر مع التحليل
    - استراتيجيات صرف العملات الذكية
    - توصيات التأمين على السفر
    - نصائح توقيت الحجز المبنية على البيانات
    - نصائح دفع لتوفير التكاليف
    - اعتبارات الأمان المالية
    - تحليل المخاطر المالية
    - استراتيجيات إدارة الميزانية`;

    const userPrompt = `قدم توصيات الدفع والحجز الذكية لـ:
    الوجهة: ${tripDetails.destination}
    الميزانية: $${tripDetails.budget}
    المدة: ${tripDetails.duration} أيام
    الدفع المفضل: ${paymentMethod}
    نوع السفر: ${tripDetails.travelType || 'leisure'}
    
    قم بتضمين نصائح عملية للمدفوعات الآمنة والفعالة من حيث التكلفة.
    استخدم البيانات في الوقت الفعلي وقدم تحليلاً شاملاً.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.6,
      maxTokens: 1300
    });
  }

  /**
   * Generate real-time travel alerts and updates
   */
  async generateTravelAlerts(destination, travelDates) {
    const systemPrompt = `أنت Maya، نظام تنبيهات السفر الذكي مدعوم بـ Kelo AI.
    أنت متخصص في:
    - تحليل البيانات السياحية في الوقت الفعلي
    - إدارة المخاطر والتنبيهات
    - تحليل الاتجاهات السياحية
    - التوصيات المبنية على البيانات
    
    قدم تنبيهات سفر شاملة تتضمن:
    - تحذيرات السلامة المحدثة
    - تنبيهات الطقس
    - تحديثات القيود واللوائح
    - تنبيهات التكلفة
    - تحديثات النقل
    - تنبيهات الصحة
    - تحديثات الأحداث المحلية`;

    const userPrompt = `قدم تنبيهات سفر شاملة لـ ${destination} للفترة من ${travelDates.start} إلى ${travelDates.end}.
    قم بتضمين جميع التنبيهات المهمة والمحدثة.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.5,
      maxTokens: 1000
    });
  }

  /**
   * Generate personalized travel itinerary
   */
  async generatePersonalizedItinerary(userProfile, destination, duration) {
    const systemPrompt = `أنت Maya، مخطط رحلات شخصي ذكي مدعوم بـ Kelo AI.
    أنت متخصص في:
    - التخطيط الشخصي للرحلات
    - تحليل تفضيلات المستخدم
    - تحسين الجداول الزمنية
    - التوصيات المبنية على البيانات
    
    أنشئ خطة رحلة شخصية تتضمن:
    - جدول يومي مفصل
    - أنشطة مخصصة للتفضيلات
    - توصيات الطعام الشخصية
    - خيارات النقل المحسنة
    - نصائح توفير الوقت
    - توصيات التصوير
    - نصائح الثقافة المحلية`;

    const userPrompt = `أنشئ خطة رحلة شخصية لـ ${destination} مدتها ${duration} أيام.
    ملف المستخدم: ${JSON.stringify(userProfile)}
    قم بتخصيص الخطة حسب التفضيلات والاهتمامات.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return await this.chatCompletion(messages, {
      temperature: 0.8,
      maxTokens: 2500
    });
  }

  /**
   * Health check with advanced diagnostics
   */
  async healthCheck() {
    try {
      const testMessages = [
        { role: 'user', content: 'مرحبا، هل تعمل Kelo AI بشكل صحيح؟' }
      ];

      const response = await this.chatCompletion(testMessages, {
        maxTokens: 100,
        temperature: 0.1
      });

      return {
        success: response.success,
        status: response.success ? 'healthy' : 'unhealthy',
        error: response.error || null,
        model: response.model || this.model,
        usage: response.usage || null,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get model capabilities and information
   */
  async getModelInfo() {
    return {
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature,
      contextWindow: this.contextWindow,
      capabilities: [
        'travel_planning',
        'budget_analysis',
        'destination_insights',
        'payment_recommendations',
        'travel_alerts',
        'personalized_itinerary',
        'real_time_data',
        'multilingual_support'
      ],
      version: '2024-12',
      provider: 'Kelo AI'
    };
  }
}

module.exports = KeloClient;