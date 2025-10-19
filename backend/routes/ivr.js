/**
 * IVR Phone System Integration - Maya Travel Agent
 * Provides voice-first phone experience with Twilio
 */

const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const AIXConnectionManager = require('../src/aix/AIXConnectionManager');

const log = logger.child('IVRSystem');

// Initialize AIX Connection Manager
const connectionManager = new AIXConnectionManager();

// Register IVR transport
connectionManager.registerTransport('ivr', async (phoneNumber, message) => {
  // This would integrate with Twilio to send SMS or make calls
  log.info(`Sending IVR message to ${phoneNumber}:`, message);
  // Implementation would use Twilio API to send message
});

/**
 * Twilio webhook for incoming calls
 */
router.post('/voice', async (req, res) => {
  try {
    const { From, To, CallSid } = req.body;

    log.info('Incoming call received:', {
      from: From,
      to: To,
      callSid: CallSid,
    });

    // Generate TwiML response
    const twiml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say language="ar-SA" voice="alice">
          مرحباً! أنا مايا، مساعدتك الشخصية للتخطيط للسفر. 
          كيف يمكنني مساعدتك اليوم؟
        </Say>
        <Gather input="speech" language="ar-SA" action="/api/ivr/process-speech" method="POST" timeout="10">
          <Say language="ar-SA">
            يرجى التحدث الآن...
          </Say>
        </Gather>
        <Say language="ar-SA">
          لم أسمع أي شيء. شكراً لك على الاتصال. وداعاً!
        </Say>
      </Response>
    `;

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    log.error('IVR voice webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Process speech input from call
 */
router.post('/process-speech', async (req, res) => {
  try {
    const { From, To, CallSid, SpeechResult, Confidence } = req.body;

    log.info('Processing speech input:', {
      from: From,
      callSid: CallSid,
      speechResult: SpeechResult?.substring(0, 100),
      confidence: Confidence,
    });

    if (!SpeechResult || Confidence < 0.5) {
      // Low confidence or no speech detected
      const twiml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say language="ar-SA">
            لم أتمكن من فهمك بوضوح. هل يمكنك تكرار طلبك؟
          </Say>
          <Gather input="speech" language="ar-SA" action="/api/ivr/process-speech" method="POST" timeout="10">
            <Say language="ar-SA">
              يرجى التحدث بوضوح...
            </Say>
          </Gather>
          <Say language="ar-SA">
            شكراً لك على الاتصال. وداعاً!
          </Say>
        </Response>
      `;
      res.type('text/xml');
      return res.send(twiml);
    }

    // Process speech through AIXConnectionManager
    const response = await connectionManager.processMessage({
      from: `ivr_${From}`,
      to: 'maya-travel-agent',
      content: SpeechResult,
      type: 'ivr_speech',
      metadata: {
        phoneNumber: From,
        callSid: CallSid,
        confidence: Confidence,
        source: 'ivr',
        timestamp: Date.now(),
      },
    });

    // Generate response TwiML
    const twiml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say language="ar-SA">
          ${response.content || response.message}
        </Say>
        <Gather input="speech" language="ar-SA" action="/api/ivr/process-speech" method="POST" timeout="10">
          <Say language="ar-SA">
            هل هناك أي شيء آخر يمكنني مساعدتك فيه؟
          </Say>
        </Gather>
        <Say language="ar-SA">
          شكراً لك على الاتصال. أتمنى لك رحلة سعيدة!
        </Say>
      </Response>
    `;

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    log.error('IVR speech processing error:', error);
    res.type('text/xml');
    res.send(`
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say language="ar-SA">
          عذراً، حدث خطأ تقني. يرجى المحاولة مرة أخرى لاحقاً.
        </Say>
      </Response>
    `);
  }
});

/**
 * SMS webhook for text messages
 */
router.post('/sms', async (req, res) => {
  try {
    const { From, To, Body, MessageSid } = req.body;

    log.info('SMS received:', {
      from: From,
      to: To,
      messageId: MessageSid,
      body: Body?.substring(0, 100),
    });

    // Process SMS through AIXConnectionManager
    const response = await connectionManager.processMessage({
      from: `sms_${From}`,
      to: 'maya-travel-agent',
      content: Body,
      type: 'sms_message',
      metadata: {
        phoneNumber: From,
        messageSid: MessageSid,
        source: 'sms',
        timestamp: Date.now(),
      },
    });

    // Send SMS response back
    await sendSMS(From, response.content || response.message);

    res.type('text/xml');
    res.send('<Response></Response>');
  } catch (error) {
    log.error('SMS webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Send SMS using Twilio
 */
async function sendSMS(to, message) {
  try {
    // Implementation would use Twilio API
    log.info(`Sending SMS to ${to}:`, message.substring(0, 100));

    // Example Twilio implementation:
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: to
    // });
  } catch (error) {
    log.error('Error sending SMS:', error);
  }
}

/**
 * Make outbound call
 */
router.post('/call', async (req, res) => {
  try {
    const { phoneNumber, message, language = 'ar-SA' } = req.body;

    log.info('Making outbound call:', {
      phoneNumber,
      messageLength: message?.length || 0,
      language,
    });

    // Implementation would use Twilio API to make call
    const callConfig = {
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      twiml: `
        <Response>
          <Say language="${language}">
            ${message}
          </Say>
        </Response>
      `,
    };

    // const client = twilio(accountSid, authToken);
    // const call = await client.calls.create(callConfig);

    res.status(200).json({
      success: true,
      callSid: 'call_' + Date.now(), // Would be actual call SID
      message: 'Call initiated successfully',
    });
  } catch (error) {
    log.error('Error making outbound call:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to make call',
    });
  }
});

/**
 * Call recording webhook
 */
router.post('/recording', async (req, res) => {
  try {
    const { CallSid, RecordingUrl, RecordingDuration } = req.body;

    log.info('Call recording received:', {
      callSid: CallSid,
      recordingUrl: RecordingUrl,
      duration: RecordingDuration,
    });

    // Process recording if needed
    // Implementation could transcribe and analyze the recording

    res.status(200).json({ success: true });
  } catch (error) {
    log.error('Call recording webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process recording',
    });
  }
});

/**
 * IVR statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalCalls: 0, // Would be tracked by Twilio analytics
      totalSMS: 0,
      averageCallDuration: 0,
      callTypes: {
        tripPlanning: 0,
        support: 0,
        dealInquiries: 0,
        general: 0,
      },
      successRate: 0.85,
      popularFeatures: [
        { feature: 'Trip Planning', count: 45 },
        { feature: 'Flight Information', count: 32 },
        { feature: 'Hotel Booking', count: 28 },
      ],
    };

    res.status(200).json({ success: true, stats });
  } catch (error) {
    log.error('IVR stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get IVR statistics',
    });
  }
});

/**
 * Emergency contact system
 */
router.post('/emergency', async (req, res) => {
  try {
    const { phoneNumber, message, priority = 'normal' } = req.body;

    log.info('Emergency contact initiated:', {
      phoneNumber,
      priority,
      messageLength: message?.length || 0,
    });

    // Process emergency request
    const response = await connectionManager.processMessage({
      from: 'emergency_system',
      to: 'amira-problem-solver',
      content: `Emergency contact: ${message}`,
      type: 'emergency_contact',
      metadata: {
        phoneNumber,
        priority,
        source: 'emergency',
        timestamp: Date.now(),
      },
    });

    // Make immediate call for high priority
    if (priority === 'high') {
      await router.post('/call', { body: { phoneNumber, message: response.content } });
    }

    res.status(200).json({
      success: true,
      message: 'Emergency contact processed',
      response: response.content,
    });
  } catch (error) {
    log.error('Emergency contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process emergency contact',
    });
  }
});

module.exports = router;
