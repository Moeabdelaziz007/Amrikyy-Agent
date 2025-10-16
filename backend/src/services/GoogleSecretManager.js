/**
 * Google Secret Manager Service
 * Secure credential management for Amrikyy AI services
 * Implements zero-secret storage on disk with runtime retrieval
 */

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const winston = require('winston');

class GoogleSecretManager {
    constructor(projectId = null) {
        this.projectId = projectId || process.env.GOOGLE_CLOUD_PROJECT;
        this.client = new SecretManagerServiceClient();
        this.cache = new Map();
        this.cacheTTL = 5 * 60 * 1000; // 5 minutes cache TTL
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            defaultMeta: { service: 'secret-manager' },
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                })
            ]
        });
    }

    /**
     * Retrieve secret from Google Secret Manager with caching
     * @param {string} secretName - Name of the secret
     * @param {string} version - Secret version (default: latest)
     * @returns {Promise<string>} Secret value
     */
    async getSecret(secretName, version = 'latest') {
        const cacheKey = `${secretName}:${version}`;
        const cached = this.cache.get(cacheKey);
        
        // Return cached value if still valid
        if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
            this.logger.debug(`Returning cached secret: ${secretName}`);
            return cached.value;
        }

        try {
            const name = this.client.secretVersionPath(
                this.projectId,
                secretName,
                version
            );

            const [accessResponse] = await this.client.accessSecretVersion({
                name: name,
            });

            const secretValue = accessResponse.payload.data.toString();
            
            // Cache the secret
            this.cache.set(cacheKey, {
                value: secretValue,
                timestamp: Date.now()
            });

            this.logger.info(`Successfully retrieved secret: ${secretName}`);
            return secretValue;

        } catch (error) {
            this.logger.error(`Failed to retrieve secret ${secretName}:`, error);
            throw new Error(`Secret retrieval failed: ${error.message}`);
        }
    }

    /**
     * Get multiple secrets in parallel
     * @param {Array<string>} secretNames - Array of secret names
     * @returns {Promise<Object>} Object with secret names as keys
     */
    async getMultipleSecrets(secretNames) {
        const promises = secretNames.map(async (name) => {
            try {
                const value = await this.getSecret(name);
                return { name, value, success: true };
            } catch (error) {
                this.logger.error(`Failed to get secret ${name}:`, error);
                return { name, error: error.message, success: false };
            }
        });

        const results = await Promise.all(promises);
        const secrets = {};

        results.forEach(result => {
            if (result.success) {
                secrets[result.name] = result.value;
            }
        });

        return secrets;
    }

    /**
     * Create a new secret
     * @param {string} secretName - Name of the secret
     * @param {string} secretValue - Secret value
     * @param {Object} options - Additional options
     * @returns {Promise<string>} Secret name
     */
    async createSecret(secretName, secretValue, options = {}) {
        try {
            const [secret] = await this.client.createSecret({
                parent: `projects/${this.projectId}`,
                secretId: secretName,
                secret: {
                    replication: {
                        automatic: {
                            replicationPolicy: 'AUTOMATIC'
                        }
                    },
                    labels: {
                        service: 'amrikyy-ai',
                        environment: process.env.NODE_ENV || 'development',
                        ...options.labels
                    }
                }
            });

            // Add secret version
            const [version] = await this.client.addSecretVersion({
                parent: secret.name,
                payload: {
                    data: Buffer.from(secretValue, 'utf8'),
                }
            });

            this.logger.info(`Created secret: ${secret.name}`);
            return secret.name;

        } catch (error) {
            this.logger.error(`Failed to create secret ${secretName}:`, error);
            throw new Error(`Secret creation failed: ${error.message}`);
        }
    }

    /**
     * Update an existing secret
     * @param {string} secretName - Name of the secret
     * @param {string} secretValue - New secret value
     * @returns {Promise<string>} Secret version name
     */
    async updateSecret(secretName, secretValue) {
        try {
            const name = this.client.secretVersionPath(
                this.projectId,
                secretName,
                'latest'
            );

            const [version] = await this.client.addSecretVersion({
                parent: `projects/${this.projectId}/secrets/${secretName}`,
                payload: {
                    data: Buffer.from(secretValue, 'utf8'),
                }
            });

            this.logger.info(`Updated secret: ${secretName}`);
            return version.name;

        } catch (error) {
            this.logger.error(`Failed to update secret ${secretName}:`, error);
            throw new Error(`Secret update failed: ${error.message}`);
        }
    }

    /**
     * Delete a secret
     * @param {string} secretName - Name of the secret
     * @returns {Promise<void>}
     */
    async deleteSecret(secretName) {
        try {
            const name = this.client.secretPath(this.projectId, secretName);
            await this.client.deleteSecret({ name });

            // Clear from cache
            this.cache.forEach((value, key) => {
                if (key.startsWith(`${secretName}:`)) {
                    this.cache.delete(key);
                }
            });

            this.logger.info(`Deleted secret: ${secretName}`);

        } catch (error) {
            this.logger.error(`Failed to delete secret ${secretName}:`, error);
            throw new Error(`Secret deletion failed: ${error.message}`);
        }
    }

    /**
     * List all secrets with Amrikyy labels
     * @returns {Promise<Array>} Array of secret information
     */
    async listSecrets() {
        try {
            const [secrets] = await this.client.listSecrets({
                parent: `projects/${this.projectId}`,
                filter: 'labels.service=amrikyy-ai'
            });

            return secrets.map(secret => ({
                name: secret.name.split('/').pop(),
                createTime: secret.createTime,
                updateTime: secret.updateTime,
                labels: secret.labels,
                replication: secret.replication
            }));

        } catch (error) {
            this.logger.error('Failed to list secrets:', error);
            throw new Error(`Secret listing failed: ${error.message}`);
        }
    }

    /**
     * Enable secret for AI service initialization
     * @param {string} serviceName - Name of the AI service
     * @returns {Promise<Object>} Service credentials
     */
    async getServiceCredentials(serviceName) {
        const secretMappings = {
            'nlp': [
                'amrikyy-nlp-api-key',
                'amrikyy-nlp-project-id',
                'amrikyy-nlp-service-account'
            ],
            'translation': [
                'amrikyy-translation-api-key',
                'amrikyy-translation-project-id'
            ],
            'vision': [
                'amrikyy-vision-api-key',
                'amrikyy-vision-project-id'
            ],
            'vertexai': [
                'amrikyy-vertexai-api-key',
                'amrikyy-vertexai-project-id',
                'amrikyy-vertexai-service-account'
            ],
            'bigquery': [
                'amrikyy-bigquery-credentials',
                'amrikyy-bigquery-project-id'
            ]
        };

        const secretNames = secretMappings[serviceName];
        if (!secretNames) {
            throw new Error(`Unknown service: ${serviceName}`);
        }

        const secrets = await this.getMultipleSecrets(secretNames);
        
        // Validate required secrets
        const missingSecrets = secretNames.filter(name => !secrets[name]);
        if (missingSecrets.length > 0) {
            throw new Error(`Missing required secrets for ${serviceName}: ${missingSecrets.join(', ')}`);
        }

        this.logger.info(`Successfully loaded credentials for service: ${serviceName}`);
        return secrets;
    }

    /**
     * Health check for Secret Manager access
     * @returns {Promise<boolean>} True if healthy
     */
    async healthCheck() {
        try {
            // Try to access a test secret or list secrets
            await this.listSecrets();
            return true;
        } catch (error) {
            this.logger.error('Secret Manager health check failed:', error);
            return false;
        }
    }

    /**
     * Clear cache
     * @param {string} secretName - Optional: clear specific secret
     */
    clearCache(secretName = null) {
        if (secretName) {
            // Clear specific secret from cache
            this.cache.forEach((value, key) => {
                if (key.startsWith(`${secretName}:`)) {
                    this.cache.delete(key);
                }
            });
        } else {
            // Clear all cache
            this.cache.clear();
        }
        
        this.logger.info(`Cache cleared${secretName ? ` for ${secretName}` : ''}`);
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            ttl: this.cacheTTL,
            entries: Array.from(this.cache.keys())
        };
    }
}

module.exports = GoogleSecretManager;