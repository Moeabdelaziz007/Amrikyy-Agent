/**
 * Storage Agent - Document & File Management
 * Specialization: File storage and document management
 */

const logger = require('../../utils/logger');
const fs = require('fs').promises;
const path = require('path');

class StorageAgent {
  constructor() {
    this.name = 'Storage';
    this.icon = '💾';
    this.storagePath = path.join(__dirname, '../../../storage');
    this.documents = new Map(); // In-memory index
    this.initializeStorage();
  }

  /**
   * Initialize storage directory
   */
  async initializeStorage() {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
    } catch (error) {
      logger.error(`[StorageAgent] Failed to create storage directory: ${error.message}`);
    }
  }

  /**
   * Execute a task
   */
  async executeTask(task) {
    logger.info(`[StorageAgent] Executing task: ${task.type}`);
    
    try {
      switch (task.type) {
        case 'SAVE_DOCUMENT':
          return await this.saveDocument(task.content, task.filename, task.metadata);
        case 'GET_DOCUMENT':
          return await this.getDocument(task.documentId);
        case 'LIST_DOCUMENTS':
          return await this.listDocuments(task.filter);
        case 'DELETE_DOCUMENT':
          return await this.deleteDocument(task.documentId);
        case 'CREATE_ITINERARY':
          return await this.createItinerary(task.tripData);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      logger.error(`[StorageAgent] Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Save document
   */
  async saveDocument(content, filename, metadata = {}) {
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const filepath = path.join(this.storagePath, `${documentId}.txt`);

    await fs.writeFile(filepath, content, 'utf8');

    const document = {
      id: documentId,
      filename,
      filepath,
      size: content.length,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.documents.set(documentId, document);

    return {
      success: true,
      document,
      message: 'Document saved successfully'
    };
  }

  /**
   * Get document
   */
  async getDocument(documentId) {
    const document = this.documents.get(documentId);
    
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    const content = await fs.readFile(document.filepath, 'utf8');

    return {
      success: true,
      document: {
        ...document,
        content
      }
    };
  }

  /**
   * List documents
   */
  async listDocuments(filter = {}) {
    let documents = Array.from(this.documents.values());

    // Apply filters
    if (filter.type) {
      documents = documents.filter(doc => 
        doc.metadata?.type === filter.type
      );
    }

    if (filter.search) {
      documents = documents.filter(doc =>
        doc.filename.toLowerCase().includes(filter.search.toLowerCase())
      );
    }

    return {
      success: true,
      documents,
      count: documents.length
    };
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId) {
    const document = this.documents.get(documentId);
    
    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    try {
      await fs.unlink(document.filepath);
    } catch (error) {
      logger.warn(`[StorageAgent] Failed to delete file: ${error.message}`);
    }

    this.documents.delete(documentId);

    return {
      success: true,
      documentId,
      message: 'Document deleted successfully'
    };
  }

  /**
   * Create trip itinerary
   */
  async createItinerary(tripData) {
    const content = this.formatItinerary(tripData);
    const filename = `${tripData.destination.replace(/\s+/g, '-')}-Itinerary.txt`;

    const result = await this.saveDocument(content, filename, {
      type: 'itinerary',
      destination: tripData.destination,
      startDate: tripData.startDate,
      endDate: tripData.endDate
    });

    return {
      success: true,
      itinerary: result.document,
      content,
      message: 'Itinerary created successfully'
    };
  }

  /**
   * Format itinerary
   */
  formatItinerary(tripData) {
    const { destination, startDate, endDate, days = [] } = tripData;

    let content = `TRIP ITINERARY\n`;
    content += `${'='.repeat(50)}\n\n`;
    content += `Destination: ${destination}\n`;
    content += `Dates: ${startDate} - ${endDate}\n`;
    content += `Duration: ${days.length} days\n\n`;
    content += `${'='.repeat(50)}\n\n`;

    days.forEach((day, index) => {
      content += `DAY ${index + 1}: ${day.title || `Day ${index + 1}`}\n`;
      content += `${'-'.repeat(50)}\n`;
      
      if (day.activities && day.activities.length > 0) {
        day.activities.forEach((activity, i) => {
          content += `${i + 1}. ${activity}\n`;
        });
      } else {
        content += `No activities planned\n`;
      }
      
      content += `\n`;
    });

    content += `${'='.repeat(50)}\n`;
    content += `Generated by Amrikyy AI OS\n`;
    content += `Date: ${new Date().toISOString()}\n`;

    return content;
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      name: this.name,
      icon: this.icon,
      status: 'active',
      capabilities: [
        'SAVE_DOCUMENT',
        'GET_DOCUMENT',
        'LIST_DOCUMENTS',
        'DELETE_DOCUMENT',
        'CREATE_ITINERARY'
      ],
      totalDocuments: this.documents.size,
      storagePath: this.storagePath
    };
  }
}

module.exports = StorageAgent;
