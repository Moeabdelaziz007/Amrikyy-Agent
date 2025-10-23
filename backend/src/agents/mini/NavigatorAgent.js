const { Client } = require('@googlemaps/google-maps-services-js');

class NavigatorAgent {
  constructor() {
    this.client = new Client({});
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY; // Requires GOOGLE_MAPS_API_KEY

    if (!this.apiKey) {
      console.warn('GOOGLE_MAPS_API_KEY is not set for NavigatorAgent. Real API calls will fail.');
      // In a production environment, you might throw an error or handle this more gracefully.
    }
  }

  async executeTask(task) {
    console.log(`Navigator Agent executing task: ${task.type}`);
    // Simulate network delay for consistency with other agents, even with real API calls
    await new Promise(resolve => setTimeout(resolve, 500)); 

    if (!this.apiKey) {
      throw new Error('Google Maps API Key is not configured. Cannot make real API calls.');
    }

    switch (task.type) {
      case 'getDirections':
        return await this.getDirections(task.origin, task.destination);
      case 'findNearby':
        return await this.findNearby(task.location, task.placeType);
      case 'geocode':
        return await this.geocode(task.address);
      default:
        throw new Error(`Unknown task type for Navigator Agent: ${task.type}`);
    }
  }

  // --- Real Google Maps API Methods ---
  async getDirections(origin, destination, mode = 'driving') {
    const response = await this.client.directions({
      params: {
        origin,
        destination,
        mode,
        key: this.apiKey
      }
    });
    return response.data.routes[0];
  }

  async findNearby(location, type, radius = 1000) {
    const response = await this.client.placesNearby({
      params: {
        location, // {lat, lng} expects an object like {lat: number, lng: number}
        type,
        radius,
        key: this.apiKey
      }
    });
    return { results: response.data.results };
  }

  async geocode(address) {
    const response = await this.client.geocode({
      params: {
        address,
        key: this.apiKey
      }
    });
    return { location: response.data.results[0].geometry.location };
  }
}

module.exports = NavigatorAgent;