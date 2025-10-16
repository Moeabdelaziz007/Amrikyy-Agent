/**
 * Pattern Journal Adapter - Transforms patterns to journal format
 * Handles conversion between pattern engine format and journal storage format
 */

const EventEmitter = require('events');
const winston = require('winston');

class PatternJournalAdapter extends EventEmitter {
  constructor() {
    super();

    this.adapter_id = "pattern_journal_adapter";
    this.version = "1.0.0";

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/pattern-journal-adapter.log' }),
        new winston.transports.Console()
      ]
    });

    // Transformation schemas
    this.schemas = {
      pattern_to_journal: {
        id: 'string',
        type: 'string',
        category: 'string',
        confidence: 'number',
        data: 'object',
        metadata: 'object',
        journal_metadata: {
          adapter_version: 'string',
          transformation_date: 'string',
          original_format: 'string',
          compression: 'string'
        }
      },

      interaction_to_journal: {
        id: 'string',
        user_id: 'string',
        request: 'object',
        analysis: 'object',
        result: 'object',
        context: 'object',
        execution_time: 'number',
        agents_used: 'array',
        journal_metadata: {
          adapter_version: 'string',
          transformation_date: 'string',
          retention_days: 'number'
        }
      }
    };

    this.compressionEnabled = true;
    this.encryptionEnabled = false;
  }

  /**
   * Transform pattern for journal storage
   */
  transformPatternForJournal(pattern) {
    try {
      this.logger.info('Transforming pattern for journal storage', {
        patternId: pattern.id,
        patternType: pattern.type
      });

      // Create journal entry structure
      const journalEntry = {
        id: pattern.id,
        type: this.getJournalTypeForPattern(pattern.type),
        category: pattern.category,
        data: {
          // Core pattern data
          pattern_core: {
            id: pattern.id,
            type: pattern.type,
            category: pattern.category,
            confidence: pattern.confidence,
            timestamp: pattern.data?.timestamp || new Date().toISOString()
          },

          // Pattern-specific data
          pattern_data: this.extractPatternData(pattern),

          // Metadata
          metadata: {
            ...pattern.metadata,
            adapter_version: this.version,
            transformation_date: new Date().toISOString(),
            original_format: 'pattern_engine_v2'
          }
        },

        // Journal-specific metadata
        journal_metadata: {
          adapter_version: this.version,
          transformation_date: new Date().toISOString(),
          original_format: 'pattern_engine_format',
          compression: this.compressionEnabled ? 'gzip' : 'none',
          encryption: this.encryptionEnabled ? 'aes-256' : 'none',
          retention_policy: this.getRetentionPolicy(pattern),
          tags: this.generateTags(pattern),
          searchable_content: this.generateSearchableContent(pattern)
        }
      };

      // Validate transformed data
      this.validateJournalEntry(journalEntry, 'pattern_to_journal');

      this.logger.info('Pattern transformed successfully', {
        patternId: pattern.id,
        journalType: journalEntry.type,
        dataSize: JSON.stringify(journalEntry.data).length
      });

      return journalEntry;

    } catch (error) {
      this.logger.error('Failed to transform pattern for journal', {
        patternId: pattern.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Transform interaction for journal storage
   */
  transformInteractionForJournal(interaction) {
    try {
      this.logger.info('Transforming interaction for journal storage', {
        interactionId: interaction.id,
        userId: interaction.user_id
      });

      const journalEntry = {
        id: interaction.id || `interaction_${Date.now()}`,
        type: 'interaction_data',
        data: {
          interaction_core: {
            id: interaction.id,
            user_id: interaction.user_id,
            timestamp: interaction.timestamp || new Date().toISOString(),
            success: interaction.success,
            execution_time: interaction.execution_time,
            domain: interaction.analysis?.domain || 'general'
          },

          interaction_data: {
            request: interaction.request,
            analysis: interaction.analysis,
            result: interaction.result,
            context: interaction.context,
            agents_used: interaction.agents_used,
            execution_plan: interaction.execution_plan
          },

          metadata: {
            adapter_version: this.version,
            transformation_date: new Date().toISOString(),
            retention_days: 90
          }
        },

        journal_metadata: {
          adapter_version: this.version,
          transformation_date: new Date().toISOString(),
          original_format: 'interaction_format',
          compression: this.compressionEnabled ? 'gzip' : 'none',
          encryption: this.encryptionEnabled ? 'aes-256' : 'none',
          retention_policy: '90_days',
          tags: this.generateInteractionTags(interaction),
          searchable_content: this.generateInteractionSearchableContent(interaction)
        }
      };

      // Validate transformed data
      this.validateJournalEntry(journalEntry, 'interaction_to_journal');

      this.logger.info('Interaction transformed successfully', {
        interactionId: interaction.id,
        dataSize: JSON.stringify(journalEntry.data).length
      });

      return journalEntry;

    } catch (error) {
      this.logger.error('Failed to transform interaction for journal', {
        interactionId: interaction.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Transform journal entry back to pattern format
   */
  transformJournalToPattern(journalEntry) {
    try {
      this.logger.info('Transforming journal entry to pattern', {
        entryId: journalEntry.id,
        entryType: journalEntry.type
      });

      const patternData = journalEntry.data;

      // Reconstruct pattern object
      const pattern = {
        id: patternData.pattern_core.id,
        type: patternData.pattern_core.type,
        category: patternData.pattern_core.category,
        confidence: patternData.pattern_core.confidence,
        data: {
          ...patternData.pattern_data,
          timestamp: patternData.pattern_core.timestamp
        },
        metadata: {
          ...patternData.metadata,
          journal_id: journalEntry.id,
          retrieved_from_journal: true,
          journal_timestamp: journalEntry.created_at
        }
      };

      this.logger.info('Journal entry transformed to pattern successfully', {
        patternId: pattern.id,
        originalEntryId: journalEntry.id
      });

      return pattern;

    } catch (error) {
      this.logger.error('Failed to transform journal entry to pattern', {
        entryId: journalEntry.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Transform journal entry back to interaction format
   */
  transformJournalToInteraction(journalEntry) {
    try {
      this.logger.info('Transforming journal entry to interaction', {
        entryId: journalEntry.id
      });

      const interactionData = journalEntry.data;

      const interaction = {
        id: interactionData.interaction_core.id,
        user_id: interactionData.interaction_core.user_id,
        timestamp: interactionData.interaction_core.timestamp,
        success: interactionData.interaction_core.success,
        execution_time: interactionData.interaction_core.execution_time,
        domain: interactionData.interaction_core.domain,
        request: interactionData.interaction_data.request,
        analysis: interactionData.interaction_data.analysis,
        result: interactionData.interaction_data.result,
        context: interactionData.interaction_data.context,
        agents_used: interactionData.interaction_data.agents_used,
        execution_plan: interactionData.interaction_data.execution_plan,
        journal_metadata: {
          entry_id: journalEntry.id,
          retrieved_from_journal: true,
          journal_timestamp: journalEntry.created_at
        }
      };

      this.logger.info('Journal entry transformed to interaction successfully', {
        interactionId: interaction.id,
        originalEntryId: journalEntry.id
      });

      return interaction;

    } catch (error) {
      this.logger.error('Failed to transform journal entry to interaction', {
        entryId: journalEntry.id,
        error: error.message
      });
      throw error;
    }
  }

  // Helper methods for data extraction
  extractPatternData(pattern) {
    const data = {};

    switch (pattern.type) {
      case 'request_pattern':
        data.request_text = pattern.data.request_text;
        data.domain = pattern.data.domain;
        data.complexity = pattern.data.complexity;
        data.success = pattern.data.success;
        data.execution_time = pattern.data.execution_time;
        data.agents_used = pattern.data.agents_used;
        data.user_id = pattern.data.user_id;
        break;

      case 'success_pattern':
        data.execution_strategy = pattern.data.execution_strategy;
        data.agents_used = pattern.data.agents_used;
        data.execution_time = pattern.data.execution_time;
        data.domain = pattern.data.domain;
        data.complexity = pattern.data.complexity;
        data.user_id = pattern.data.user_id;
        break;

      case 'failure_pattern':
        data.error_type = pattern.data.error_type;
        data.execution_strategy = pattern.data.execution_strategy;
        data.agents_used = pattern.data.agents_used;
        data.domain = pattern.data.domain;
        data.complexity = pattern.data.complexity;
        data.user_id = pattern.data.user_id;
        data.error_message = pattern.data.error_message;
        data.suggested_fixes = pattern.data.suggested_fixes;
        break;

      case 'insight':
        data.insight_type = pattern.data.type;
        data.insight_text = pattern.data.insight;
        data.confidence = pattern.data.confidence;
        data.actionable = pattern.data.actionable;
        data.based_on_interactions = pattern.data.based_on_interactions;
        break;

      default:
        // Generic pattern data extraction
        data.raw_data = pattern.data;
    }

    return data;
  }

  getJournalTypeForPattern(patternType) {
    const typeMapping = {
      'request_pattern': 'pattern_request',
      'success_pattern': 'pattern_success',
      'failure_pattern': 'pattern_failure',
      'insight': 'pattern_insight'
    };

    return typeMapping[patternType] || 'pattern_generic';
  }

  getRetentionPolicy(pattern) {
    // Determine retention based on pattern type and importance
    const baseRetention = 90; // days

    if (pattern.type === 'insight' && pattern.data?.actionable) {
      return baseRetention * 2; // Keep actionable insights longer
    }

    if (pattern.type === 'success_pattern' && pattern.confidence > 0.9) {
      return baseRetention * 1.5; // Keep high-confidence success patterns longer
    }

    if (pattern.type === 'failure_pattern') {
      return baseRetention * 0.5; // Keep failure patterns shorter
    }

    return baseRetention;
  }

  generateTags(pattern) {
    const tags = [];

    // Add pattern type tag
    tags.push(`pattern:${pattern.type}`);

    // Add category tag
    if (pattern.category) {
      tags.push(`category:${pattern.category}`);
    }

    // Add domain tag
    if (pattern.data?.domain) {
      tags.push(`domain:${pattern.data.domain}`);
    }

    // Add confidence tag
    if (pattern.confidence) {
      const confidenceLevel = pattern.confidence > 0.8 ? 'high' : pattern.confidence > 0.5 ? 'medium' : 'low';
      tags.push(`confidence:${confidenceLevel}`);
    }

    // Add user tag if available
    if (pattern.data?.user_id) {
      tags.push(`user:${pattern.data.user_id}`);
    }

    // Add agent tags
    if (pattern.data?.agents_used) {
      pattern.data.agents_used.forEach(agent => {
        tags.push(`agent:${agent}`);
      });
    }

    return tags;
  }

  generateSearchableContent(pattern) {
    const content = [];

    // Add request text for request patterns
    if (pattern.data?.request_text) {
      content.push(pattern.data.request_text);
    }

    // Add insight text for insight patterns
    if (pattern.data?.insight_text) {
      content.push(pattern.data.insight_text);
    }

    // Add error message for failure patterns
    if (pattern.data?.error_message) {
      content.push(pattern.data.error_message);
    }

    // Add metadata information
    if (pattern.metadata?.source) {
      content.push(pattern.metadata.source);
    }

    return content.join(' ').toLowerCase();
  }

  generateInteractionTags(interaction) {
    const tags = [];

    // Add user tag
    if (interaction.user_id) {
      tags.push(`user:${interaction.user_id}`);
    }

    // Add domain tag
    if (interaction.analysis?.domain) {
      tags.push(`domain:${interaction.analysis.domain}`);
    }

    // Add success/failure tag
    if (interaction.success !== undefined) {
      tags.push(interaction.success ? 'success' : 'failure');
    }

    // Add agent tags
    if (interaction.agents_used) {
      interaction.agents_used.forEach(agent => {
        tags.push(`agent:${agent}`);
      });
    }

    // Add complexity tag
    if (interaction.analysis?.complexity) {
      const complexityLevel = interaction.analysis.complexity > 7 ? 'high' :
                             interaction.analysis.complexity > 4 ? 'medium' : 'low';
      tags.push(`complexity:${complexityLevel}`);
    }

    return tags;
  }

  generateInteractionSearchableContent(interaction) {
    const content = [];

    // Add request text
    if (interaction.request?.message) {
      content.push(interaction.request.message);
    }

    // Add error message if failed
    if (!interaction.success && interaction.result?.error) {
      content.push(interaction.result.error);
    }

    // Add domain and analysis info
    if (interaction.analysis?.domain) {
      content.push(interaction.analysis.domain);
    }

    return content.join(' ').toLowerCase();
  }

  // Validation methods
  validateJournalEntry(entry, schemaType) {
    const schema = this.schemas[schemaType];
    if (!schema) {
      throw new Error(`Unknown schema type: ${schemaType}`);
    }

    // Basic structure validation
    if (!entry.id || !entry.type || !entry.data) {
      throw new Error('Invalid journal entry structure');
    }

    // Type-specific validation
    if (schemaType === 'pattern_to_journal') {
      if (!entry.data.pattern_core || !entry.data.pattern_core.id) {
        throw new Error('Invalid pattern journal entry: missing pattern core data');
      }
    }

    if (schemaType === 'interaction_to_journal') {
      if (!entry.data.interaction_core || !entry.data.interaction_core.user_id) {
        throw new Error('Invalid interaction journal entry: missing interaction core data');
      }
    }

    return true;
  }

  // Batch transformation methods
  transformPatternsBatch(patterns) {
    this.logger.info('Transforming pattern batch', { count: patterns.length });

    const results = {
      successful: [],
      failed: [],
      total: patterns.length
    };

    patterns.forEach(pattern => {
      try {
        const transformed = this.transformPatternForJournal(pattern);
        results.successful.push(transformed);
      } catch (error) {
        this.logger.warn('Failed to transform pattern in batch', {
          patternId: pattern.id,
          error: error.message
        });
        results.failed.push({
          pattern: pattern,
          error: error.message
        });
      }
    });

    this.logger.info('Pattern batch transformation completed', {
      successful: results.successful.length,
      failed: results.failed.length,
      total: results.total
    });

    return results;
  }

  transformInteractionsBatch(interactions) {
    this.logger.info('Transforming interaction batch', { count: interactions.length });

    const results = {
      successful: [],
      failed: [],
      total: interactions.length
    };

    interactions.forEach(interaction => {
      try {
        const transformed = this.transformInteractionForJournal(interaction);
        results.successful.push(transformed);
      } catch (error) {
        this.logger.warn('Failed to transform interaction in batch', {
          interactionId: interaction.id,
          error: error.message
        });
        results.failed.push({
          interaction: interaction,
          error: error.message
        });
      }
    });

    this.logger.info('Interaction batch transformation completed', {
      successful: results.successful.length,
      failed: results.failed.length,
      total: results.total
    });

    return results;
  }

  // Query transformation methods
  transformQueryForJournal(query) {
    return {
      filters: {
        type: query.type,
        category: query.category,
        tags: query.tags,
        date_from: query.dateFrom,
        date_to: query.dateTo,
        client_id: query.clientId,
        ...query.filters
      },
      pagination: {
        limit: query.limit || 100,
        offset: query.offset || 0,
        sort_by: query.sortBy || 'created_at',
        sort_order: query.sortOrder || 'desc'
      },
      search: query.searchText ? {
        query: query.searchText,
        fields: query.searchFields || ['searchable_content']
      } : undefined
    };
  }

  transformJournalQueryResults(results, targetFormat) {
    if (targetFormat === 'patterns') {
      return results
        .filter(entry => entry.type.startsWith('pattern_'))
        .map(entry => this.transformJournalToPattern(entry));
    }

    if (targetFormat === 'interactions') {
      return results
        .filter(entry => entry.type === 'interaction_data')
        .map(entry => this.transformJournalToInteraction(entry));
    }

    return results; // Return as-is if no specific format requested
  }

  // Utility methods
  compressData(data) {
    if (!this.compressionEnabled) return data;

    // Simple compression simulation
    // In production, use a proper compression library
    const jsonString = JSON.stringify(data);
    return Buffer.from(jsonString).toString('base64');
  }

  decompressData(compressedData) {
    if (!this.compressionEnabled) return compressedData;

    try {
      const jsonString = Buffer.from(compressedData, 'base64').toString();
      return JSON.parse(jsonString);
    } catch (error) {
      this.logger.warn('Failed to decompress data', { error: error.message });
      return compressedData;
    }
  }

  encryptData(data, key) {
    if (!this.encryptionEnabled || !key) return data;

    // Simple encryption simulation
    // In production, use proper encryption
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  decryptData(encryptedData, key) {
    if (!this.encryptionEnabled || !key) return encryptedData;

    try {
      const jsonString = Buffer.from(encryptedData, 'base64').toString();
      return JSON.parse(jsonString);
    } catch (error) {
      this.logger.warn('Failed to decrypt data', { error: error.message });
      return encryptedData;
    }
  }

  // Configuration methods
  setCompression(enabled) {
    this.compressionEnabled = enabled;
    this.logger.info('Compression setting updated', { enabled });
  }

  setEncryption(enabled) {
    this.encryptionEnabled = enabled;
    this.logger.info('Encryption setting updated', { enabled });
  }

  // Health and diagnostics
  getAdapterStats() {
    return {
      adapter_id: this.adapter_id,
      version: this.version,
      compression_enabled: this.compressionEnabled,
      encryption_enabled: this.encryptionEnabled,
      schemas_available: Object.keys(this.schemas).length,
      status: 'active'
    };
  }

  validateSchema(data, schemaType) {
    const schema = this.schemas[schemaType];
    if (!schema) {
      throw new Error(`Schema not found: ${schemaType}`);
    }

    // Basic schema validation
    // In production, use a proper schema validation library
    return this.validateObjectStructure(data, schema);
  }

  validateObjectStructure(obj, schema) {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    for (const [key, type] of Object.entries(schema)) {
      if (key === 'journal_metadata') continue; // Skip metadata validation for now

      if (!(key in obj)) {
        this.logger.warn(`Missing required field: ${key}`);
        return false;
      }

      if (typeof obj[key] !== type) {
        this.logger.warn(`Type mismatch for field ${key}: expected ${type}, got ${typeof obj[key]}`);
        return false;
      }
    }

    return true;
  }

  // Cleanup method
  destroy() {
    this.removeAllListeners();
    this.logger.info('Pattern Journal Adapter destroyed');
  }
}

module.exports = PatternJournalAdapter;