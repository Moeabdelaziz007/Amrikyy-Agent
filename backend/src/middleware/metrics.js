
const metricsService = require('../services/metricsService');

/**
 * Middleware to track API requests for Prometheus metrics.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next function.
 */
const trackRequests = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : 'unknown_route';
    const status = res.statusCode;

    metricsService.increment('api_requests_total', { route, method: req.method, status });
    // We could also add a histogram for request duration here if needed
    // metricsService.observe('api_request_duration_seconds', { route, method: req.method, status }, duration / 1000);
  });

  next();
};

module.exports = { trackRequests };
