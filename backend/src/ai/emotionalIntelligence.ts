// ============================================
// نظام الذكاء العاطفي لـ Amrikyy - Production Ready
// يحلل مشاعر المستخدم ويكيف استجابات AI
// ============================================

import emotionalKeywords from './emotional-keywords.json';

// ===== Types =====
interface UserMessage {
  content: string;
  timestamp: Date;
  responseTime?: number; // milliseconds
}

interface EmotionalSignals {
  excitement: number; // 0-10
  stress: number; // 0-10
  confusion: number; // 0-10
  urgency: number; // 0-10
  budget_anxiety: number; // 0-10
}

type EmotionalState =
  | 'متحمس'
  | 'متوتر'
  | 'مرتبك'
  | 'قلق_ميزانية'
  | 'محايد'
  | 'احتفالي';

interface AdaptiveResponse {
  systemPromptAddition: string;
  uiTheme: {
    primaryColor: string;
    secondaryColor: string;
    animation: 'excited' | 'calm' | 'guided' | 'fast';
  };
  recommendations: {
    maxOptions: number;
    sortBy: 'best' | 'cheapest' | 'popular' | 'unique';
    showComparison: boolean;
  };
  narrationStyle: {
    tone: string;
    useEmojis: boolean;
    responseSpeed: 'instant' | 'normal' | 'detailed';
  };
}

interface ChatCompletionRequest {
  messages: Array<{ role: string; content: string }>;
  model: string;
  max_tokens: number;
  temperature?: number;
}

interface EmotionalCache {
  state: EmotionalState;
  timestamp: number;
}

// ===== Configuration Constants =====
const CONFIG = {
  MAX_HISTORY: 50, // Maximum conversation history
  CACHE_TTL: 60000, // 1 minute cache
  API_TIMEOUT: 10000, // 10 seconds
  ANALYSIS_WINDOW: 5, // Analyze last 5 messages

  THRESHOLDS: {
    STRESS_HIGH: 6,
    BUDGET_ANXIETY_HIGH: 7,
    CONFUSION_HIGH: 6,
    EXCITEMENT_HIGH: 7,
    URGENCY_HIGH: 6,
  },

  SCORING: {
    EXCITEMENT_WORD: 1.5,
    EXCITEMENT_EMOJI: 0.5,
    STRESS_WORD: 2,
    STRESS_SHORT_MESSAGE: 0.5,
    CONFUSION_WORD: 2,
    CONFUSION_QUESTION: 1.5,
    URGENCY_WORD: 3,
    URGENCY_NIGHT_HOURS: 2,
    BUDGET_WORD: 2,
    BUDGET_DISCOUNT: 2,
  },
} as const;

// ============================================
// Emotional Intelligence Engine
// ============================================
class EmotionalIntelligenceEngine {
  private emotionalCache = new Map<string, EmotionalCache>();

  /**
   * تحليل رسائل المستخدم للكشف عن الحالة العاطفية
   */
  detectEmotionalState(messages: UserMessage[]): EmotionalState {
    // Input validation
    if (!messages || messages.length === 0) {
      return 'محايد';
    }

    // Check cache
    const cacheKey = this.createCacheKey(messages);
    const cached = this.emotionalCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_TTL) {
      return cached.state;
    }

    // Analyze signals
    const signals = this.analyzeSignals(messages);

    // خوارزمية الأولوية: الإجهاد أولاً (يحتاج تدخل فوري)
    let state: EmotionalState;
    if (signals.stress > CONFIG.THRESHOLDS.STRESS_HIGH) {
      state = 'متوتر';
    } else if (signals.budget_anxiety > CONFIG.THRESHOLDS.BUDGET_ANXIETY_HIGH) {
      state = 'قلق_ميزانية';
    } else if (signals.confusion > CONFIG.THRESHOLDS.CONFUSION_HIGH) {
      state = 'مرتبك';
    } else if (signals.excitement > CONFIG.THRESHOLDS.EXCITEMENT_HIGH) {
      state = 'متحمس';
    } else if (this.detectCelebration(messages)) {
      state = 'احتفالي';
    } else {
      state = 'محايد';
    }

    // Cache result
    this.emotionalCache.set(cacheKey, { state, timestamp: Date.now() });

    // Clean old cache entries
    this.cleanCache();

    return state;
  }

  /**
   * تحليل الإشارات العاطفية من المحادثة
   */
  private analyzeSignals(messages: UserMessage[]): EmotionalSignals {
    const recentMessages = messages.slice(-CONFIG.ANALYSIS_WINDOW);

    return {
      excitement: this.calculateExcitement(recentMessages),
      stress: this.calculateStress(recentMessages),
      confusion: this.calculateConfusion(recentMessages),
      urgency: this.calculateUrgency(recentMessages),
      budget_anxiety: this.calculateBudgetAnxiety(recentMessages),
    };
  }

  /**
   * حساب مستوى الحماس
   */
  private calculateExcitement(messages: UserMessage[]): number {
    let score = 0;
    const keywords = [
      ...emotionalKeywords.excitement.ar,
      ...emotionalKeywords.excitement.en,
      ...emotionalKeywords.excitement.emojis,
    ];

    messages.forEach((msg) => {
      const content = msg.content.toLowerCase();

      // عد الكلمات المتحمسة
      keywords.forEach((word) => {
        if (content.includes(word.toLowerCase())) {
          score += CONFIG.SCORING.EXCITEMENT_WORD;
        }
      });

      // علامات التعجب المتعددة = حماس عالي
      const exclamationCount = (content.match(/!/g) || []).length;
      score += Math.min(exclamationCount, 3);

      // الرموز التعبيرية الإيجابية
      const emojiCount = (content.match(/[😍🎉✨🤩💕❤️]/g) || []).length;
      score += emojiCount * CONFIG.SCORING.EXCITEMENT_EMOJI;
    });

    return Math.min(score, 10);
  }

  /**
   * حساب مستوى التوتر
   */
  private calculateStress(messages: UserMessage[]): number {
    let score = 0;
    const keywords = [
      ...emotionalKeywords.stress.ar,
      ...emotionalKeywords.stress.en,
      ...emotionalKeywords.stress.emojis,
    ];

    messages.forEach((msg) => {
      const content = msg.content.toLowerCase();

      // كلمات التوتر
      keywords.forEach((word) => {
        if (content.includes(word.toLowerCase())) {
          score += CONFIG.SCORING.STRESS_WORD;
        }
      });

      // الرد السريع جداً = توتر محتمل
      if (msg.responseTime && msg.responseTime < 3000) {
        score += 1;
      }

      // الجمل القصيرة المتتالية
      if (content.length < 30) {
        score += CONFIG.SCORING.STRESS_SHORT_MESSAGE;
      }

      // أسئلة متعددة في رسالة واحدة
      const questionCount = (content.match(/[؟?]/g) || []).length;
      if (questionCount > 2) {
        score += questionCount;
      }
    });

    return Math.min(score, 10);
  }

  /**
   * حساب مستوى الحيرة/الارتباك
   */
  private calculateConfusion(messages: UserMessage[]): number {
    let score = 0;
    const keywords = [
      ...emotionalKeywords.confusion.ar,
      ...emotionalKeywords.confusion.en,
      ...emotionalKeywords.confusion.emojis,
    ];

    messages.forEach((msg) => {
      const content = msg.content.toLowerCase();

      // كلمات الحيرة
      keywords.forEach((word) => {
        if (content.includes(word.toLowerCase())) {
          score += CONFIG.SCORING.CONFUSION_WORD;
        }
      });

      // أسئلة كثيرة
      const questionCount = (content.match(/[؟?]/g) || []).length;
      score += Math.min(questionCount * CONFIG.SCORING.CONFUSION_QUESTION, 5);

      // تكرار نفس السؤال
      const repeatedQuestions = messages.filter(
        (m) => this.calculateSimilarity(m.content, msg.content) > 0.7
      ).length;
      if (repeatedQuestions > 1) {
        score += 3;
      }
    });

    return Math.min(score, 10);
  }

  /**
   * حساب مستوى الاستعجال
   */
  private calculateUrgency(messages: UserMessage[]): number {
    let score = 0;
    const keywords = [
      ...emotionalKeywords.urgency.ar,
      ...emotionalKeywords.urgency.en,
    ];

    messages.forEach((msg) => {
      const content = msg.content.toLowerCase();

      // كلمات الاستعجال
      keywords.forEach((word) => {
        if (content.includes(word.toLowerCase())) {
          score += CONFIG.SCORING.URGENCY_WORD;
        }
      });

      // البحث في الليل = استعجال محتمل
      const hour = msg.timestamp.getHours();
      if (hour >= 22 || hour <= 6) {
        score += CONFIG.SCORING.URGENCY_NIGHT_HOURS;
      }

      // رسائل متتالية بسرعة
      if (msg.responseTime && msg.responseTime < 5000) {
        score += 1.5;
      }

      // تواريخ قريبة جداً
      if (this.detectNearDateMention(content)) {
        score += 4;
      }
    });

    return Math.min(score, 10);
  }

  /**
   * حساب قلق الميزانية
   */
  private calculateBudgetAnxiety(messages: UserMessage[]): number {
    let score = 0;
    const keywords = [
      ...emotionalKeywords.budget_anxiety.ar,
      ...emotionalKeywords.budget_anxiety.en,
      ...emotionalKeywords.budget_anxiety.emojis,
    ];

    messages.forEach((msg) => {
      const content = msg.content.toLowerCase();

      // كلمات الميزانية
      keywords.forEach((word) => {
        if (content.includes(word.toLowerCase())) {
          score += CONFIG.SCORING.BUDGET_WORD;
        }
      });

      // ذكر أرقام صغيرة للميزانية
      const numbers = content.match(/\d+/g);
      if (numbers && numbers.some((n) => parseInt(n) < 100)) {
        score += 3;
      }

      // أسئلة متعددة عن السعر
      if (
        content.includes('سعر') ||
        content.includes('price') ||
        content.includes('كم')
      ) {
        score += 1.5;
      }

      // طلب خصومات
      if (
        content.includes('خصم') ||
        content.includes('discount') ||
        content.includes('offer')
      ) {
        score += CONFIG.SCORING.BUDGET_DISCOUNT;
      }
    });

    return Math.min(score, 10);
  }

  /**
   * كشف المناسبات الاحتفالية
   */
  private detectCelebration(messages: UserMessage[]): boolean {
    const keywords = [
      ...emotionalKeywords.celebration.ar,
      ...emotionalKeywords.celebration.en,
    ];

    return messages.some((msg) =>
      keywords.some((word) =>
        msg.content.toLowerCase().includes(word.toLowerCase())
      )
    );
  }

  /**
   * تكييف استجابة AI بناءً على الحالة العاطفية
   */
  getAdaptiveResponse(state: EmotionalState): AdaptiveResponse {
    const responseMap: Record<EmotionalState, AdaptiveResponse> = {
      متحمس: {
        systemPromptAddition: `المستخدم متحمس جداً لرحلته! طابق طاقته:
- استخدم الرموز التعبيرية والكلمات الحماسية
- اقترح تجارب فريدة ومثيرة
- أظهر خيارات طموحة تتماشى مع الميزانية
- كن متفائلاً ومشجعاً في لغتك
- شارك في حماسه بأسلوب دافئ وودود`,
        uiTheme: {
          primaryColor: 'from-yellow-500 to-orange-500',
          secondaryColor: 'from-pink-500 to-purple-500',
          animation: 'excited',
        },
        recommendations: {
          maxOptions: 5,
          sortBy: 'unique',
          showComparison: true,
        },
        narrationStyle: {
          tone: 'حماسي ومشجع',
          useEmojis: true,
          responseSpeed: 'normal',
        },
      },

      متوتر: {
        systemPromptAddition: `المستخدم يبدو متوتراً أو تحت ضغط. كن مساعداً مهدئاً:
- استخدم لغة هادئة وواضحة وحاسمة
- اقترح خياراً واحداً أفضل بدلاً من خيارات متعددة
- تجنب التفاصيل غير الضرورية - كن مباشراً
- طمئنه أن كل شيء تحت السيطرة
- اعرض "وضع القرار السريع" حيث تختار أنت الأفضل
- قدم تأكيدات واضحة على كل خطوة`,
        uiTheme: {
          primaryColor: 'from-blue-500 to-cyan-500',
          secondaryColor: 'from-blue-600 to-blue-800',
          animation: 'calm',
        },
        recommendations: {
          maxOptions: 1,
          sortBy: 'best',
          showComparison: false,
        },
        narrationStyle: {
          tone: 'هادئ ومطمئن وحاسم',
          useEmojis: false,
          responseSpeed: 'instant',
        },
      },

      مرتبك: {
        systemPromptAddition: `المستخدم محتار ويحتاج إرشاد واضح:
- قسم العملية إلى خطوات بسيطة جداً
- اسأل سؤالاً واحداً فقط في كل مرة
- اشرح بلغة بسيطة بدون مصطلحات معقدة
- أظهر 3 خيارات فقط كحد أقصى مع توضيح واضح للفروقات
- قدم توصية واضحة: "أنصحك بالخيار #1 لأن..."
- كن صبوراً ولا تفترض معرفة مسبقة`,
        uiTheme: {
          primaryColor: 'from-purple-500 to-pink-500',
          secondaryColor: 'from-indigo-500 to-purple-600',
          animation: 'guided',
        },
        recommendations: {
          maxOptions: 3,
          sortBy: 'best',
          showComparison: true,
        },
        narrationStyle: {
          tone: 'مرشد وتعليمي وبسيط',
          useEmojis: true,
          responseSpeed: 'detailed',
        },
      },

      قلق_ميزانية: {
        systemPromptAddition: `المستخدم قلق من الميزانية - ساعده في الحصول على أفضل قيمة:
- ركز على الخيارات الاقتصادية أولاً
- أظهر كيف توفر المال: "هذا يوفر لك 50$ مقارنة بالمتوسط"
- اقترح بدائل أرخص دون المساس بالجودة
- وضح القيمة: "سعر منخفض + تقييم عالي = صفقة ممتازة"
- اعرض خيارات تدريجية: اقتصادي، متوسط، فاخر
- طمئنه أن هناك خيارات رائعة ضمن ميزانيته`,
        uiTheme: {
          primaryColor: 'from-green-500 to-teal-500',
          secondaryColor: 'from-emerald-600 to-green-700',
          animation: 'calm',
        },
        recommendations: {
          maxOptions: 5,
          sortBy: 'cheapest',
          showComparison: true,
        },
        narrationStyle: {
          tone: 'ودود وموفر ومطمئن',
          useEmojis: true,
          responseSpeed: 'normal',
        },
      },

      احتفالي: {
        systemPromptAddition: `المستخدم يخطط لمناسبة خاصة (شهر عسل، عيد ميلاد، احتفال):
- اجعل التجربة مميزة ورومانسية
- اقترح فنادق ذات أجواء رومانسية أو فاخرة
- ركز على التفاصيل الخاصة: إطلالة، سبا، عشاء رومانسي
- استخدم لغة احتفالية واحترافية
- اقترح إضافات: "يمكنني حجز عشاء خاص أو باقة رومانسية"
- كن حريصاً على جعل المناسبة لا تُنسى`,
        uiTheme: {
          primaryColor: 'from-rose-500 to-pink-500',
          secondaryColor: 'from-purple-500 to-pink-600',
          animation: 'excited',
        },
        recommendations: {
          maxOptions: 3,
          sortBy: 'popular',
          showComparison: true,
        },
        narrationStyle: {
          tone: 'رومانسي واحتفالي وراقي',
          useEmojis: true,
          responseSpeed: 'detailed',
        },
      },

      محايد: {
        systemPromptAddition: `المستخدم في حالة محايدة - قدم تجربة متوازنة:
- كن احترافياً وودوداً
- أظهر خيارات متنوعة
- وازن بين السعر والجودة
- كن واضحاً ومنظماً
- اترك مساحة للمستخدم لتحديد تفضيلاته`,
        uiTheme: {
          primaryColor: 'from-blue-500 to-purple-500',
          secondaryColor: 'from-gray-700 to-gray-900',
          animation: 'calm',
        },
        recommendations: {
          maxOptions: 4,
          sortBy: 'best',
          showComparison: true,
        },
        narrationStyle: {
          tone: 'محترف ومتوازن',
          useEmojis: false,
          responseSpeed: 'normal',
        },
      },
    };

    return responseMap[state];
  }

  /**
   * حساب التشابه بين نصين - OPTIMIZED O(n)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    let commonCount = 0;
    words1.forEach((w) => {
      if (words2.has(w)) commonCount++; // O(1) lookup
    });

    return commonCount / Math.max(words1.size, words2.size);
  }

  /**
   * كشف ذكر تواريخ قريبة في النص
   */
  private detectNearDateMention(text: string): boolean {
    const nearDateWords = [
      ...emotionalKeywords.urgency.ar,
      ...emotionalKeywords.urgency.en,
    ].filter((word) => ['اليوم', 'غداً', 'today', 'tomorrow'].includes(word));

    return nearDateWords.some((word) =>
      text.toLowerCase().includes(word.toLowerCase())
    );
  }

  /**
   * Create cache key from messages
   */
  private createCacheKey(messages: UserMessage[]): string {
    const recentMessages = messages.slice(-CONFIG.ANALYSIS_WINDOW);
    return recentMessages.map((m) => m.content).join('|');
  }

  /**
   * Clean old cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    Array.from(this.emotionalCache.entries()).forEach(([key, value]) => {
      if (now - value.timestamp > CONFIG.CACHE_TTL * 2) {
        this.emotionalCache.delete(key);
      }
    });
  }
}

// ============================================
// دمج مع نظام GLM-4.6
// ============================================
class EmotionalAIIntegration {
  private emotionEngine: EmotionalIntelligenceEngine;
  private conversationHistory: UserMessage[] = [];
  private zaiApiKey: string;
  private zaiBaseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.emotionEngine = new EmotionalIntelligenceEngine();
    this.zaiApiKey = apiKey || process.env.ZAI_API_KEY || '';
    this.zaiBaseUrl =
      baseUrl || process.env.ZAI_API_BASE_URL || 'https://api.z.ai/api/paas/v4';
  }

  /**
   * معالجة رسالة المستخدم مع التكيف العاطفي
   */
  async processUserMessage(
    userMessage: string,
    tripContext: any
  ): Promise<{
    response: string;
    emotionalState: EmotionalState;
    confidence: number;
  }> {
    // Input validation
    if (!userMessage || userMessage.trim().length === 0) {
      throw new Error('User message cannot be empty');
    }

    if (!tripContext) {
      console.warn('Trip context is missing, using default context');
    }

    try {
      // تسجيل الرسالة
      this.addMessage({
        content: userMessage,
        timestamp: new Date(),
        responseTime: this.calculateResponseTime(),
      });

      // كشف الحالة العاطفية
      const emotionalState = this.emotionEngine.detectEmotionalState(
        this.conversationHistory
      );

      // الحصول على التكيف المناسب
      const adaptation = this.emotionEngine.getAdaptiveResponse(emotionalState);

      // بناء نظام التوجيه المعدل
      const baseSystemPrompt = `أنت وكيل سفر ذكي يساعد في حجز الفنادق.`;
      const enhancedSystemPrompt =
        baseSystemPrompt + '\n\n' + adaptation.systemPromptAddition;

      // استدعاء GLM-4.6 API
      const aiResponse = await this.callGLMAPI({
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
          { role: 'user', content: userMessage },
        ],
        model: 'glm-4.6',
        max_tokens:
          adaptation.narrationStyle.responseSpeed === 'instant' ? 150 : 500,
        temperature: emotionalState === 'متحمس' ? 0.9 : 0.7,
      });

      return {
        response: aiResponse,
        emotionalState,
        confidence: this.calculateConfidence(emotionalState),
      };
    } catch (error) {
      console.error('Error processing user message:', error);

      // Fallback response
      return {
        response: this.getFallbackResponse(userMessage),
        emotionalState: 'محايد',
        confidence: 0.5,
      };
    }
  }

  /**
   * Add message to history with MAX_HISTORY limit
   */
  private addMessage(message: UserMessage): void {
    this.conversationHistory.push(message);

    // Maintain sliding window
    if (this.conversationHistory.length > CONFIG.MAX_HISTORY) {
      this.conversationHistory = this.conversationHistory.slice(
        -CONFIG.MAX_HISTORY
      );
    }
  }

  /**
   * استدعاء GLM API مع error handling كامل
   */
  private async callGLMAPI(request: ChatCompletionRequest): Promise<string> {
    if (!this.zaiApiKey) {
      throw new Error('ZAI_API_KEY is not configured');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        CONFIG.API_TIMEOUT
      );

      const response = await fetch(`${this.zaiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.zaiApiKey}`,
          'Content-Type': 'application/json',
          'Accept-Language': 'ar-EG,ar',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GLM API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return (
        data.choices?.[0]?.message?.content ||
        data.output ||
        'No response generated'
      );
    } catch (error: any) {
      console.error('GLM API failed:', error);

      // Specific error handling
      if (error.name === 'AbortError') {
        throw new Error('API request timeout - please try again');
      }

      if (error.message.includes('401') || error.message.includes('403')) {
        throw new Error('API authentication failed');
      }

      // Generic fallback
      throw new Error('AI service temporarily unavailable');
    }
  }

  /**
   * Get fallback response when API fails
   */
  private getFallbackResponse(userMessage: string): string {
    const responses = [
      'عذراً، حدث خطأ مؤقت في خدمة الذكاء الاصطناعي. دعني أساعدك بطريقة أخرى...',
      'أعتذر عن المقاطعة. يمكنك المتابعة وسأساعدك بأفضل ما لدي.',
      'حدث خلل بسيط، لكن لا تقلق - سأجد لك أفضل الخيارات!',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * حساب وقت الاستجابة
   */
  private calculateResponseTime(): number {
    if (this.conversationHistory.length < 2) return 0;

    const lastMessage =
      this.conversationHistory[this.conversationHistory.length - 1];
    const previousMessage =
      this.conversationHistory[this.conversationHistory.length - 2];

    return (
      lastMessage.timestamp.getTime() - previousMessage.timestamp.getTime()
    );
  }

  /**
   * حساب ثقة النظام
   */
  private calculateConfidence(state: EmotionalState): number {
    // الثقة أعلى في الحالات الواضحة
    const confidenceMap: Record<EmotionalState, number> = {
      متوتر: 0.95,
      متحمس: 0.9,
      قلق_ميزانية: 0.88,
      مرتبك: 0.85,
      احتفالي: 0.92,
      محايد: 0.7,
    };

    return confidenceMap[state] || 0.7;
  }

  /**
   * Get conversation history (limited to MAX_HISTORY)
   */
  getConversationHistory(): UserMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get analytics about conversation
   */
  getAnalytics() {
    return {
      messageCount: this.conversationHistory.length,
      averageResponseTime:
        this.conversationHistory.reduce(
          (sum, msg) => sum + (msg.responseTime || 0),
          0
        ) / this.conversationHistory.length,
      emotionalStates: this.getEmotionalStateDistribution(),
    };
  }

  /**
   * Get distribution of emotional states
   */
  private getEmotionalStateDistribution(): Record<EmotionalState, number> {
    const distribution: Record<EmotionalState, number> = {
      متحمس: 0,
      متوتر: 0,
      مرتبك: 0,
      قلق_ميزانية: 0,
      محايد: 0,
      احتفالي: 0,
    };

    // Sample every 5 messages to get distribution
    for (let i = 0; i < this.conversationHistory.length; i += 5) {
      const sample = this.conversationHistory.slice(i, i + 5);
      if (sample.length > 0) {
        const state = this.emotionEngine.detectEmotionalState(sample);
        distribution[state]++;
      }
    }

    return distribution;
  }
}

// ============================================
// مثال على الاستخدام
// ============================================
export async function handleUserInteraction(
  userMessage: string,
  tripData: any
) {
  const aiSystem = new EmotionalAIIntegration();

  try {
    const result = await aiSystem.processUserMessage(userMessage, tripData);

    console.log('🧠 الحالة العاطفية المكتشفة:', result.emotionalState);
    console.log('📊 مستوى الثقة:', (result.confidence * 100).toFixed(1) + '%');
    console.log('💬 استجابة AI:', result.response);

    return result;
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    throw error;
  }
}

// ============================================
// Exports
// ============================================
export {
  EmotionalIntelligenceEngine,
  EmotionalAIIntegration,
  CONFIG as EmotionalConfig,
  type EmotionalState,
  type AdaptiveResponse,
  type UserMessage,
  type EmotionalSignals,
};
