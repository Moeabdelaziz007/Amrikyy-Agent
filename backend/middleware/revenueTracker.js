/**
 * Revenue Tracker Middleware
 * Automatically logs revenue events based on application activities
 */

const RevenueAnalyticsService = require('../src/services/revenueAnalytics');

class RevenueTracker {
  constructor() {
    this.revenueService = new RevenueAnalyticsService();
  }

  /**
   * Middleware to track revenue on payment completion
   * This is a backup to the database trigger - can be used for additional logic
   */
  trackPaymentRevenue() {
    return async (req, res, next) => {
      // Store original response methods
      const originalJson = res.json;
      const originalSend = res.send;
      const originalEnd = res.end;

      // Override response methods to intercept payment responses
      res.json = (data) => {
        this.handlePaymentResponse(req, res, data, 'json');
        return originalJson.call(res, data);
      };

      res.send = (data) => {
        this.handlePaymentResponse(req, res, data, 'send');
        return originalSend.call(res, data);
      };

      res.end = (data) => {
        this.handlePaymentResponse(req, res, data, 'end');
        return originalEnd.call(res, data);
      };

      next();
    };
  }

  /**
   * Handle payment response and log revenue if applicable
   */
  async handlePaymentResponse(req, res, data, method) {
    try {
      // Only process successful payment responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const isPaymentRoute = req.path.includes('/payment') || req.path.includes('/stripe');
        const isSuccessResponse = data && data.success === true;

        if (isPaymentRoute && isSuccessResponse) {
          await this.logPaymentRevenue(req, data);
        }
      }
    } catch (error) {
      // Don't fail the request if revenue tracking fails
      console.error('Revenue tracking error:', error);
    }
  }

  /**
   * Log revenue from payment response
   */
  async logPaymentRevenue(req, data) {
    try {
      const paymentData = data.payment || data.data;

      if (!paymentData || !paymentData.amount) return;

      // Extract relevant information
      const {
        amount,
        currency = 'SAR',
        description,
        id: paymentId,
        status
      } = paymentData;

      // Only log completed payments
      if (status !== 'completed' && status !== 'succeeded') return;

      // Get user and trip info from request (if available)
      const userId = req.user?.id || req.body?.userId;
      const tripId = req.body?.tripId;

      // Determine revenue source
      let source = 'payment';
      if (req.path.includes('/create-payment-link') || req.path.includes('/stripe')) {
        source = 'booking';
      }

      // Log the revenue event
      await this.revenueService.logRevenueEvent({
        userId,
        tripId,
        paymentId,
        amount,
        currency,
        description: description || `Payment revenue - ${source}`,
        source,
        status: 'completed',
        metadata: {
          requestPath: req.path,
          requestMethod: req.method,
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
          paymentProvider: this.detectPaymentProvider(req.path)
        }
      });

      console.log(`Revenue logged: ${amount} ${currency} from ${source}`);
    } catch (error) {
      console.error('Error logging payment revenue:', error);
    }
  }

  /**
   * Detect payment provider from request path
   */
  detectPaymentProvider(path) {
    if (path.includes('/stripe')) return 'stripe';
    if (path.includes('/paypal')) return 'paypal';
    if (path.includes('/telegram')) return 'telegram';
    return 'unknown';
  }

  /**
   * Middleware to track booking revenue
   */
  trackBookingRevenue() {
    return async (req, res, next) => {
      // Store original response methods
      const originalJson = res.json;

      res.json = (data) => {
        this.handleBookingResponse(req, res, data);
        return originalJson.call(res, data);
      };

      next();
    };
  }

  /**
   * Handle booking response and log revenue if applicable
   */
  async handleBookingResponse(req, res, data) {
    try {
      // Only process successful booking responses
      if (res.statusCode >= 200 && res.statusCode < 300 && data && data.success === true) {
        const bookingData = data.booking || data.trip || data.data;

        if (bookingData && bookingData.budget) {
          await this.logBookingRevenue(req, bookingData);
        }
      }
    } catch (error) {
      console.error('Booking revenue tracking error:', error);
    }
  }

  /**
   * Log revenue from booking
   */
  async logBookingRevenue(req, bookingData) {
    try {
      const {
        id: tripId,
        budget,
        user_id: userId,
        destination
      } = bookingData;

      if (!budget || budget <= 0) return;

      // Log booking revenue (initial booking amount)
      await this.revenueService.logRevenueEvent({
        userId,
        tripId,
        amount: budget,
        currency: 'SAR',
        description: `Trip booking - ${destination || 'Unknown destination'}`,
        source: 'booking',
        status: 'completed',
        metadata: {
          requestPath: req.path,
          bookingType: 'trip',
          destination: destination
        }
      });

      console.log(`Booking revenue logged: ${budget} SAR for trip ${tripId}`);
    } catch (error) {
      console.error('Error logging booking revenue:', error);
    }
  }

  /**
   * Middleware to track general application activities that might generate revenue
   */
  trackActivityRevenue() {
    return async (req, res, next) => {
      const startTime = Date.now();

      // Store original response methods
      const originalJson = res.json;
      const originalSend = res.send;

      res.json = (data) => {
        this.handleActivityResponse(req, res, data, startTime);
        return originalJson.call(res, data);
      };

      res.send = (data) => {
        this.handleActivityResponse(req, res, data, startTime);
        return originalSend.call(res, data);
      };

      next();
    };
  }

  /**
   * Handle general activity response
   */
  async handleActivityResponse(req, res, data, startTime) {
    try {
      // Track API usage for potential subscription/commission revenue
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const processingTime = Date.now() - startTime;
        const userId = req.user?.id;

        // Log API usage (could be used for subscription billing)
        if (userId && req.path.includes('/ai/')) {
          await this.logApiUsageRevenue(req, processingTime);
        }
      }
    } catch (error) {
      console.error('Activity revenue tracking error:', error);
    }
  }

  /**
   * Log API usage revenue (for subscription models)
   */
  async logApiUsageRevenue(req, processingTime) {
    try {
      // This could be used for per-request billing or usage-based subscriptions
      // For now, we'll just log the activity for analytics
      const userId = req.user?.id;

      if (!userId) return;

      // Log as a micro-transaction or usage event
      await this.revenueService.logRevenueEvent({
        userId,
        amount: 0.01, // Minimal amount for tracking purposes
        currency: 'SAR',
        description: `AI API usage - ${req.path}`,
        source: 'subscription',
        status: 'completed',
        metadata: {
          requestPath: req.path,
          processingTime,
          apiCall: true
        }
      });
    } catch (error) {
      console.error('Error logging API usage revenue:', error);
    }
  }

  /**
   * Manual revenue logging method for use in application code
   */
  async logRevenue(options) {
    return await this.revenueService.logRevenueEvent(options);
  }

  /**
   * Get revenue summary for a user (for user-facing features)
   */
  async getUserRevenueSummary(userId, options = {}) {
    const {
      startDate,
      endDate
    } = options;

    return await this.revenueService.getRevenueEvents({
      userId,
      startDate,
      endDate,
      status: 'completed'
    });
  }

  /**
   * Middleware factory for conditional revenue tracking
   */
  createConditionalTracker(conditionFn) {
    return (req, res, next) => {
      if (conditionFn(req)) {
        return this.trackPaymentRevenue()(req, res, next);
      }
      next();
    };
  }
}

// Create singleton instance
const revenueTracker = new RevenueTracker();

module.exports = revenueTracker;