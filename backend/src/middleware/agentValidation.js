/**
 * Agent Input Validation Middleware
 * Uses Joi for schema validation
 *
 * Validates:
 * - Request parameters
 * - Query strings
 * - Request body
 * - Agent-specific schemas
 *
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Common validation schemas
 */
const schemas = {
  // Agent name parameter
  agentName: Joi.string().valid('travel', 'content', 'innovation').required(),

  // Pagination
  pagination: Joi.object({
    limit: Joi.number().integer().min(1).max(1000).default(100),
    offset: Joi.number().integer().min(0).default(0),
  }),

  // Cache operations
  cachePattern: Joi.object({
    pattern: Joi.string().optional(),
  }),

  cacheWarm: Joi.object({
    queries: Joi.array().items(Joi.string()).min(1).max(100).required(),
  }),

  // Travel agent inputs
  travelAgent: {
    searchFlights: Joi.object({
      origin: Joi.string().length(3).uppercase().required().description('Airport code (e.g., LAX)'),
      destination: Joi.string()
        .length(3)
        .uppercase()
        .required()
        .description('Airport code (e.g., NRT)'),
      date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .description('Date in YYYY-MM-DD format'),
      returnDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .description('Return date in YYYY-MM-DD format'),
      passengers: Joi.number().integer().min(1).max(9).default(1),
      class: Joi.string().valid('economy', 'premium', 'business', 'first').default('economy'),
    }),

    searchHotels: Joi.object({
      destination: Joi.string().required().description('City or location'),
      checkIn: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
      checkOut: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
      guests: Joi.number().integer().min(1).max(10).default(2),
      rooms: Joi.number().integer().min(1).max(5).default(1),
      stars: Joi.number().integer().min(1).max(5).optional(),
    }),

    generateItinerary: Joi.object({
      destination: Joi.string().required(),
      duration: Joi.number().integer().min(1).max(30).required(),
      budget: Joi.number().min(0).required(),
      travelers: Joi.number().integer().min(1).max(10).default(1),
      interests: Joi.array().items(Joi.string()).optional(),
    }),
  },

  // Content agent inputs
  contentAgent: {
    generateBlogPost: Joi.object({
      topic: Joi.string().min(3).max(200).required(),
      tone: Joi.string()
        .valid('professional', 'casual', 'friendly', 'formal', 'humorous')
        .default('professional'),
      length: Joi.string().valid('short', 'medium', 'long').default('medium'),
      keywords: Joi.array().items(Joi.string()).max(10).optional(),
      targetAudience: Joi.string().optional(),
    }),

    generateSocialPosts: Joi.object({
      topic: Joi.string().min(3).max(200).required(),
      platforms: Joi.array()
        .items(Joi.string().valid('twitter', 'facebook', 'instagram', 'linkedin', 'tiktok'))
        .min(1)
        .max(5)
        .required(),
      tone: Joi.string().valid('professional', 'casual', 'friendly', 'humorous').default('casual'),
      hashtags: Joi.boolean().default(true),
    }),

    generateVideoScript: Joi.object({
      topic: Joi.string().min(3).max(200).required(),
      duration: Joi.number()
        .integer()
        .min(30)
        .max(3600)
        .required()
        .description('Duration in seconds'),
      style: Joi.string()
        .valid('tutorial', 'vlog', 'review', 'educational', 'entertainment')
        .default('educational'),
    }),
  },

  // Innovation agent inputs
  innovationAgent: {
    generateIdeas: Joi.object({
      niche: Joi.string().min(3).max(100).required(),
      problem: Joi.string().min(10).max(500).optional(),
      constraints: Joi.array().items(Joi.string()).optional(),
      count: Joi.number().integer().min(1).max(20).default(5),
    }),

    analyzeTrends: Joi.object({
      industry: Joi.string().min(3).max(100).required(),
      timeframe: Joi.string().valid('current', 'emerging', 'future').default('current'),
      region: Joi.string().optional(),
    }),

    analyzeCompetitors: Joi.object({
      niche: Joi.string().min(3).max(100).required(),
      competitors: Joi.array().items(Joi.string()).min(1).max(10).required(),
      focus: Joi.string().valid('pricing', 'features', 'marketing', 'all').default('all'),
    }),
  },
};

/**
 * Validate middleware factory
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data =
      source === 'body'
        ? req.body
        : source === 'query'
          ? req.query
          : source === 'params'
            ? req.params
            : req[source];

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type,
      }));

      logger.warn('[Validation] Request validation failed', {
        path: req.path,
        errors,
      });

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
    }

    // Replace with validated and sanitized data
    if (source === 'body') {
      req.body = value;
    } else if (source === 'query') {
      req.query = value;
    } else if (source === 'params') {
      req.params = value;
    }

    next();
  };
}

/**
 * Validate agent name parameter
 */
const validateAgentName = validate(Joi.object({ agent: schemas.agentName }), 'params');

/**
 * Validate pagination query
 */
const validatePagination = validate(schemas.pagination, 'query');

/**
 * Validate cache clear request
 */
const validateCacheClear = validate(schemas.cachePattern, 'body');

/**
 * Validate cache warm request
 */
const validateCacheWarm = validate(schemas.cacheWarm, 'body');

/**
 * Travel agent validation middleware
 */
const validateTravelAgent = {
  searchFlights: validate(schemas.travelAgent.searchFlights, 'body'),
  searchHotels: validate(schemas.travelAgent.searchHotels, 'body'),
  generateItinerary: validate(schemas.travelAgent.generateItinerary, 'body'),
};

/**
 * Content agent validation middleware
 */
const validateContentAgent = {
  generateBlogPost: validate(schemas.contentAgent.generateBlogPost, 'body'),
  generateSocialPosts: validate(schemas.contentAgent.generateSocialPosts, 'body'),
  generateVideoScript: validate(schemas.contentAgent.generateVideoScript, 'body'),
};

/**
 * Innovation agent validation middleware
 */
const validateInnovationAgent = {
  generateIdeas: validate(schemas.innovationAgent.generateIdeas, 'body'),
  analyzeTrends: validate(schemas.innovationAgent.analyzeTrends, 'body'),
  analyzeCompetitors: validate(schemas.innovationAgent.analyzeCompetitors, 'body'),
};

/**
 * Custom validation for specific use cases
 */
function validateCustom(validatorFn) {
  return (req, res, next) => {
    try {
      const result = validatorFn(req);

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: result.errors || [],
        });
      }

      next();
    } catch (error) {
      logger.error('[Validation] Custom validation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Validation error',
      });
    }
  };
}

/**
 * Example custom validators
 */
const customValidators = {
  // Validate date is in the future
  futureDate: validateCustom((req) => {
    const date = new Date(req.body.date);
    const now = new Date();

    if (date <= now) {
      return {
        valid: false,
        errors: [{ field: 'date', message: 'Date must be in the future' }],
      };
    }

    return { valid: true };
  }),

  // Validate return date is after departure date
  returnAfterDeparture: validateCustom((req) => {
    if (req.body.returnDate) {
      const departure = new Date(req.body.date);
      const returnDate = new Date(req.body.returnDate);

      if (returnDate <= departure) {
        return {
          valid: false,
          errors: [
            {
              field: 'returnDate',
              message: 'Return date must be after departure date',
            },
          ],
        };
      }
    }

    return { valid: true };
  }),

  // Validate budget is reasonable
  reasonableBudget: validateCustom((req) => {
    const budget = req.body.budget;
    const duration = req.body.duration;

    if (budget && duration) {
      const dailyBudget = budget / duration;

      if (dailyBudget < 20) {
        return {
          valid: false,
          errors: [
            {
              field: 'budget',
              message: `Budget of $${dailyBudget.toFixed(2)}/day may be too low`,
            },
          ],
        };
      }
    }

    return { valid: true };
  }),
};

/**
 * Coordinator workflow validators
 */
const validateSequentialWorkflow = validate(
  Joi.object({
    steps: Joi.array()
      .items(
        Joi.object({
          agent: Joi.string().required(),
          method: Joi.string().required(),
          transform: Joi.any().optional(),
        })
      )
      .min(1)
      .required(),
    input: Joi.any().required(),
    transformers: Joi.any().optional(),
  }),
  'body'
);

const validateParallelWorkflow = validate(
  Joi.object({
    tasks: Joi.array()
      .items(
        Joi.object({
          agent: Joi.string().required(),
          method: Joi.string().required(),
          input: Joi.any().optional(),
        })
      )
      .min(1)
      .required(),
    input: Joi.any().optional(),
  }),
  'body'
);

const validateHierarchicalWorkflow = validate(
  Joi.object({
    master: Joi.object({
      name: Joi.string().required(),
      method: Joi.string().required(),
    }).required(),
    subAgents: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          method: Joi.string().required(),
          inputTransform: Joi.any().optional(),
        })
      )
      .min(1)
      .required(),
    input: Joi.any().required(),
    aggregator: Joi.any().optional(),
  }),
  'body'
);

const validateCoordinatorWorkflow = validate(
  Joi.object({
    workflowName: Joi.string().required(),
    inputs: Joi.any().required(),
    options: Joi.object().optional(),
    async: Joi.boolean().optional(),
  }),
  'body'
);

module.exports = {
  validate,
  validateAgentName,
  validatePagination,
  validateCacheClear,
  validateCacheWarm,
  validateTravelAgent,
  validateContentAgent,
  validateInnovationAgent,
  validateCustom,
  validateSequentialWorkflow,
  validateParallelWorkflow,
  validateHierarchicalWorkflow,
  validateCoordinatorWorkflow,
  customValidators,
  schemas,
};
