/**
 * SendTelegramNotificationTool - Tool for sending Telegram notifications
 * Integrates with Telegram Bot API for proactive user notifications
 * 
 * @author Amrikyy AI Solutions
 * @version 1.0.0
 */

const BaseTool = require('./BaseTool');
const fetch = require('node-fetch');

class SendTelegramNotificationTool extends BaseTool {
    constructor() {
        super();
        this.name = 'send_telegram_notification';
        this.description = 'Sends proactive notifications to users via Telegram bot. Essential for Scout agent to alert users about deals, price changes, and travel updates.';
        
        this.parameters = {
            type: 'object',
            properties: {
                user_id: {
                    type: 'string',
                    description: 'Telegram user ID or chat ID to send notification to'
                },
                message: {
                    type: 'string',
                    description: 'Message content to send',
                    minLength: 1,
                    maxLength: 4096
                },
                notification_type: {
                    type: 'string',
                    description: 'Type of notification for formatting and priority',
                    enum: ['price_alert', 'deal_found', 'trip_update', 'weather_warning', 'general_info', 'urgent'],
                    default: 'general_info'
                },
                include_keyboard: {
                    type: 'boolean',
                    description: 'Include interactive keyboard buttons',
                    default: false
                },
                keyboard_buttons: {
                    type: 'array',
                    description: 'Array of button objects for interactive keyboard',
                    items: {
                        type: 'object',
                        properties: {
                            text: { type: 'string', description: 'Button text' },
                            url: { type: 'string', description: 'URL to open when clicked (optional)' },
                            callback_data: { type: 'string', description: 'Callback data for button (optional)' }
                        },
                        required: ['text']
                    }
                },
                include_image: {
                    type: 'boolean',
                    description: 'Include image with notification',
                    default: false
                },
                image_url: {
                    type: 'string',
                    description: 'URL of image to include (if include_image is true)',
                    format: 'uri'
                },
                priority: {
                    type: 'string',
                    description: 'Notification priority level',
                    enum: ['low', 'normal', 'high', 'critical'],
                    default: 'normal'
                },
                silent: {
                    type: 'boolean',
                    description: 'Send notification silently (no sound)',
                    default: false
                },
                parse_mode: {
                    type: 'string',
                    description: 'Message parsing mode',
                    enum: ['Markdown', 'HTML', 'none'],
                    default: 'Markdown'
                }
            },
            required: ['user_id', 'message']
        };

        // Telegram Bot API configuration
        this.telegramConfig = {
            botToken: process.env.TELEGRAM_BOT_TOKEN,
            apiUrl: 'https://api.telegram.org/bot',
            webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
            maxRetries: 3,
            retryDelay: 1000
        };

        // Notification templates for different types
        this.notificationTemplates = {
            price_alert: {
                icon: '📉',
                emoji: '💰',
                prefix: 'PRICE ALERT',
                format: '*{prefix}*\n{icon} {title}\n\n{message}\n\n💰 Old Price: {old_price}\n✈️ New Price: {new_price}\n💵 Savings: {savings}'
            },
            deal_found: {
                icon: '🎯',
                emoji: '🔥',
                prefix: 'HOT DEAL',
                format: '*{prefix}*\n{icon} {title}\n\n{message}\n\n⏰ Expires: {expiry}\n🔗 {link}'
            },
            trip_update: {
                icon: '✈️',
                emoji: '🗓️',
                prefix: 'TRIP UPDATE',
                format: '*{prefix}*\n{icon} {title}\n\n{message}\n\n📅 Date: {date}\n📍 Location: {location}'
            },
            weather_warning: {
                icon: '⚠️',
                emoji: '🌦️',
                prefix: 'WEATHER ALERT',
                format: '*{prefix}*\n{icon} {title}\n\n{message}\n\n🌡️ Temperature: {temperature}\n💨 Wind: {wind}\n🌧️ Precipitation: {precipitation}'
            },
            general_info: {
                icon: 'ℹ️',
                emoji: '📢',
                prefix: 'INFO',
                format: '*{prefix}*\n{icon} {title}\n\n{message}'
            },
            urgent: {
                icon: '🚨',
                emoji: '‼️',
                prefix: 'URGENT',
                format: '*{prefix}*\n{icon} {title}\n\n{message}\n\n🔴 Action Required: {action}'
            }
        };

        // Rate limiting configuration
        this.rateLimits = {
            perUser: {
                maxMessages: 5,
                windowMs: 60000 // 1 minute
            },
            global: {
                maxMessages: 100,
                windowMs: 60000 // 1 minute
            }
        };

        // Message tracking for rate limiting
        this.messageTracker = new Map();
    }

    /**
     * Perform the actual Telegram notification sending
     * @param {Object} args - Validated arguments
     * @returns {Promise<Object>} Notification result
     */
    async performExecution(args) {
        const {
            user_id,
            message,
            notification_type = 'general_info',
            include_keyboard = false,
            keyboard_buttons = [],
            include_image = false,
            image_url,
            priority = 'normal',
            silent = false,
            parse_mode = 'Markdown'
        } = args;

        this.logger.info('Sending Telegram notification', {
            user_id,
            notification_type,
            priority,
            include_keyboard,
            include_image
        });

        try {
            // Check rate limits
            if (!this.checkRateLimit(user_id)) {
                throw new Error('Rate limit exceeded for this user');
            }

            // Format message based on notification type
            const formattedMessage = this.formatMessage(message, notification_type, args);
            
            // Prepare API request
            const telegramRequest = {
                chat_id: user_id,
                text: formattedMessage,
                parse_mode: parse_mode !== 'none' ? parse_mode : undefined,
                disable_notification: silent,
                reply_markup: include_keyboard ? this.buildKeyboard(keyboard_buttons) : undefined
            };

            let result;
            
            if (include_image && image_url) {
                // Send photo with caption
                result = await this.sendPhoto(user_id, image_url, formattedMessage, {
                    parse_mode: parse_mode !== 'none' ? parse_mode : undefined,
                    disable_notification: silent,
                    reply_markup: include_keyboard ? this.buildKeyboard(keyboard_buttons) : undefined
                });
            } else {
                // Send text message
                result = await this.sendTelegramMessage(telegramRequest);
            }

            // Track message for analytics
            this.trackNotification(user_id, notification_type, priority, result);

            return {
                success: true,
                message_id: result.message_id,
                chat_id: result.chat.id,
                notification_type,
                sent_at: new Date().toISOString(),
                delivery_status: 'sent',
                priority,
                message_length: formattedMessage.length,
                included_keyboard: include_keyboard,
                included_image: include_image
            };
        } catch (error) {
            this.logger.error('Telegram notification failed', { 
                error: error.message,
                user_id,
                notification_type
            });
            
            return {
                success: false,
                error: error.message,
                user_id,
                notification_type,
                sent_at: new Date().toISOString(),
                delivery_status: 'failed'
            };
        }
    }

    /**
     * Send message via Telegram Bot API
     * @param {Object} request - Telegram API request
     * @returns {Promise<Object>} API response
     */
    async sendTelegramMessage(request) {
        const url = `${this.telegramConfig.apiUrl}${this.telegramConfig.botToken}/sendMessage`;
        
        for (let attempt = 1; attempt <= this.telegramConfig.maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(request)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Telegram API error: ${errorData.description || response.statusText}`);
                }

                const result = await response.json();
                return result.result;
            } catch (error) {
                this.logger.warn(`Telegram API attempt ${attempt} failed`, { error: error.message });
                
                if (attempt === this.telegramConfig.maxRetries) {
                    throw error;
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, this.telegramConfig.retryDelay * attempt));
            }
        }
    }

    /**
     * Send photo via Telegram Bot API
     * @param {string} chatId - Chat ID
     * @param {string} imageUrl - Image URL
     * @param {string} caption - Photo caption
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} API response
     */
    async sendPhoto(chatId, imageUrl, caption, options = {}) {
        const url = `${this.telegramConfig.apiUrl}${this.telegramConfig.botToken}/sendPhoto`;
        
        const request = {
            chat_id: chatId,
            photo: imageUrl,
            caption: caption,
            ...options
        };

        for (let attempt = 1; attempt <= this.telegramConfig.maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(request)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Telegram API error: ${errorData.description || response.statusText}`);
                }

                const result = await response.json();
                return result.result;
            } catch (error) {
                this.logger.warn(`Telegram photo API attempt ${attempt} failed`, { error: error.message });
                
                if (attempt === this.telegramConfig.maxRetries) {
                    throw error;
                }
                
                await new Promise(resolve => setTimeout(resolve, this.telegramConfig.retryDelay * attempt));
            }
        }
    }

    /**
     * Build inline keyboard for Telegram message
     * @param {Array} buttons - Button configuration
     * @returns {Object} Keyboard markup
     */
    buildKeyboard(buttons) {
        if (!buttons || buttons.length === 0) {
            return undefined;
        }

        const inlineKeyboard = buttons.map(button => {
            const keyboardButton = {
                text: button.text
            };

            if (button.url) {
                keyboardButton.url = button.url;
            } else if (button.callback_data) {
                keyboardButton.callback_data = button.callback_data;
            }

            return [keyboardButton];
        });

        return {
            inline_keyboard: inlineKeyboard
        };
    }

    /**
     * Format message based on notification type
     * @param {string} message - Original message
     * @param {string} type - Notification type
     * @param {Object} args - Additional arguments for formatting
     * @returns {string} Formatted message
     */
    formatMessage(message, type, args = {}) {
        const template = this.notificationTemplates[type] || this.notificationTemplates.general_info;
        
        // Add priority indicator
        let priorityIndicator = '';
        if (args.priority === 'high') {
            priorityIndicator = '🔴 ';
        } else if (args.priority === 'critical') {
            priorityIndicator = '🚨 ';
        }

        // Format using template
        let formatted = template.format
            .replace(/{prefix}/g, template.prefix)
            .replace(/{icon}/g, template.icon)
            .replace(/{title}/g, args.title || 'Notification')
            .replace(/{message}/g, message);

        // Add additional template variables if provided
        Object.keys(args).forEach(key => {
            const placeholder = `{${key}}`;
            if (formatted.includes(placeholder)) {
                formatted = formatted.replace(new RegExp(placeholder, 'g'), args[key]);
            }
        });

        return priorityIndicator + formatted;
    }

    /**
     * Check rate limits for user
     * @param {string} userId - User ID
     * @returns {boolean} True if within rate limits
     */
    checkRateLimit(userId) {
        const now = Date.now();
        const userMessages = this.messageTracker.get(userId) || [];
        
        // Filter messages within the window
        const recentMessages = userMessages.filter(timestamp => 
            now - timestamp < this.rateLimits.perUser.windowMs
        );

        if (recentMessages.length >= this.rateLimits.perUser.maxMessages) {
            return false;
        }

        // Update tracker
        recentMessages.push(now);
        this.messageTracker.set(userId, recentMessages);
        
        return true;
    }

    /**
     * Track notification for analytics
     * @param {string} userId - User ID
     * @param {string} type - Notification type
     * @param {string} priority - Priority level
     * @param {Object} result - Send result
     */
    trackNotification(userId, type, priority, result) {
        this.logger.info('Notification tracked', {
            user_id: userId,
            type,
            priority,
            message_id: result.message_id,
            timestamp: new Date().toISOString()
        });
        
        // In production, this would be sent to analytics service
        // For now, just log the tracking data
    }

    /**
     * Send bulk notifications to multiple users
     * @param {Array} notifications - Array of notification objects
     * @returns {Promise<Array>} Results array
     */
    async sendBulkNotifications(notifications) {
        const results = [];
        
        for (const notification of notifications) {
            try {
                const result = await this.execute(notification);
                results.push({
                    user_id: notification.user_id,
                    success: true,
                    result
                });
            } catch (error) {
                results.push({
                    user_id: notification.user_id,
                    success: false,
                    error: error.message
                });
            }
        }
        
        return results;
    }

    /**
     * Get notification statistics
     * @returns {Object} Usage statistics
     */
    getNotificationStats() {
        const totalUsers = this.messageTracker.size;
        let totalMessages = 0;
        
        for (const messages of this.messageTracker.values()) {
            totalMessages += messages.length;
        }
        
        return {
            total_users: totalUsers,
            total_messages_sent: totalMessages,
            active_users_in_last_hour: Array.from(this.messageTracker.values())
                .filter(messages => {
                    const now = Date.now();
                    return messages.some(timestamp => now - timestamp < 3600000);
                }).length,
            rate_limit_status: 'active',
            last_updated: new Date().toISOString()
        };
    }

    /**
     * Clear message tracker (for testing/maintenance)
     * @param {string} userId - Optional user ID to clear specific user
     */
    clearMessageTracker(userId = null) {
        if (userId) {
            this.messageTracker.delete(userId);
        } else {
            this.messageTracker.clear();
        }
    }

    /**
     * Validate Telegram configuration
     * @returns {boolean} True if configuration is valid
     */
    validateConfiguration() {
        return !!(this.telegramConfig.botToken && 
                 this.telegramConfig.botToken.startsWith(''));
    }

    /**
     * Override validation to add custom checks
     * @param {Object} args - Input arguments
     * @returns {Object} Validation result
     */
    validateParameters(args) {
        const baseValidation = super.validateParameters(args);
        if (!baseValidation.valid) {
            return baseValidation;
        }

        // Validate Telegram configuration
        if (!this.validateConfiguration()) {
            return {
                valid: false,
                error: 'Telegram bot token not configured'
            };
        }

        // Validate user ID format
        if (args.user_id && !/^\d+$/.test(args.user_id.toString())) {
            return {
                valid: false,
                error: 'user_id must be a valid Telegram user ID (numeric)'
            };
        }

        // Validate message length
        if (args.message && args.message.length > 4096) {
            return {
                valid: false,
                error: 'Message length cannot exceed 4096 characters'
            };
        }

        // Validate image URL if provided
        if (args.include_image && !args.image_url) {
            return {
                valid: false,
                error: 'image_url is required when include_image is true'
            };
        }

        if (args.image_url && !this.isValidUrl(args.image_url)) {
            return {
                valid: false,
                error: 'image_url must be a valid URL'
            };
        }

        // Validate keyboard buttons
        if (args.keyboard_buttons && args.keyboard_buttons.length > 0) {
            for (const button of args.keyboard_buttons) {
                if (!button.text) {
                    return {
                        valid: false,
                        error: 'All keyboard buttons must have text'
                    };
                }
                
                if (!button.url && !button.callback_data) {
                    return {
                        valid: false,
                        error: 'Keyboard buttons must have either url or callback_data'
                    };
                }
            }
        }

        return { valid: true };
    }

    /**
     * Validate URL format
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid URL
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

module.exports = new SendTelegramNotificationTool();