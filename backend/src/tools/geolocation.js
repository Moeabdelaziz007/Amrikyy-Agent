/**
 * @fileoverview Geolocation tool to find the user's location based on their IP address.
 * @description This tool makes a mock API call to ipapi.co to fetch geolocation data.
 * It follows the established BaseTool class pattern for the Amrikyy project.
 * Enhanced with LangSmith tracing for complete visibility.
 */

const fetch = require('node-fetch');
const BaseTool = require('./BaseTool');
const { wrapTool } = require('../utils/langsmith_helpers');

class GeolocationTool extends BaseTool {
  constructor() {
    super(
      'geolocation',
      "Finds the user's current location based on their IP address.",
      {} // No parameters
    );
  }

  async execute() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) {
        throw new Error(`API call failed with status ${response.status}`);
      }
      const data = await response.json();
      return { city: data.city, country: data.country_name, latitude: data.latitude };
    } catch (error) {
      return { error: `Failed to fetch geolocation data: ${error.message}` };
    }
  }
}

// إنشاء الأداة وتطبيق التتبع عليها
const geolocationTool = new GeolocationTool();
const tracedGeolocationTool = geolocationTool.applyTracing({
  name: 'geolocation',
  tags: ['tool', 'geolocation', 'api'],
  metadata: {
    apiEndpoint: 'https://ipapi.co/json/',
    purpose: 'Get user location from IP address'
  }
});

module.exports = tracedGeolocationTool;
