/**
 * Intake Analyzer Service
 * Automatically processes incoming messages and extracts structured travel requests
 * Priority 0: 5-15 hours/day time savings
 */

const GeminiCLI = require('./GeminiCLI');
const { createClient } = require('@supabase/supabase-js');
const logger = require('../../utils/logger');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

class IntakeAnalyzer {
  /**
   * Process a single message and extract travel request details
   * @param {Object} message - Message object from database
   * @returns {Promise<Object>} Processing result with extracted data
   */
  static async processMessage(message) {
    const startTime = Date.now();

    try {
      logger.info('Processing message with Intake Analyzer', { 
        messageId: message.id,
        userId: message.user_id,
        textLength: message.text?.length || 0
      });

      // Validate message
      if (!message.text || message.text.trim().length === 0) {
        throw new Error('Message text is empty');
      }

      // Extract structured data using Gemini
      const extracted = await GeminiCLI.extractSDK(message.text, `
You are an expert travel request analyzer. Extract the following information from the user's message:

Required fields:
- destination: string (destination city/country, null if not mentioned)
- origin: string (departure city/country, null if not mentioned)
- departureDate: string (ISO 8601 format YYYY-MM-DD, null if not mentioned)
- returnDate: string (ISO 8601 format YYYY-MM-DD, null if not mentioned)
- budget: number (total budget in USD, null if not mentioned)
- travelers: number (number of travelers, default 1)
- preferences: array of strings (travel preferences like "family-friendly", "luxury", "budget", "adventure", "cultural", "beach", "halal", etc.)
- urgency: string (one of: "low", "medium", "high" - based on language urgency)
- tripDuration: number (number of days/nights, null if not mentioned)

Important rules:
1. If dates are mentioned in relative terms (e.g., "next month", "in 2 weeks"), calculate the actual date
2. If budget is in other currencies, convert to USD (approximate)
3. Infer preferences from context (e.g., "with family" → "family-friendly")
4. Detect urgency from language (e.g., "urgent", "ASAP", "soon" → "high")
5. If trip duration is mentioned without specific dates, note it
6. Handle both Arabic and English text

Output ONLY valid JSON matching this exact structure:
{
  "destination": "string or null",
  "origin": "string or null",
  "departureDate": "YYYY-MM-DD or null",
  "returnDate": "YYYY-MM-DD or null",
  "budget": number or null,
  "travelers": number,
  "preferences": ["string"],
  "urgency": "low|medium|high",
  "tripDuration": number or null
}
      `);

      // Validate and normalize extracted data
      const validated = this.validateExtraction(extracted);

      // Calculate confidence score
      const confidence = this.calculateConfidence(validated, message.text);

      // Save to leads table
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert({
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
          trip_duration: validated.tripDuration,
          confidence_score: confidence,
          raw_message: message.text,
          extracted_at: new Date().toISOString(),
          status: 'new',
          processing_time_ms: Date.now() - startTime
        })
        .select()
        .single();

      if (leadError) {
        throw new Error(`Failed to save lead: ${leadError.message}`);
      }

      // Mark message as processed
      const { error: updateError } = await supabase
        .from('messages')
        .update({ 
          processed: true, 
          processed_at: new Date().toISOString(),
          lead_id: lead.id
        })
        .eq('id', message.id);

      if (updateError) {
        logger.warn('Failed to mark message as processed', {
          messageId: message.id,
          error: updateError.message
        });
      }

      const processingTime = Date.now() - startTime;

      logger.info('Message processed successfully', { 
        leadId: lead.id,
        messageId: message.id,
        confidence: confidence,
        processingTime: `${processingTime}ms`,
        extraction: validated 
      });

      return {
        success: true,
        lead: lead,
        extraction: validated,
        confidence: confidence,
        processingTime: processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error('Failed to process message', { 
        error: error.message,
        stack: error.stack,
        messageId: message.id,
        processingTime: `${processingTime}ms`
      });

      // Mark message as failed
      await supabase
        .from('messages')
        .update({ 
          processed: false,
          processing_failed: true,
          processing_error: error.message,
          processing_failed_at: new Date().toISOString()
        })
        .eq('id', message.id);

      throw error;
    }
  }

  /**
   * Validate and normalize extracted data
   * @param {Object} data - Raw extracted data
   * @returns {Object} Validated data
   */
  static validateExtraction(data) {
    return {
      destination: data.destination || null,
      origin: data.origin || null,
      departureDate: this.validateDate(data.departureDate),
      returnDate: this.validateDate(data.returnDate),
      budget: data.budget ? Number(data.budget) : null,
      travelers: data.travelers ? Math.max(1, Number(data.travelers)) : 1,
      preferences: Array.isArray(data.preferences) ? data.preferences : [],
      urgency: ['low', 'medium', 'high'].includes(data.urgency) 
        ? data.urgency 
        : 'medium',
      tripDuration: data.tripDuration ? Number(data.tripDuration) : null
    };
  }

  /**
   * Validate date string
   * @param {string} dateStr - Date string to validate
   * @returns {string|null} Valid ISO date or null
   */
  static validateDate(dateStr) {
    if (!dateStr) return null;
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      
      // Return ISO format YYYY-MM-DD
      return date.toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  /**
   * Calculate confidence score for extraction
   * @param {Object} extraction - Validated extraction
   * @param {string} originalText - Original message text
   * @returns {number} Confidence score (0-100)
   */
  static calculateConfidence(extraction, originalText) {
    let score = 0;
    let maxScore = 0;

    // Destination (30 points)
    maxScore += 30;
    if (extraction.destination) score += 30;

    // Dates (20 points)
    maxScore += 20;
    if (extraction.departureDate) score += 10;
    if (extraction.returnDate) score += 10;

    // Budget (20 points)
    maxScore += 20;
    if (extraction.budget) score += 20;

    // Travelers (10 points)
    maxScore += 10;
    if (extraction.travelers > 0) score += 10;

    // Preferences (10 points)
    maxScore += 10;
    if (extraction.preferences.length > 0) score += 10;

    // Origin (10 points)
    maxScore += 10;
    if (extraction.origin) score += 10;

    // Calculate percentage
    const confidence = Math.round((score / maxScore) * 100);

    return confidence;
  }

  /**
   * Process all unprocessed messages in batch
   * @param {number} limit - Maximum number of messages to process
   * @returns {Promise<Object>} Batch processing results
   */
  static async processUnprocessedMessages(limit = 10) {
    const startTime = Date.now();

    try {
      logger.info('Starting batch processing of unprocessed messages', { limit });

      // Fetch unprocessed messages
      const { data: messages, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('processed', false)
        .is('processing_failed', null)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (fetchError) {
        throw new Error(`Failed to fetch messages: ${fetchError.message}`);
      }

      if (!messages || messages.length === 0) {
        logger.info('No unprocessed messages found');
        return { 
          processed: 0,
          successful: 0,
          failed: 0,
          totalTime: Date.now() - startTime
        };
      }

      logger.info(`Found ${messages.length} unprocessed messages`);

      const results = [];
      let successful = 0;
      let failed = 0;

      // Process each message
      for (const message of messages) {
        try {
          const result = await this.processMessage(message);
          results.push(result);
          successful++;
        } catch (error) {
          logger.error('Failed to process individual message', {
            messageId: message.id,
            error: error.message
          });
          failed++;
        }
      }

      const totalTime = Date.now() - startTime;
      const avgTime = Math.round(totalTime / messages.length);

      logger.info('Batch processing completed', {
        total: messages.length,
        successful,
        failed,
        totalTime: `${totalTime}ms`,
        avgTime: `${avgTime}ms`
      });

      return {
        processed: messages.length,
        successful,
        failed,
        totalTime,
        avgTime,
        results
      };

    } catch (error) {
      logger.error('Batch processing failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get processing statistics
   * @returns {Promise<Object>} Statistics
   */
  static async getStatistics() {
    try {
      // Get total messages
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      // Get processed messages
      const { count: processedMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('processed', true);

      // Get failed messages
      const { count: failedMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('processing_failed', true);

      // Get leads
      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      // Get average confidence
      const { data: avgConfidence } = await supabase
        .from('leads')
        .select('confidence_score');

      const avgScore = avgConfidence && avgConfidence.length > 0
        ? Math.round(avgConfidence.reduce((sum, l) => sum + (l.confidence_score || 0), 0) / avgConfidence.length)
        : 0;

      // Get average processing time
      const { data: processingTimes } = await supabase
        .from('leads')
        .select('processing_time_ms')
        .not('processing_time_ms', 'is', null);

      const avgProcessingTime = processingTimes && processingTimes.length > 0
        ? Math.round(processingTimes.reduce((sum, l) => sum + (l.processing_time_ms || 0), 0) / processingTimes.length)
        : 0;

      return {
        totalMessages: totalMessages || 0,
        processedMessages: processedMessages || 0,
        failedMessages: failedMessages || 0,
        pendingMessages: (totalMessages || 0) - (processedMessages || 0) - (failedMessages || 0),
        totalLeads: totalLeads || 0,
        successRate: totalMessages > 0 
          ? Math.round((processedMessages / totalMessages) * 100) 
          : 0,
        avgConfidenceScore: avgScore,
        avgProcessingTime: avgProcessingTime
      };

    } catch (error) {
      logger.error('Failed to get statistics', {
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = IntakeAnalyzer;
