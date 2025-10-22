
const dotenv = require('dotenv');
dotenv.config();

/**
 * @fileoverview Authentication Middleware
 *
 * This middleware handles API key-based authentication.
 */

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

if (!INTERNAL_API_KEY) {
  console.warn('WARNING: INTERNAL_API_KEY is not set. Authentication middleware will not be effective.');
}

/**
 * Validates a given API key.
 * For this initial implementation, it checks against a single environment variable.
 * @param {string} key - The API key to validate.
 * @returns {object|null} A user object if the key is valid, otherwise null.
 */
const validateKey = (key) => {
  if (key && key === INTERNAL_API_KEY) {
    // In a real-world scenario, you would look up the key in a database
    // and return the associated user and their permissions/role.
    return { id: 'internal-user', role: 'admin' };
  }
  return null;
};

/**
 * Express middleware to protect routes with API key authentication.
 * It checks for the API key in 'Authorization: Bearer <key>' or 'X-API-Key' headers.
 */
const requireAuth = (req, res, next) => {
  let apiKey = req.get('X-API-Key');
  if (!apiKey) {
    const authHeader = req.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7);
    }
  }

  if (!apiKey) {
    return res.status(401).json({ error: 'Unauthorized: API key is missing.' });
  }

  const user = validateKey(apiKey);

  if (!user) {
    return res.status(403).json({ error: 'Forbidden: Invalid API key.' });
  }

  req.user = user;
  req.apiKey = apiKey;
  next();
};

module.exports = { requireAuth, validateKey };
