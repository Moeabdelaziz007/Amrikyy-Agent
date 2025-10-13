/**
 * AIX Loader Utility
 * Loads and parses AIX agent definitions
 * 
 * AIX Integration - Cursor
 * Part of team test with Ona (Manager) and Gemini (QA)
 */

const fs = require('fs');
const path = require('path');

// Try to load js-yaml, fallback to simple parser
let yaml;
try {
  yaml = require('js-yaml');
} catch (e) {
  // Fallback: use root node_modules
  try {
    yaml = require('../../../node_modules/@istanbuljs/load-nyc-config/node_modules/js-yaml');
  } catch (e2) {
    console.warn('⚠️  js-yaml not found, using basic YAML parser');
    yaml = null;
  }
}

class AIXLoader {
  /**
   * Load AIX file and return parsed definition
   * @param {string} aixFilePath - Path to .aix file (relative to project root)
   * @returns {Object} Parsed AIX definition
   */
  static load(aixFilePath) {
    try {
      // Resolve path relative to project root
      const projectRoot = path.resolve(__dirname, '../../..');
      const fullPath = path.join(projectRoot, aixFilePath);
      
      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        throw new Error(`AIX file not found: ${fullPath}`);
      }
      
      // Read and parse YAML
      const content = fs.readFileSync(fullPath, 'utf8');
      const aixDef = yaml.load(content);
      
      // Validate basic structure
      if (!aixDef.meta) {
        throw new Error('AIX file missing required "meta" section');
      }
      if (!aixDef.persona) {
        throw new Error('AIX file missing required "persona" section');
      }
      if (!aixDef.skills) {
        throw new Error('AIX file missing required "skills" section');
      }
      
      console.log(`✅ Loaded AIX: ${aixDef.meta.name} v${aixDef.meta.version}`);
      console.log(`   ID: ${aixDef.meta.id}`);
      console.log(`   Skills: ${aixDef.skills.length}`);
      console.log(`   Author: ${aixDef.meta.author}`);
      
      return aixDef;
    } catch (error) {
      console.error(`❌ Failed to load AIX file: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get skill by name from AIX definition
   * @param {Object} aixDef - AIX definition
   * @param {string} skillName - Skill name
   * @returns {Object|null} Skill definition or null if not found
   */
  static getSkill(aixDef, skillName) {
    if (!aixDef.skills || !Array.isArray(aixDef.skills)) {
      return null;
    }
    return aixDef.skills.find(s => s.name === skillName) || null;
  }
  
  /**
   * Check if operation is allowed by security policy
   * @param {Object} aixDef - AIX definition
   * @param {string} operation - Operation name
   * @returns {boolean} True if allowed
   */
  static isOperationAllowed(aixDef, operation) {
    if (!aixDef.security || !aixDef.security.capabilities) {
      return false;
    }
    
    const allowed = aixDef.security.capabilities.allowed_operations || [];
    const restricted = aixDef.security.capabilities.restricted_operations || [];
    
    // Check if explicitly restricted
    if (restricted.includes(operation)) {
      return false;
    }
    
    // Check if explicitly allowed
    return allowed.includes(operation);
  }
  
  /**
   * Get rate limit for endpoint
   * @param {Object} aixDef - AIX definition
   * @param {string} endpoint - Endpoint name (e.g., 'hunt_endpoint')
   * @returns {number} Rate limit (requests per window)
   */
  static getRateLimit(aixDef, endpoint) {
    if (!aixDef.security || !aixDef.security.rate_limiting) {
      return 100; // Default fallback
    }
    
    return aixDef.security.rate_limiting[endpoint] || 100;
  }
  
  /**
   * Get all enabled skills
   * @param {Object} aixDef - AIX definition
   * @returns {Array} Array of enabled skills
   */
  static getEnabledSkills(aixDef) {
    if (!aixDef.skills || !Array.isArray(aixDef.skills)) {
      return [];
    }
    return aixDef.skills.filter(s => s.enabled === true);
  }
  
  /**
   * Get agent metadata
   * @param {Object} aixDef - AIX definition
   * @returns {Object} Agent metadata
   */
  static getMetadata(aixDef) {
    return {
      id: aixDef.meta.id,
      name: aixDef.meta.name,
      version: aixDef.meta.version,
      description: aixDef.meta.description,
      author: aixDef.meta.author,
      created: aixDef.meta.created,
      updated: aixDef.meta.updated
    };
  }
  
  /**
   * Validate AIX definition structure
   * @param {Object} aixDef - AIX definition
   * @returns {Object} Validation result {valid: boolean, errors: Array}
   */
  static validate(aixDef) {
    const errors = [];
    
    // Check required sections
    if (!aixDef.meta) errors.push('Missing required section: meta');
    if (!aixDef.persona) errors.push('Missing required section: persona');
    if (!aixDef.skills) errors.push('Missing required section: skills');
    
    // Check meta fields
    if (aixDef.meta) {
      if (!aixDef.meta.id) errors.push('Missing meta.id');
      if (!aixDef.meta.name) errors.push('Missing meta.name');
      if (!aixDef.meta.version) errors.push('Missing meta.version');
    }
    
    // Check skills is array
    if (aixDef.skills && !Array.isArray(aixDef.skills)) {
      errors.push('skills must be an array');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = AIXLoader;
