/**
 * Communicator Agent - Email & Messaging
 * Specialization: Communication and notifications
 */

const logger = require('../../utils/logger');

class CommunicatorAgent {
  constructor() {
    this.name = 'Communicator';
    this.icon = '📧';
    this.messages = new Map(); // In-memory storage
  }

  /**
   * Execute a task
   */
  async executeTask(task) {
    logger.info(`[CommunicatorAgent] Executing task: ${task.type}`);
    
    try {
      switch (task.type) {
        case 'SEND_EMAIL':
          return await this.sendEmail(task.to, task.subject, task.body);
        case 'SEND_NOTIFICATION':
          return await this.sendNotification(task.userId, task.message);
        case 'EMAIL_ITINERARY':
          return await this.emailItinerary(task.to, task.itinerary);
        case 'SEND_CONFIRMATION':
          return await this.sendConfirmation(task.to, task.booking);
        case 'GET_MESSAGES':
          return await this.getMessages(task.userId);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      logger.error(`[CommunicatorAgent] Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send email
   */
  async sendEmail(to, subject, body) {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const message = {
      id: messageId,
      type: 'email',
      to,
      subject,
      body,
      sentAt: new Date(),
      status: 'sent'
    };

    this.messages.set(messageId, message);

    logger.info(`[CommunicatorAgent] Email sent to ${to}: ${subject}`);

    return {
      success: true,
      messageId,
      message: 'Email sent successfully',
      details: {
        to,
        subject,
        sentAt: message.sentAt
      }
    };
  }

  /**
   * Send notification
   */
  async sendNotification(userId, messageText) {
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const notification = {
      id: notificationId,
      type: 'notification',
      userId,
      message: messageText,
      sentAt: new Date(),
      read: false
    };

    this.messages.set(notificationId, notification);

    logger.info(`[CommunicatorAgent] Notification sent to user ${userId}`);

    return {
      success: true,
      notificationId,
      message: 'Notification sent successfully'
    };
  }

  /**
   * Email itinerary
   */
  async emailItinerary(to, itinerary) {
    const subject = `Your ${itinerary.destination} Trip Itinerary`;
    const body = this.formatItineraryEmail(itinerary);

    return await this.sendEmail(to, subject, body);
  }

  /**
   * Send booking confirmation
   */
  async sendConfirmation(to, booking) {
    const subject = `Booking Confirmation - ${booking.type}`;
    const body = this.formatConfirmationEmail(booking);

    return await this.sendEmail(to, subject, body);
  }

  /**
   * Get messages for user
   */
  async getMessages(userId) {
    const userMessages = Array.from(this.messages.values())
      .filter(msg => msg.userId === userId || msg.to === userId)
      .sort((a, b) => b.sentAt - a.sentAt);

    return {
      success: true,
      messages: userMessages,
      count: userMessages.length,
      unread: userMessages.filter(m => m.type === 'notification' && !m.read).length
    };
  }

  /**
   * Format itinerary email
   */
  formatItineraryEmail(itinerary) {
    let body = `Dear Traveler,\n\n`;
    body += `Here is your complete itinerary for your trip to ${itinerary.destination}.\n\n`;
    body += `Trip Details:\n`;
    body += `- Destination: ${itinerary.destination}\n`;
    body += `- Dates: ${itinerary.startDate} to ${itinerary.endDate}\n`;
    body += `- Duration: ${itinerary.days?.length || 0} days\n\n`;

    if (itinerary.days && itinerary.days.length > 0) {
      body += `Day-by-Day Itinerary:\n\n`;
      itinerary.days.forEach((day, index) => {
        body += `Day ${index + 1}: ${day.title || `Day ${index + 1}`}\n`;
        if (day.activities && day.activities.length > 0) {
          day.activities.forEach((activity, i) => {
            body += `  ${i + 1}. ${activity}\n`;
          });
        }
        body += `\n`;
      });
    }

    body += `\nHave a wonderful trip!\n\n`;
    body += `Best regards,\n`;
    body += `Amrikyy AI Travel Assistant\n`;

    return body;
  }

  /**
   * Format confirmation email
   */
  formatConfirmationEmail(booking) {
    let body = `Dear Customer,\n\n`;
    body += `Your booking has been confirmed!\n\n`;
    body += `Booking Details:\n`;
    body += `- Type: ${booking.type}\n`;
    body += `- Confirmation Number: ${booking.confirmationNumber || 'N/A'}\n`;
    body += `- Date: ${booking.date || 'N/A'}\n`;
    body += `- Location: ${booking.location || 'N/A'}\n\n`;

    if (booking.details) {
      body += `Additional Information:\n`;
      Object.entries(booking.details).forEach(([key, value]) => {
        body += `- ${key}: ${value}\n`;
      });
      body += `\n`;
    }

    body += `Thank you for choosing Amrikyy!\n\n`;
    body += `Best regards,\n`;
    body += `Amrikyy Team\n`;

    return body;
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
        'SEND_EMAIL',
        'SEND_NOTIFICATION',
        'EMAIL_ITINERARY',
        'SEND_CONFIRMATION',
        'GET_MESSAGES'
      ],
      totalMessages: this.messages.size
    };
  }
}

module.exports = CommunicatorAgent;
