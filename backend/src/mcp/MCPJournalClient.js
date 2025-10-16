/**
 * MCP Journal Client - Connects to Private Journal MCP Server
 * Handles persistent memory storage and retrieval for Evolve Manager
 */

const EventEmitter = require('events');
const winston = require('winston');
const axios = require('axios');

class MCPJournalClient extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      serverUrl: config.serverUrl || process.env.MCP_JOURNAL_SERVER_URL || 'http://localhost:3001',
      apiKey: config.apiKey || process.env.MCP_JOURNAL_API_KEY,
      encryptionKey: config.encryptionKey || process.env.MCP_JOURNAL_ENCRYPTION_KEY,
      timeout: config.timeout || 10000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      ...config
    };

    this.client_id = `evolve_manager_${Date.now()}`;
    this.connected = false;
    this.sessionToken = null;

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/mcp-journal-client.log' }),
        new winston.transports.Console()
      ]
    });

    // Axios instance for HTTP requests
    this.httpClient = axios.create({
      baseURL: this.config.serverUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Evolve-Manager-MCP-Client/1.0.0'
      }
    });

    // Request interceptor for authentication
    this.httpClient.interceptors.request.use(
      (config) => {
        if (this.sessionToken) {
          config.headers.Authorization = `Bearer ${this.sessionToken}`;
        }
        if (this.config.apiKey) {
          config.headers['X-API-Key'] = this.config.apiKey;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.sessionToken) {
          // Token expired, try to refresh
          this.sessionToken = null;
          if (error.config && !error.config._retry) {
            error.config._retry = true;
            return this.httpClient.request(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async connect() {
    this.logger.info('Connecting to MCP Journal Server...', {
      serverUrl: this.config.serverUrl,
      clientId: this.client_id
    });

    try {
      // Authenticate with the server
      await this.authenticate();

      // Test connection with a simple query
      await this.testConnection();

      this.connected = true;
      this.logger.info('Successfully connected to MCP Journal Server');

      this.emit('connected', {
        serverUrl: this.config.serverUrl,
        clientId: this.client_id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('Failed to connect to MCP Journal Server', {
        error: error.message,
        serverUrl: this.config.serverUrl
      });
      throw error;
    }
  }

  async authenticate() {
    try {
      const authData = {
        client_id: this.client_id,
        client_type: 'evolve_manager',
        version: '1.0.0',
        capabilities: [
          'pattern_storage',
          'interaction_logging',
          'memory_retrieval',
          'data_querying'
        ]
      };

      if (this.config.encryptionKey) {
        authData.encryption_key = this.config.encryptionKey;
      }

      const response = await this.httpClient.post('/auth/connect', authData);

      if (response.data && response.data.session_token) {
        this.sessionToken = response.data.session_token;
        this.logger.info('Authentication successful');
      } else {
        throw new Error('No session token received from server');
      }

    } catch (error) {
      this.logger.error('Authentication failed', { error: error.message });
      throw error;
    }
  }

  async testConnection() {
    try {
      const response = await this.httpClient.get('/health');

      if (response.data && response.data.status === 'healthy') {
        this.logger.info('Connection test successful');
        return true;
      } else {
        throw new Error('Server health check failed');
      }

    } catch (error) {
      this.logger.error('Connection test failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Store data in the journal
   */
  async store(data) {
    if (!this.connected) {
      throw new Error('Not connected to journal server');
    }

    const storeRequest = {
      type: data.type || 'general_data',
      data: data.data || data,
      metadata: {
        client_id: this.client_id,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        ...data.metadata
      },
      encryption: {
        enabled: !!this.config.encryptionKey,
        algorithm: 'aes-256-gcm'
      }
    };

    this.logger.info('Storing data in journal', {
      type: storeRequest.type,
      dataSize: JSON.stringify(storeRequest.data).length
    });

    try {
      const response = await this.retryRequest(() =>
        this.httpClient.post('/data/store', storeRequest)
      );

      if (response.data && response.data.entry_id) {
        this.logger.info('Data stored successfully', {
          entryId: response.data.entry_id,
          type: storeRequest.type
        });

        return {
          success: true,
          entry_id: response.data.entry_id,
          timestamp: response.data.timestamp
        };
      } else {
        throw new Error('No entry ID received from server');
      }

    } catch (error) {
      this.logger.error('Failed to store data in journal', {
        error: error.message,
        type: storeRequest.type
      });
      throw error;
    }
  }

  /**
   * Query data from the journal
   */
  async query(queryParams) {
    if (!this.connected) {
      throw new Error('Not connected to journal server');
    }

    const queryRequest = {
      filters: {
        type: queryParams.type,
        client_id: queryParams.client_id || this.client_id,
        date_from: queryParams.date_from,
        date_to: queryParams.date_to,
        tags: queryParams.tags,
        ...queryParams.filters
      },
      pagination: {
        limit: queryParams.limit || 100,
        offset: queryParams.offset || 0,
        sort_by: queryParams.sortBy || 'created_at',
        sort_order: queryParams.sortOrder || 'desc'
      },
      projection: queryParams.projection || {},
      ...queryParams
    };

    this.logger.info('Querying journal data', {
      type: queryRequest.filters.type,
      limit: queryRequest.pagination.limit
    });

    try {
      const response = await this.retryRequest(() =>
        this.httpClient.post('/data/query', queryRequest)
      );

      if (response.data && response.data.entries) {
        this.logger.info('Query successful', {
          resultCount: response.data.entries.length,
          totalCount: response.data.total_count || response.data.entries.length
        });

        return response.data.entries.map(entry => ({
          id: entry.id,
          type: entry.type,
          data: entry.data,
          metadata: entry.metadata,
          created_at: entry.created_at,
          updated_at: entry.updated_at
        }));
      } else {
        this.logger.warn('Query returned no results');
        return [];
      }

    } catch (error) {
      this.logger.error('Failed to query journal data', {
        error: error.message,
        queryType: queryRequest.filters.type
      });
      throw error;
    }
  }

  /**
   * Retrieve specific entry by ID
   */
  async retrieve(entryId) {
    if (!this.connected) {
      throw new Error('Not connected to journal server');
    }

    this.logger.info('Retrieving journal entry', { entryId });

    try {
      const response = await this.retryRequest(() =>
        this.httpClient.get(`/data/entry/${entryId}`)
      );

      if (response.data && response.data.entry) {
        return {
          id: response.data.entry.id,
          type: response.data.entry.type,
          data: response.data.entry.data,
          metadata: response.data.entry.metadata,
          created_at: response.data.entry.created_at,
          updated_at: response.data.entry.updated_at
        };
      } else {
        throw new Error('Entry not found');
      }

    } catch (error) {
      this.logger.error('Failed to retrieve journal entry', {
        error: error.message,
        entryId
      });
      throw error;
    }
  }

  /**
   * Update existing entry
   */
  async update(entryId, updateData) {
    if (!this.connected) {
      throw new Error('Not connected to journal server');
    }

    const updateRequest = {
      data: updateData.data || updateData,
      metadata: {
        updated_by: this.client_id,
        updated_at: new Date().toISOString(),
        ...updateData.metadata
      }
    };

    this.logger.info('Updating journal entry', { entryId });

    try {
      const response = await this.retryRequest(() =>
        this.httpClient.put(`/data/entry/${entryId}`, updateRequest)
      );

      if (response.data && response.data.success) {
        this.logger.info('Entry updated successfully', { entryId });
        return { success: true, updated_at: response.data.updated_at };
      } else {
        throw new Error('Update failed');
      }

    } catch (error) {
      this.logger.error('Failed to update journal entry', {
        error: error.message,
        entryId
      });
      throw error;
    }
  }

  /**
   * Delete entry from journal
   */
  async delete(entryId) {
    if (!this.connected) {
      throw new Error('Not connected to journal server');
    }

    this.logger.info('Deleting journal entry', { entryId });

    try {
      const response = await this.retryRequest(() =>
        this.httpClient.delete(`/data/entry/${entryId}`)
      );

      if (response.data && response.data.success) {
        this.logger.info('Entry deleted successfully', { entryId });
        return { success: true, deleted_at: response.data.deleted_at };
      } else {
        throw new Error('Delete failed');
      }

    } catch (error) {
      this.logger.error('Failed to delete journal entry', {
        error: error.message,
        entryId
      });
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    if (!this.connected) {
      throw new Error('Not connected to journal server');
    }

    try {
      const response = await this.retryRequest(() =>
        this.httpClient.get('/stats/storage')
      );

      if (response.data && response.data.stats) {
        return {
          total_entries: response.data.stats.total_entries || 0,
          total_size: response.data.stats.total_size || 0,
          client_entries: response.data.stats.client_entries || 0,
          client_size: response.data.stats.client_size || 0,
          last_activity: response.data.stats.last_activity,
          retention_info: response.data.stats.retention_info || {}
        };
      } else {
        throw new Error('Invalid stats response');
      }

    } catch (error) {
      this.logger.error('Failed to get storage stats', { error: error.message });
      throw error;
    }
  }

  /**
   * Search entries by content
   */
  async search(searchQuery) {
    if (!this.connected) {
      throw new Error('Not connected to journal server');
    }

    const searchRequest = {
      query: searchQuery.query || searchQuery,
      filters: searchQuery.filters || {},
      options: {
        fuzzy_match: searchQuery.fuzzy !== false,
        case_sensitive: searchQuery.caseSensitive || false,
        limit: searchQuery.limit || 50,
        ...searchQuery.options
      }
    };

    this.logger.info('Searching journal entries', {
      query: searchRequest.query,
      limit: searchRequest.options.limit
    });

    try {
      const response = await this.retryRequest(() =>
        this.httpClient.post('/data/search', searchRequest)
      );

      if (response.data && response.data.results) {
        return response.data.results.map(result => ({
          id: result.id,
          type: result.type,
          data: result.data,
          metadata: result.metadata,
          relevance_score: result.relevance_score || 0,
          matched_fields: result.matched_fields || []
        }));
      } else {
        return [];
      }

    } catch (error) {
      this.logger.error('Failed to search journal entries', {
        error: error.message,
        query: searchRequest.query
      });
      throw error;
    }
  }

  /**
   * Batch operations
   */
  async batchStore(entries) {
    if (!this.connected) {
      throw new Error('Not connected to journal server');
    }

    const batchRequest = {
      entries: entries.map(entry => ({
        type: entry.type || 'general_data',
        data: entry.data || entry,
        metadata: {
          client_id: this.client_id,
          timestamp: new Date().toISOString(),
          ...entry.metadata
        }
      })),
      options: {
        continue_on_error: true,
        atomic: false
      }
    };

    this.logger.info('Batch storing entries', { count: entries.length });

    try {
      const response = await this.retryRequest(() =>
        this.httpClient.post('/data/batch/store', batchRequest)
      );

      if (response.data && response.data.results) {
        const results = response.data.results.map(result => ({
          success: result.success,
          entry_id: result.entry_id,
          error: result.error
        }));

        const successCount = results.filter(r => r.success).length;

        this.logger.info('Batch store completed', {
          total: entries.length,
          successful: successCount,
          failed: entries.length - successCount
        });

        return results;
      } else {
        throw new Error('Invalid batch response');
      }

    } catch (error) {
      this.logger.error('Failed to batch store entries', {
        error: error.message,
        count: entries.length
      });
      throw error;
    }
  }

  /**
   * Export data
   */
  async exportData(exportOptions = {}) {
    if (!this.connected) {
      throw new Error('Not connected to journal server');
    }

    const exportRequest = {
      format: exportOptions.format || 'json',
      filters: exportOptions.filters || { client_id: this.client_id },
      compression: exportOptions.compression || 'none',
      include_metadata: exportOptions.includeMetadata !== false,
      date_range: exportOptions.dateRange || {},
      ...exportOptions
    };

    this.logger.info('Exporting journal data', {
      format: exportRequest.format,
      filters: exportRequest.filters
    });

    try {
      const response = await this.retryRequest(() =>
        this.httpClient.post('/data/export', exportRequest)
      );

      if (response.data && response.data.export_id) {
        // Poll for export completion
        return await this.waitForExportCompletion(response.data.export_id);
      } else {
        throw new Error('Invalid export response');
      }

    } catch (error) {
      this.logger.error('Failed to export journal data', {
        error: error.message
      });
      throw error;
    }
  }

  async waitForExportCompletion(exportId, maxWaitTime = 300000) { // 5 minutes max
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const response = await this.httpClient.get(`/data/export/${exportId}`);

        if (response.data && response.data.status === 'completed') {
          return {
            export_id: exportId,
            status: 'completed',
            download_url: response.data.download_url,
            file_size: response.data.file_size,
            entry_count: response.data.entry_count,
            completed_at: response.data.completed_at
          };
        } else if (response.data && response.data.status === 'failed') {
          throw new Error(`Export failed: ${response.data.error}`);
        }

        // Wait 5 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 5000));

      } catch (error) {
        this.logger.error('Error checking export status', {
          exportId,
          error: error.message
        });
        throw error;
      }
    }

    throw new Error('Export timed out');
  }

  /**
   * Utility method for retrying requests
   */
  async retryRequest(requestFn, attempts = this.config.retryAttempts) {
    let lastError;

    for (let i = 0; i < attempts; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        if (i < attempts - 1) {
          this.logger.warn(`Request attempt ${i + 1} failed, retrying...`, {
            error: error.message,
            attempt: i + 1,
            maxAttempts: attempts
          });

          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * (i + 1)));
        }
      }
    }

    throw lastError;
  }

  /**
   * Health check method
   */
  async healthCheck() {
    try {
      const response = await this.httpClient.get('/health', { timeout: 5000 });

      return {
        status: 'healthy',
        server_status: response.data?.status || 'unknown',
        response_time: response.responseTime || 0,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Disconnect from journal server
   */
  async disconnect() {
    this.logger.info('Disconnecting from MCP Journal Server...');

    try {
      if (this.sessionToken) {
        await this.httpClient.post('/auth/disconnect');
        this.sessionToken = null;
      }

      this.connected = false;

      this.logger.info('Successfully disconnected from MCP Journal Server');

      this.emit('disconnected', {
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.warn('Error during disconnect', { error: error.message });
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      connected: this.connected,
      server_url: this.config.serverUrl,
      client_id: this.client_id,
      session_active: !!this.sessionToken,
      last_health_check: this.lastHealthCheck
    };
  }

  /**
   * Cleanup method
   */
  destroy() {
    this.removeAllListeners();

    if (this.connected) {
      this.disconnect().catch(error => {
        this.logger.warn('Error during cleanup disconnect', { error: error.message });
      });
    }

    this.logger.info('MCP Journal Client destroyed');
  }
}

module.exports = MCPJournalClient;