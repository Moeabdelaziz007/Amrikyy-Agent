/**
 * Email Integration - Maya Travel Agent
 * Provides email-based travel planning functionality
 */

const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');

const log = logger.child('EmailIntegration');

module.exports = (connectionManager) => {
  // Register Email transport
  connectionManager.registerTransport('email', async (emailAddress, message) => {
    // This would integrate with SendGrid or Mailgun to send emails
    log.info(`Sending email to ${emailAddress}:`, message.subject);
    // Implementation would use email service API to send message
  });

  /**
   * Email webhook endpoint (for incoming emails)
   */
  router.post('/webhook', async (req, res) => {
    try {
      const { from, to, subject, text, html, attachments } = req.body;

      log.info('Email webhook received:', {
        from,
        to,
        subject,
        textLength: text?.length || 0,
        htmlLength: html?.length || 0,
        attachmentsCount: attachments?.length || 0,
      });

      // Extract email address from 'to' field
      const emailMatch = to.match(
        /plan@maya-trips\.com|support@maya-trips\.com|deals@maya-trips\.com/
      );
      const serviceType = emailMatch ? emailMatch[0].split('@')[0] : 'general';

      // Process email through AIXConnectionManager
      const response = await connectionManager.processMessage({
        from: `email_${from}`,
        to: 'maya-travel-agent',
        content: text || html,
        type: 'email_message',
        metadata: {
          emailFrom: from,
          emailTo: to,
          subject,
          serviceType,
          attachments: attachments || [],
          source: 'email',
          timestamp: Date.now(),
        },
      });

      // Send response email back
      await sendEmail(from, {
        subject: `Re: ${subject}`,
        text: response.content || response.message,
        html: formatEmailResponse(response),
      });

      res.status(200).json({ success: true });
    } catch (error) {
      log.error('Email webhook error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process email',
      });
    }
  });

  /**
   * Send email to user
   */
  async function sendEmail(to, emailData) {
    try {
      // Implementation would use SendGrid, Mailgun, or similar service
      log.info(`Sending email to ${to}:`, emailData.subject);

      // Example SendGrid implementation:
      // const msg = {
      //   to,
      //   from: 'noreply@maya-trips.com',
      //   subject: emailData.subject,
      //   text: emailData.text,
      //   html: emailData.html
      // };
      //
      // await sgMail.send(msg);
    } catch (error) {
      log.error('Error sending email:', error);
    }
  }

  /**
   * Format email response with HTML
   */
  function formatEmailResponse(response) {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>مايا - مساعد السفر</title>
          <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              .button { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
              .highlight { background: #fff3cd; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107; }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>🌍 مايا - مساعد السفر الذكي</h1>
              <p>مرحباً بك في عالم السفر المذهل!</p>
          </div>

          <div class="content">
              <div class="highlight">
                  ${response.content || response.message}
              </div>

              <h3>🚀 خدمات إضافية:</h3>
              <p>
                  <a href="https://maya-trips.com/plan" class="button">تخطيط رحلة جديدة</a>
                  <a href="https://maya-trips.com/deals" class="button">عروض السفر</a>
                  <a href="https://maya-trips.com/support" class="button">الدعم الفني</a>
              </p>

              <h3>📱 تواصل معنا:</h3>
              <ul>
                  <li>💬 واتساب: +966501234567</li>
                  <li>📧 البريد الإلكتروني: support@maya-trips.com</li>
                  <li>🌐 الموقع: https://maya-trips.com</li>
                  <li>📱 تطبيق الهاتف: متوفر على App Store و Google Play</li>
              </ul>
          </div>

          <div class="footer">
              <p>© 2025 مايا للسفر. جميع الحقوق محفوظة.</p>
              <p>تم إرسال هذا البريد تلقائياً من نظام مايا الذكي.</p>
          </div>
      </body>
      </html>
    `;
  }

  /**
   * Email templates for different services
   */
  const emailTemplates = {
    plan: {
      subject: 'تخطيط رحلتك مع مايا',
      template: 'plan_trip_template',
    },
    deals: {
      subject: 'عروض السفر الحصرية',
      template: 'deals_template',
    },
    support: {
      subject: 'دعم مايا للسفر',
      template: 'support_template',
    },
  };

  /**
   * Send trip planning email
   */
  router.post('/send-trip-plan', async (req, res) => {
    try {
      const { email, tripDetails } = req.body;

      const response = await connectionManager.processMessage({
        from: 'email_system',
        to: 'luna-trip-architect',
        content: JSON.stringify(tripDetails),
        type: 'email_trip_plan',
        metadata: { email, source: 'email' },
      });

      await sendEmail(email, {
        subject: '🎯 خطة رحلتك جاهزة!',
        text: response.content || response.message,
        html: formatEmailResponse(response),
      });

      res.status(200).json({ success: true });
    } catch (error) {
      log.error('Error sending trip plan email:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send trip plan email',
      });
    }
  });

  /**
   * Send deal alerts email
   */
  router.post('/send-deals', async (req, res) => {
    try {
      const { email, preferences } = req.body;

      const response = await connectionManager.processMessage({
        from: 'email_system',
        to: 'scout-deal-hunter',
        content: JSON.stringify(preferences),
        type: 'email_deals',
        metadata: { email, source: 'email' },
      });

      await sendEmail(email, {
        subject: '🔥 عروض سفر حصرية لك!',
        text: response.content || response.message,
        html: formatEmailResponse(response),
      });

      res.status(200).json({ success: true });
    } catch (error) {
      log.error('Error sending deals email:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send deals email',
      });
    }
  });

  /**
   * Email subscription management
   */
  router.post('/subscribe', async (req, res) => {
    try {
      const { email, preferences, subscriptionType } = req.body;

      // Store subscription in database
      // Implementation would save to database

      await sendEmail(email, {
        subject: '🎉 مرحباً بك في مايا!',
        text: 'تم تفعيل اشتراكك بنجاح. ستحصل على آخر العروض والتحديثات.',
        html: `
          <h2>مرحباً بك في مايا!</h2>
          <p>تم تفعيل اشتراكك بنجاح. ستحصل على:</p>
          <ul>
            <li>🔥 عروض السفر الحصرية</li>
            <li>📅 تذكيرات المناسبات</li>
            <li>💡 نصائح السفر الذكية</li>
            <li>🌍 توصيات الوجهات</li>
          </ul>
        `,
      });

      res.status(200).json({ success: true });
    } catch (error) {
      log.error('Error processing email subscription:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process subscription',
      });
    }
  });

  /**
   * Email statistics
   */
  router.get('/stats', async (req, res) => {
    try {
      const stats = {
        totalEmails: 0, // Would be tracked by email service
        activeSubscriptions: 0,
        emailTypes: {
          tripPlans: 0,
          dealAlerts: 0,
          support: 0,
          newsletters: 0,
        },
        openRates: {
          tripPlans: 0.85,
          dealAlerts: 0.72,
          support: 0.94,
          newsletters: 0.68,
        },
      };

      res.status(200).json({ success: true, stats });
    } catch (error) {
      log.error('Email stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get email statistics',
      });
    }
  });

  return router;
};
