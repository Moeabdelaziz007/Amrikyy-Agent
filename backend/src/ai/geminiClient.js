/**
 * Google Gemini API Client
 * Alternative AI provider for Maya Trips
 */

const fetch = require('node-fetch');

class GeminiClient {
  /**
   * Initializes the Gemini client with configuration from environment variables.
   */
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1';
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'; // Updated to latest model
    this.maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS) || 2000;
    this.temperature = parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7;
  }

  /**
   * Sends a chat completion request to the Gemini API.
   * @param {Array<object>} messages - An array of message objects (e.g., {role: 'user', content: '...'})
   * @param {object} [options={}] - Optional settings to override defaults (e.g., temperature, maxTokens).
   * @returns {Promise<{success: boolean, data: object|null, content: string, error: string|null}>} 
   *          An object containing the success status, API data, extracted content, and any error message.
   */
  async chatCompletion(messages, options = {}) {
    try {
      // Convert messages to Gemini format
      const { contents, systemInstruction } = this.convertMessagesToGemini(messages);
      
      const requestBody = {
        contents: contents,
        // Add system instruction if it exists
        ...(systemInstruction && { 
          system_instruction: { parts: [{ text: systemInstruction }] } 
        }),
        generationConfig: {
          temperature: options.temperature || this.temperature,
          maxOutputTokens: options.maxTokens || this.maxTokens,
          topP: 0.8,
          topK: 40
        }
      };

      const response = await fetch(
        `${this.baseUrl}/models/${this.model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Extract content from response
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
      
      return {
        success: true,
        data,
        error: null,
        content: content
      };

    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        success: false,
        error: error.message,
        data: null,
        content: 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.'
      };
    }
  }

  /**
   * Converts an array of OpenAI-style messages into the format required by the Gemini API.
   * It separates the system prompt from the user/assistant messages.
   * @param {Array<object>} messages - The array of messages to convert.
   * @returns {{contents: Array<object>, systemInstruction: string}} An object containing the formatted contents and the system instruction.
   */
  convertMessagesToGemini(messages) {
    const contents = [];
    let systemInstruction = '';
    // Separate system instruction from other messages
    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = msg.content;
        // Combine multiple system messages if they exist
        systemInstruction += `${msg.content}\n`;
        continue;
      }
      
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }
    return { contents, systemInstruction: systemInstruction.trim() };
  }

  /**
   * Generates travel recommendations for a given destination, budget, and preferences.
   * @param {string} destination - The travel destination.
   * @param {string} budget - The user's budget (e.g., "$1000").
   * @param {string} duration - The duration of the trip (e.g., "7 days").
   * @param {Array<string>} [preferences=[]] - A list of user preferences (e.g., ['beaches', 'history']).
   * @returns {Promise<object>} The result from the chatCompletion method.
   */
  async generateTravelRecommendations(destination, budget, duration, preferences = []) {
    const systemPrompt = `You are Maya, an expert AI travel assistant specializing in Arabic and English travel planning.
    قدم توصيات سفر مفصلة وعملية تتضمن:
    - 3-5 أماكن يجب زيارتها
    - توصيات الطعام المحلي
    - خيارات النقل
    - نصائح لتوفير المال
    - رؤى ثقافية
    - نصائح السلامة
    Respond in Arabic unless specifically asked in English.`;

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
   * Generates a detailed budget analysis and cost-saving recommendations for a trip.
   * @param {object} tripData - An object containing trip details.
   * @param {string} tripData.destination - The travel destination.
   * @param {number} tripData.duration - The trip duration in days.
   * @param {number} tripData.travelers - The number of travelers.
   * @param {number} totalBudget - The total budget for the trip.
   * @returns {Promise<object>} The result from the chatCompletion method.
   */
  async generateBudgetAnalysis(tripData, totalBudget) {
    const systemPrompt = `You are Maya, a financial travel advisor. Analyze trip costs and provide:
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
   * Generates a conversational response to a user's message, maintaining context from history.
   * @param {string} userMessage - The user's most recent message.
   * @param {Array<object>} [conversationHistory=[]] - An array of previous messages in the conversation.
   * @returns {Promise<object>} The result from the chatCompletion method.
   */
  async generateChatResponse(userMessage, conversationHistory = []) {
    const systemPrompt = `You are Maya, a friendly and knowledgeable AI travel assistant. 
    You help users with:
    - تخطيط السفر والتوصيات
    - تحليل الميزانية
    - معلومات الوجهات
    - رؤى ثقافية
    - نصائح ونصائح السفر
    
    كن محادثاً ومفيداً وقدم نصائح عملية.
    Respond in Arabic unless specifically asked in English.`;

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
   * Generates comprehensive insights for a specific travel destination.
   * @param {string} destination - The name of the destination.
   * @param {string} [travelType='leisure'] - The type of travel (e.g., 'business', 'leisure', 'adventure').
   * @returns {Promise<object>} The result from the chatCompletion method.
   */
  async generateDestinationInsights(destination, travelType = 'leisure') {
    const systemPrompt = `You are Maya, a travel destination expert. Provide comprehensive insights about destinations including:
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
   * Generates recommendations for payment methods and booking strategies for a trip.
   * @param {object} tripDetails - An object containing trip information.
   * @param {string} tripDetails.destination - The travel destination.
   * @param {number} tripDetails.budget - The trip budget.
   * @param {number} tripDetails.duration - The trip duration in days.
   * @param {string} [paymentMethod='credit_card'] - The user's preferred payment method.
   * @returns {Promise<object>} The result from the chatCompletion method.
   */
  async generatePaymentRecommendations(tripDetails, paymentMethod = 'credit_card') {
    const systemPrompt = `You are Maya, a travel financial advisor. Provide payment and booking advice including:
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
   * Performs a health check on the Gemini API by sending a simple test message.
   * @returns {Promise<{success: boolean, status: string, error: string|null}>} An object indicating the health status.
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
