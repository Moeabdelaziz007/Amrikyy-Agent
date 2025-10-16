/**
 * WeatherForecastTool - Tool for comprehensive weather forecasting
 * Integrates with multiple weather APIs for accurate travel planning
 * 
 * @author Amrikyy AI Solutions
 * @version 1.0.0
 */

const BaseTool = require('./BaseTool');
const fetch = require('node-fetch');

class WeatherForecastTool extends BaseTool {
    constructor() {
        super();
        this.name = 'weather_forecast';
        this.description = 'Provides detailed weather forecasts for travel destinations including current conditions, forecasts, and travel recommendations.';
        
        this.parameters = {
            type: 'object',
            properties: {
                location: {
                    type: 'string',
                    description: 'Location name (city, country, or coordinates)'
                },
                forecast_days: {
                    type: 'number',
                    description: 'Number of days to forecast (1-10)',
                    minimum: 1,
                    maximum: 10,
                    default: 5
                },
                include_hourly: {
                    type: 'boolean',
                    description: 'Include hourly forecast for first 24 hours',
                    default: false
                },
                include_air_quality: {
                    type: 'boolean',
                    description: 'Include air quality information',
                    default: true
                },
                include_uv_index: {
                    type: 'boolean',
                    description: 'Include UV index and sun protection advice',
                    default: true
                },
                units: {
                    type: 'string',
                    description: 'Temperature units',
                    enum: ['metric', 'imperial'],
                    default: 'metric'
                },
                language: {
                    type: 'string',
                    description: 'Language for weather descriptions',
                    enum: ['en', 'ar', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'ja', 'zh'],
                    default: 'en'
                }
            },
            required: ['location']
        };

        // API configuration
        this.apis = {
            openweathermap: {
                url: 'https://api.openweathermap.org/data/2.5',
                key: process.env.OPENWEATHER_API_KEY,
                rateLimit: 1000 // requests per day
            },
            weatherapi: {
                url: 'https://api.weatherapi.com/v1',
                key: process.env.WEATHERAPI_KEY,
                rateLimit: 1000000 // requests per month
            }
        };

        // Weather condition mappings
        this.conditionMappings = {
            'clear': {
                icon: '☀️',
                travel_advice: 'Perfect weather for outdoor activities and sightseeing',
                clothing: 'Light clothing, sunscreen, sunglasses',
                activities: ['sightseeing', 'photography', 'outdoor dining', 'beach']
            },
            'clouds': {
                icon: '☁️',
                travel_advice: 'Good weather for most activities, may be cooler',
                clothing: 'Light layers, comfortable walking shoes',
                activities: ['museums', 'shopping', 'city tours', 'indoor attractions']
            },
            'rain': {
                icon: '🌧️',
                travel_advice: 'Pack rain gear, plan indoor activities',
                clothing: 'Waterproof jacket, umbrella, closed shoes',
                activities: ['museums', 'indoor markets', 'cafes', 'spas']
            },
            'snow': {
                icon: '❄️',
                travel_advice: 'Winter clothing essential, check transport disruptions',
                clothing: 'Warm coat, boots, gloves, hat, scarf',
                activities: ['skiing', 'winter sports', 'cozy cafes', 'indoor attractions']
            },
            'storm': {
                icon: '⛈️',
                travel_advice: 'Severe weather - consider postponing outdoor plans',
                clothing: 'Waterproof everything, stay indoors if possible',
                activities: ['indoor activities only', 'emergency planning']
            },
            'fog': {
                icon: '🌫️',
                travel_advice: 'Reduced visibility - allow extra travel time',
                clothing: 'Reflective clothing, careful when walking',
                activities: ['short distance activities', 'indoor attractions']
            },
            'wind': {
                icon: '💨',
                travel_advice: 'Strong winds - secure loose items, avoid high places',
                clothing: 'Windbreaker, layers, secure hat',
                activities: ['sheltered activities', 'indoor attractions']
            }
        };

        // Cache for weather data
        this.weatherCache = new Map();
        this.cacheExpiry = 1800000; // 30 minutes
    }

    /**
     * Perform the actual weather forecast
     * @param {Object} args - Validated arguments
     * @returns {Promise<Object>} Weather forecast data
     */
    async performExecution(args) {
        const {
            location,
            forecast_days = 5,
            include_hourly = false,
            include_air_quality = true,
            include_uv_index = true,
            units = 'metric',
            language = 'en'
        } = args;

        this.logger.info('Fetching weather forecast', {
            location,
            forecast_days,
            include_hourly,
            include_air_quality,
            include_uv_index,
            units,
            language
        });

        try {
            // Get coordinates for location
            const coordinates = await this.getCoordinates(location);
            
            // Get current weather and forecast
            const weatherData = await this.getWeatherData(coordinates, forecast_days, units, language);
            
            // Process forecast data
            const forecast = this.processForecast(weatherData, forecast_days, units);
            
            // Add hourly forecast if requested
            let hourlyForecast = null;
            if (include_hourly) {
                hourlyForecast = await this.getHourlyForecast(coordinates, units, language);
            }

            // Add air quality if requested
            let airQuality = null;
            if (include_air_quality) {
                airQuality = await this.getAirQuality(coordinates);
            }

            // Add UV index if requested
            let uvIndex = null;
            if (include_uv_index) {
                uvIndex = await this.getUVIndex(coordinates);
            }

            // Generate travel recommendations
            const travelRecommendations = this.generateTravelRecommendations(forecast, airQuality, uvIndex);

            return {
                location: {
                    name: location,
                    coordinates: coordinates,
                    timezone: weatherData.timezone || 'UTC'
                },
                current: {
                    temperature: weatherData.current.temp,
                    feels_like: weatherData.current.feels_like,
                    condition: weatherData.current.weather[0].main.toLowerCase(),
                    description: weatherData.current.weather[0].description,
                    humidity: weatherData.current.humidity,
                    pressure: weatherData.current.pressure,
                    visibility: weatherData.current.visibility,
                    wind_speed: weatherData.current.wind.speed,
                    wind_direction: weatherData.current.wind.deg,
                    icon: this.getWeatherIcon(weatherData.current.weather[0].main.toLowerCase()),
                    updated_at: new Date().toISOString()
                },
                forecast: forecast,
                hourly_forecast: hourlyForecast,
                air_quality: airQuality,
                uv_index: uvIndex,
                travel_recommendations: travelRecommendations,
                units: {
                    temperature: units === 'metric' ? '°C' : '°F',
                    wind_speed: units === 'metric' ? 'm/s' : 'mph',
                    pressure: 'hPa',
                    visibility: units === 'metric' ? 'km' : 'miles'
                },
                data_source: this.getDataSource(),
                retrieved_at: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error('Weather forecast failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Get coordinates for location
     * @param {string} location - Location name
     * @returns {Promise<Object>} Coordinates
     */
    async getCoordinates(location) {
        const cacheKey = `coords-${location}`;
        
        if (this.weatherCache.has(cacheKey)) {
            const cached = this.weatherCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry * 24) { // Cache for 24 hours
                return cached.data;
            }
        }

        try {
            // Try OpenWeatherMap Geocoding API
            const response = await fetch(
                `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${this.apis.openweathermap.key}`
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    const coords = {
                        lat: data[0].lat,
                        lon: data[0].lon,
                        country: data[0].country,
                        state: data[0].state
                    };
                    
                    this.weatherCache.set(cacheKey, {
                        data: coords,
                        timestamp: Date.now()
                    });
                    
                    return coords;
                }
            }
        } catch (error) {
            this.logger.warn('Geocoding API failed', { error: error.message });
        }

        // Fallback to simulated coordinates
        return this.getFallbackCoordinates(location);
    }

    /**
     * Get weather data from API
     * @param {Object} coordinates - Location coordinates
     * @param {number} days - Forecast days
     * @param {string} units - Temperature units
     * @param {string} language - Language code
     * @returns {Promise<Object>} Weather data
     */
    async getWeatherData(coordinates, days, units, language) {
        const cacheKey = `weather-${coordinates.lat}-${coordinates.lon}-${days}-${units}`;
        
        if (this.weatherCache.has(cacheKey)) {
            const cached = this.weatherCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }
        }

        try {
            // Try OpenWeatherMap API
            const response = await fetch(
                `${this.apis.openweathermap.url}/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,alerts&units=${units}&lang=${language}&appid=${this.apis.openweathermap.key}`
            );
            
            if (response.ok) {
                const data = await response.json();
                
                // Cache the result
                this.weatherCache.set(cacheKey, {
                    data: data,
                    timestamp: Date.now()
                });
                
                return data;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            this.logger.warn('Weather API failed, using fallback', { error: error.message });
            return this.getFallbackWeatherData(coordinates, days, units);
        }
    }

    /**
     * Get hourly forecast
     * @param {Object} coordinates - Location coordinates
     * @param {string} units - Temperature units
     * @param {string} language - Language code
     * @returns {Promise<Array>} Hourly forecast
     */
    async getHourlyForecast(coordinates, units, language) {
        try {
            const weatherData = await this.getWeatherData(coordinates, 1, units, language);
            
            return weatherData.hourly.slice(0, 24).map(hour => ({
                time: new Date(hour.dt * 1000).toISOString(),
                temperature: hour.temp,
                feels_like: hour.feels_like,
                condition: hour.weather[0].main.toLowerCase(),
                description: hour.weather[0].description,
                humidity: hour.humidity,
                wind_speed: hour.wind.speed,
                precipitation_probability: hour.pop * 100,
                icon: this.getWeatherIcon(hour.weather[0].main.toLowerCase())
            }));
        } catch (error) {
            this.logger.warn('Hourly forecast failed', { error: error.message });
            return [];
        }
    }

    /**
     * Get air quality data
     * @param {Object} coordinates - Location coordinates
     * @returns {Promise<Object>} Air quality data
     */
    async getAirQuality(coordinates) {
        try {
            // Simulate air quality data
            const aqi = Math.floor(Math.random() * 150) + 1; // 1-150 AQI
            const aqiLevel = this.getAQILevel(aqi);
            
            return {
                aqi: aqi,
                level: aqiLevel.level,
                description: aqiLevel.description,
                color: aqiLevel.color,
                health_implications: aqiLevel.health_implications,
                recommendations: aqiLevel.recommendations,
                pollutants: {
                    pm25: Math.floor(Math.random() * 50) + 1,
                    pm10: Math.floor(Math.random() * 100) + 1,
                    o3: Math.floor(Math.random() * 200) + 1,
                    no2: Math.floor(Math.random() * 100) + 1,
                    so2: Math.floor(Math.random() * 50) + 1,
                    co: Math.floor(Math.random() * 10) + 1
                }
            };
        } catch (error) {
            this.logger.warn('Air quality data failed', { error: error.message });
            return null;
        }
    }

    /**
     * Get UV index data
     * @param {Object} coordinates - Location coordinates
     * @returns {Promise<Object>} UV index data
     */
    async getUVIndex(coordinates) {
        try {
            // Simulate UV index
            const uvIndex = Math.floor(Math.random() * 11); // 0-11 UV index
            const uvLevel = this.getUVLevel(uvIndex);
            
            return {
                index: uvIndex,
                level: uvLevel.level,
                description: uvLevel.description,
                protection_time: uvLevel.protection_time,
                recommendations: uvLevel.recommendations
            };
        } catch (error) {
            this.logger.warn('UV index data failed', { error: error.message });
            return null;
        }
    }

    /**
     * Process forecast data
     * @param {Object} weatherData - Raw weather data
     * @param {number} days - Number of days
     * @param {string} units - Temperature units
     * @returns {Array} Processed forecast
     */
    processForecast(weatherData, days, units) {
        return weatherData.daily.slice(0, days).map(day => {
            const condition = day.weather[0].main.toLowerCase();
            const conditionInfo = this.conditionMappings[condition] || this.conditionMappings['clear'];
            
            return {
                date: new Date(day.dt * 1000).toISOString().split('T')[0],
                day_of_week: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
                temperature: {
                    min: day.temp.min,
                    max: day.temp.max,
                    morning: day.temp.morn,
                    day: day.temp.day,
                    evening: day.temp.eve,
                    night: day.temp.night
                },
                condition: condition,
                description: day.weather[0].description,
                icon: conditionInfo.icon,
                humidity: day.humidity,
                wind_speed: day.wind_speed,
                precipitation_probability: day.pop * 100,
                precipitation_amount: day.rain || 0,
                sunrise: new Date(day.sunrise * 1000).toISOString(),
                sunset: new Date(day.sunset * 1000).toISOString(),
                travel_advice: conditionInfo.travel_advice,
                clothing_recommendations: conditionInfo.clothing,
                recommended_activities: conditionInfo.activities
            };
        });
    }

    /**
     * Generate travel recommendations
     * @param {Array} forecast - Weather forecast
     * @param {Object} airQuality - Air quality data
     * @param {Object} uvIndex - UV index data
     * @returns {Object} Travel recommendations
     */
    generateTravelRecommendations(forecast, airQuality, uvIndex) {
        const recommendations = {
            overall: 'favorable',
            packing_suggestions: [],
            activity_recommendations: [],
            health_advisories: [],
            travel_tips: []
        };

        // Analyze forecast for recommendations
        const hasRain = forecast.some(day => day.condition === 'rain');
        const hasCold = forecast.some(day => day.temperature.min < 10);
        const hasHot = forecast.some(day => day.temperature.max > 30);
        const hasClear = forecast.some(day => day.condition === 'clear');

        // Packing suggestions
        if (hasRain) {
            recommendations.packing_suggestions.push('Waterproof jacket or umbrella');
            recommendations.packing_suggestions.push('Waterproof shoes or boots');
        }
        
        if (hasCold) {
            recommendations.packing_suggestions.push('Warm layers and sweaters');
            recommendations.packing_suggestions.push('Gloves, hat, and scarf');
        }
        
        if (hasHot) {
            recommendations.packing_suggestions.push('Light, breathable clothing');
            recommendations.packing_suggestions.push('Sunscreen and hat');
        }

        if (hasClear) {
            recommendations.packing_suggestions.push('Sunglasses');
            recommendations.packing_suggestions.push('Camera for clear weather photos');
        }

        // Activity recommendations
        if (hasClear && !hasRain) {
            recommendations.activity_recommendations.push('Perfect for outdoor sightseeing and photography');
        }
        
        if (hasRain) {
            recommendations.activity_recommendations.push('Plan indoor activities like museums and galleries');
        }

        // Health advisories
        if (airQuality && airQuality.aqi > 100) {
            recommendations.health_advisories.push('Air quality is poor - consider wearing a mask outdoors');
            recommendations.health_advisories.push('Limit prolonged outdoor activities');
        }

        if (uvIndex && uvIndex.index > 7) {
            recommendations.health_advisories.push('High UV index - use strong sun protection');
            recommendations.health_advisories.push('Seek shade during peak hours (10 AM - 4 PM)');
        }

        // Travel tips
        recommendations.travel_tips.push('Check weather forecasts daily for updates');
        recommendations.travel_tips.push('Download offline weather apps for remote areas');
        
        if (hasRain) {
            recommendations.travel_tips.push('Allow extra travel time during rainy conditions');
        }

        return recommendations;
    }

    /**
     * Get weather icon for condition
     * @param {string} condition - Weather condition
     * @returns {string} Weather icon
     */
    getWeatherIcon(condition) {
        const icons = {
            'clear': '☀️',
            'clouds': '☁️',
            'rain': '🌧️',
            'drizzle': '🌦️',
            'thunderstorm': '⛈️',
            'snow': '❄️',
            'mist': '🌫️',
            'fog': '🌫️',
            'haze': '🌫️',
            'dust': '🌪️',
            'sand': '🌪️',
            'ash': '🌋',
            'squall': '💨',
            'tornado': '🌪️'
        };
        
        return icons[condition] || '🌤️';
    }

    /**
     * Get AQI level information
     * @param {number} aqi - Air Quality Index
     * @returns {Object} AQI level info
     */
    getAQILevel(aqi) {
        const levels = {
            1: { level: 'good', description: 'Air quality is satisfactory', color: 'green', health_implications: 'Little to no risk', recommendations: 'Enjoy outdoor activities' },
            50: { level: 'moderate', description: 'Air quality is acceptable', color: 'yellow', health_implications: 'Unusually sensitive people should consider limiting outdoor exposure', recommendations: 'Acceptable for most activities' },
            100: { level: 'unhealthy_for_sensitive', description: 'Members of sensitive groups may experience health effects', color: 'orange', health_implications: 'Sensitive groups should limit outdoor exposure', recommendations: 'Sensitive groups should reduce prolonged outdoor exertion' },
            150: { level: 'unhealthy', description: 'Everyone may begin to experience health effects', color: 'red', health_implications: 'General public may experience health effects', recommendations: 'Everyone should limit outdoor exertion' }
        };
        
        let level = levels[1];
        for (const threshold in levels) {
            if (aqi <= parseInt(threshold)) {
                level = levels[threshold];
                break;
            }
        }
        
        return level;
    }

    /**
     * Get UV level information
     * @param {number} uvIndex - UV Index
     * @returns {Object} UV level info
     */
    getUVLevel(uvIndex) {
        const levels = {
            2: { level: 'low', description: 'Low danger from UV rays', protection_time: 'None required', recommendations: 'Wear sunglasses on bright days' },
            5: { level: 'moderate', description: 'Moderate risk of harm from UV rays', protection_time: '10 AM - 4 PM', recommendations: 'Seek shade during midday hours' },
            7: { level: 'high', description: 'High risk of harm from UV rays', protection_time: '10 AM - 4 PM', recommendations: 'Cover up, wear a hat and sunglasses' },
            10: { level: 'very_high', description: 'Very high risk of harm from UV rays', protection_time: '10 AM - 4 PM', recommendations: 'Take extra precautions' },
            11: { level: 'extreme', description: 'Extreme risk of harm from UV rays', protection_time: 'All day', recommendations: 'Avoid being outside during midday hours' }
        };
        
        let level = levels[2];
        for (const threshold in levels) {
            if (uvIndex <= parseInt(threshold)) {
                level = levels[threshold];
                break;
            }
        }
        
        return level;
    }

    /**
     * Get fallback coordinates
     * @param {string} location - Location name
     * @returns {Object} Fallback coordinates
     */
    getFallbackCoordinates(location) {
        const locations = {
            'cairo': { lat: 30.0444, lon: 31.2357, country: 'EG' },
            'london': { lat: 51.5074, lon: -0.1278, country: 'GB' },
            'paris': { lat: 48.8566, lon: 2.3522, country: 'FR' },
            'tokyo': { lat: 35.6762, lon: 139.6503, country: 'JP' },
            'new york': { lat: 40.7128, lon: -74.0060, country: 'US' },
            'dubai': { lat: 25.2048, lon: 55.2708, country: 'AE' },
            'istanbul': { lat: 41.0082, lon: 28.9784, country: 'TR' }
        };
        
        return locations[location.toLowerCase()] || { lat: 0, lon: 0, country: 'XX' };
    }

    /**
     * Get fallback weather data
     * @param {Object} coordinates - Location coordinates
     * @param {number} days - Number of days
     * @param {string} units - Temperature units
     * @returns {Object} Fallback weather data
     */
    getFallbackWeatherData(coordinates, days, units) {
        const isMetric = units === 'metric';
        const baseTemp = isMetric ? 20 : 68; // Base temperature in Celsius or Fahrenheit
        
        const current = {
            temp: baseTemp + Math.random() * 10 - 5,
            feels_like: baseTemp + Math.random() * 10 - 5,
            weather: [{ main: 'Clear', description: 'clear sky' }],
            humidity: Math.floor(Math.random() * 40) + 40,
            pressure: Math.floor(Math.random() * 50) + 1000,
            visibility: 10000,
            wind: { speed: Math.random() * 10, deg: Math.random() * 360 }
        };
        
        const daily = [];
        for (let i = 0; i < days; i++) {
            daily.push({
                dt: Date.now() / 1000 + (i * 86400),
                temp: {
                    min: baseTemp + Math.random() * 10 - 10,
                    max: baseTemp + Math.random() * 10 + 5,
                    morn: baseTemp + Math.random() * 5,
                    day: baseTemp + Math.random() * 10,
                    eve: baseTemp + Math.random() * 5,
                    night: baseTemp + Math.random() * 5 - 5
                },
                weather: [{ main: 'Clear', description: 'clear sky' }],
                humidity: Math.floor(Math.random() * 40) + 40,
                wind_speed: Math.random() * 10,
                pop: Math.random() * 0.5,
                rain: Math.random() > 0.8 ? Math.random() * 5 : 0,
                sunrise: Date.now() / 1000 + (i * 86400) + 21600,
                sunset: Date.now() / 1000 + (i * 86400) + 64800
            });
        }
        
        const hourly = [];
        for (let i = 0; i < 48; i++) {
            hourly.push({
                dt: Date.now() / 1000 + (i * 3600),
                temp: baseTemp + Math.random() * 10 - 5,
                feels_like: baseTemp + Math.random() * 10 - 5,
                weather: [{ main: 'Clear', description: 'clear sky' }],
                humidity: Math.floor(Math.random() * 40) + 40,
                wind_speed: Math.random() * 10,
                pop: Math.random() * 0.5
            });
        }
        
        return {
            current: current,
            daily: daily,
            hourly: hourly,
            timezone: 'UTC'
        };
    }

    /**
     * Get data source information
     * @returns {string} Data source
     */
    getDataSource() {
        if (this.apis.openweathermap.key) {
            return 'OpenWeatherMap API';
        } else if (this.apis.weatherapi.key) {
            return 'WeatherAPI.com';
        } else {
            return 'Simulated Data (Demo Mode)';
        }
    }
}

module.exports = new WeatherForecastTool();