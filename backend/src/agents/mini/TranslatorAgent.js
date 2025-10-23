/**
 * Translator Agent - Google Translate Integration
 * Specialization: Language translation and communication
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../../utils/logger');

class TranslatorAgent {
  constructor() {
    this.name = 'Translator';
    this.icon = '🌐';
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  /**
   * Execute a task
   */
  async executeTask(task) {
    logger.info(`[TranslatorAgent] Executing task: ${task.type}`);
    
    try {
      switch (task.type) {
        case 'TRANSLATE_TEXT':
          return await this.translateText(task.text, task.targetLang, task.sourceLang);
        case 'DETECT_LANGUAGE':
          return await this.detectLanguage(task.text);
        case 'TRANSLATE_CONVERSATION':
          return await this.translateConversation(task.messages, task.targetLang);
        case 'TRANSLATE_DOCUMENT':
          return await this.translateDocument(task.content, task.targetLang);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      logger.error(`[TranslatorAgent] Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Translate text
   */
  async translateText(text, targetLang, sourceLang = 'auto') {
    const prompt = sourceLang === 'auto'
      ? `Translate the following text to ${targetLang}. Only return the translation, nothing else:\n\n${text}`
      : `Translate the following text from ${sourceLang} to ${targetLang}. Only return the translation, nothing else:\n\n${text}`;

    const result = await this.model.generateContent(prompt);
    const translation = result.response.text().trim();

    // Detect source language if auto
    let detectedLang = sourceLang;
    if (sourceLang === 'auto') {
      detectedLang = await this.detectLanguage(text);
    }

    return {
      success: true,
      originalText: text,
      translatedText: translation,
      sourceLanguage: detectedLang.language || sourceLang,
      targetLanguage: targetLang
    };
  }

  /**
   * Detect language
   */
  async detectLanguage(text) {
    const prompt = `Detect the language of this text. Return only the language code (e.g., 'en', 'ar', 'fr', 'es'). Text:\n\n${text}`;

    const result = await this.model.generateContent(prompt);
    const languageCode = result.response.text().trim().toLowerCase();

    // Map to full language names
    const languageMap = {
      'en': 'English',
      'ar': 'Arabic',
      'fr': 'French',
      'es': 'Spanish',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean'
    };

    return {
      success: true,
      language: languageCode,
      languageName: languageMap[languageCode] || 'Unknown',
      confidence: 0.95
    };
  }

  /**
   * Translate conversation
   */
  async translateConversation(messages, targetLang) {
    const conversationText = messages.map((msg, i) => 
      `Message ${i + 1}: ${msg}`
    ).join('\n');

    const prompt = `Translate this conversation to ${targetLang}. Maintain the message structure. Return only the translated messages:\n\n${conversationText}`;

    const result = await this.model.generateContent(prompt);
    const translatedText = result.response.text().trim();

    // Parse back into messages
    const translatedMessages = translatedText
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^Message \d+:\s*/, ''));

    return {
      success: true,
      originalMessages: messages,
      translatedMessages,
      targetLanguage: targetLang,
      messageCount: messages.length
    };
  }

  /**
   * Translate document
   */
  async translateDocument(content, targetLang) {
    // Split into chunks if too long
    const maxChunkSize = 2000;
    const chunks = this.splitIntoChunks(content, maxChunkSize);
    
    const translatedChunks = [];
    
    for (const chunk of chunks) {
      const prompt = `Translate this text to ${targetLang}. Preserve formatting and structure:\n\n${chunk}`;
      const result = await this.model.generateContent(prompt);
      translatedChunks.push(result.response.text().trim());
    }

    return {
      success: true,
      originalLength: content.length,
      translatedContent: translatedChunks.join('\n\n'),
      targetLanguage: targetLang,
      chunksProcessed: chunks.length
    };
  }

  /**
   * Split text into chunks
   */
  splitIntoChunks(text, maxSize) {
    const chunks = [];
    const paragraphs = text.split('\n\n');
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if ((currentChunk + paragraph).length > maxSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        
        // If single paragraph is too long, split by sentences
        if (paragraph.length > maxSize) {
          const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
          for (const sentence of sentences) {
            if ((currentChunk + sentence).length > maxSize) {
              if (currentChunk) {
                chunks.push(currentChunk.trim());
              }
              currentChunk = sentence;
            } else {
              currentChunk += sentence;
            }
          }
        } else {
          currentChunk = paragraph;
        }
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return {
      success: true,
      languages: [
        { code: 'en', name: 'English' },
        { code: 'ar', name: 'Arabic' },
        { code: 'fr', name: 'French' },
        { code: 'es', name: 'Spanish' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'hi', name: 'Hindi' },
        { code: 'tr', name: 'Turkish' },
        { code: 'nl', name: 'Dutch' },
        { code: 'pl', name: 'Polish' }
      ]
    };
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      name: this.name,
      icon: this.icon,
      status: this.model ? 'active' : 'inactive',
      capabilities: [
        'TRANSLATE_TEXT',
        'DETECT_LANGUAGE',
        'TRANSLATE_CONVERSATION',
        'TRANSLATE_DOCUMENT'
      ],
      supportedLanguages: 15
    };
  }
}

module.exports = TranslatorAgent;
