/**
 * Backup & Rollback System
 * Creates timestamped backups before modifications
 * Supports rollback on errors
 * 
 * @author Ona AI Development Partner
 * @version 2.0.0
 * @license MIT
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');

class BackupManager {
  constructor(options = {}) {
    this.backupDir = options.backupDir || '.aix-backups';
    this.maxBackups = options.maxBackups || 10;
    this.retentionDays = options.retentionDays || 30;
  }

  /**
   * Create backup of a file
   * 
   * @param {string} filePath - Path to file to backup
   * @returns {Promise<Object>} { success: boolean, backupPath?: string, error?: string }
   */
  async createBackup(filePath) {
    try {
      const absolutePath = path.resolve(filePath);
      
      // Ensure backup directory exists
      await this.ensureBackupDir();

      // Generate backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const basename = path.basename(filePath);
      const backupFilename = `${basename}.${timestamp}.backup`;
      const backupPath = path.join(this.backupDir, backupFilename);

      // Copy file to backup location
      await fs.copyFile(absolutePath, backupPath);

      // Calculate checksum for verification
      const content = await fs.readFile(backupPath, 'utf8');
      const checksum = crypto.createHash('sha256').update(content).digest('hex');

      // Store metadata
      const metadataPath = `${backupPath}.meta.json`;
      const metadata = {
        originalPath: absolutePath,
        backupPath: backupPath,
        timestamp: new Date().toISOString(),
        checksum: checksum,
        size: content.length
      };
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

      // Cleanup old backups
      await this.cleanupOldBackups(basename);

      return {
        success: true,
        backupPath: backupPath,
        metadata: metadata
      };

    } catch (error) {
      return {
        success: false,
        error: `Backup failed: ${error.message}`
      };
    }
  }

  /**
   * Restore file from backup
   * 
   * @param {string} backupPath - Path to backup file
   * @param {string} targetPath - Path to restore to (optional, uses original if not provided)
   * @returns {Promise<Object>} { success: boolean, restoredPath?: string, error?: string }
   */
  async restoreBackup(backupPath, targetPath = null) {
    try {
      // Load metadata
      const metadataPath = `${backupPath}.meta.json`;
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      const metadata = JSON.parse(metadataContent);

      // Verify backup integrity
      const backupContent = await fs.readFile(backupPath, 'utf8');
      const checksum = crypto.createHash('sha256').update(backupContent).digest('hex');
      
      if (checksum !== metadata.checksum) {
        return {
          success: false,
          error: 'Backup integrity check failed (checksum mismatch)'
        };
      }

      // Determine restore target
      const restorePath = targetPath || metadata.originalPath;

      // Create backup of current file before restoring (if exists)
      if (fsSync.existsSync(restorePath)) {
        await this.createBackup(restorePath);
      }

      // Restore file
      await fs.copyFile(backupPath, restorePath);

      return {
        success: true,
        restoredPath: restorePath,
        metadata: metadata
      };

    } catch (error) {
      return {
        success: false,
        error: `Restore failed: ${error.message}`
      };
    }
  }

  /**
   * List all backups for a file
   * 
   * @param {string} filename - Original filename (basename)
   * @returns {Promise<Array>} Array of backup metadata
   */
  async listBackups(filename) {
    try {
      await this.ensureBackupDir();

      const files = await fs.readdir(this.backupDir);
      const backups = [];

      for (const file of files) {
        if (file.startsWith(filename) && file.endsWith('.backup')) {
          const metadataPath = path.join(this.backupDir, `${file}.meta.json`);
          
          if (fsSync.existsSync(metadataPath)) {
            const metadataContent = await fs.readFile(metadataPath, 'utf8');
            const metadata = JSON.parse(metadataContent);
            metadata.backupFile = file;
            backups.push(metadata);
          }
        }
      }

      // Sort by timestamp (newest first)
      backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return backups;

    } catch (error) {
      console.error(`Failed to list backups: ${error.message}`);
      return [];
    }
  }

  /**
   * Get most recent backup for a file
   * 
   * @param {string} filename - Original filename (basename)
   * @returns {Promise<Object|null>} Most recent backup metadata or null
   */
  async getLatestBackup(filename) {
    const backups = await this.listBackups(filename);
    return backups.length > 0 ? backups[0] : null;
  }

  /**
   * Cleanup old backups (keep only maxBackups most recent)
   * 
   * @param {string} filename - Original filename (basename)
   * @returns {Promise<number>} Number of backups deleted
   */
  async cleanupOldBackups(filename) {
    try {
      const backups = await this.listBackups(filename);
      
      if (backups.length <= this.maxBackups) {
        return 0;
      }

      // Delete oldest backups
      const toDelete = backups.slice(this.maxBackups);
      let deletedCount = 0;

      for (const backup of toDelete) {
        const backupPath = path.join(this.backupDir, backup.backupFile);
        const metadataPath = `${backupPath}.meta.json`;

        try {
          await fs.unlink(backupPath);
          await fs.unlink(metadataPath);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete backup ${backup.backupFile}: ${error.message}`);
        }
      }

      return deletedCount;

    } catch (error) {
      console.error(`Cleanup failed: ${error.message}`);
      return 0;
    }
  }

  /**
   * Cleanup backups older than retention period
   * 
   * @returns {Promise<number>} Number of backups deleted
   */
  async cleanupExpiredBackups() {
    try {
      await this.ensureBackupDir();

      const files = await fs.readdir(this.backupDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
      
      let deletedCount = 0;

      for (const file of files) {
        if (file.endsWith('.backup')) {
          const metadataPath = path.join(this.backupDir, `${file}.meta.json`);
          
          if (fsSync.existsSync(metadataPath)) {
            const metadataContent = await fs.readFile(metadataPath, 'utf8');
            const metadata = JSON.parse(metadataContent);
            const backupDate = new Date(metadata.timestamp);

            if (backupDate < cutoffDate) {
              const backupPath = path.join(this.backupDir, file);
              
              try {
                await fs.unlink(backupPath);
                await fs.unlink(metadataPath);
                deletedCount++;
              } catch (error) {
                console.error(`Failed to delete expired backup ${file}: ${error.message}`);
              }
            }
          }
        }
      }

      return deletedCount;

    } catch (error) {
      console.error(`Expired backup cleanup failed: ${error.message}`);
      return 0;
    }
  }

  /**
   * Ensure backup directory exists
   * 
   * @returns {Promise<void>}
   */
  async ensureBackupDir() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Get backup directory size
   * 
   * @returns {Promise<Object>} { totalSize: number, fileCount: number, formatted: string }
   */
  async getBackupStats() {
    try {
      await this.ensureBackupDir();

      const files = await fs.readdir(this.backupDir);
      let totalSize = 0;
      let fileCount = 0;

      for (const file of files) {
        if (file.endsWith('.backup')) {
          const filePath = path.join(this.backupDir, file);
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
          fileCount++;
        }
      }

      return {
        totalSize: totalSize,
        fileCount: fileCount,
        formatted: this.formatBytes(totalSize)
      };

    } catch (error) {
      return {
        totalSize: 0,
        fileCount: 0,
        formatted: '0 Bytes',
        error: error.message
      };
    }
  }

  /**
   * Format bytes to human-readable string
   * 
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

module.exports = BackupManager;
